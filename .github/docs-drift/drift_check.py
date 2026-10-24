#!/usr/bin/env python3
"""Compare the shell commands of each language tab of a Dapr docs page with the README of the mapped sample.

Usage:
  drift_check.py [--pages FILE] [--allow FILE] [--repo DIR] [--only PATH] [--page-file FILE] [--tsv FILE]

  --pages      page list (default: pages.txt next to this script)
  --allow      allow-list (default: allow-list.txt next to this script)
  --repo       root of the quickstarts repository (default: two folders above this script)
  --only       check only the page list entry with this page path
  --page-file  read the page from this local file instead of the network (needs --only, or a page list
               with one entry). Use it to test a docs change before it is published.
  --tsv        also write the result rows to this file

For each tab of a page, the script reads the commands in the fenced shell blocks of the tab (expected-output
blocks are skipped) and the commands in the README <!-- STEP --> blocks (the commands that CI runs) and in
all README shell blocks. A command of the page is:
  same              in a README STEP block
  readme-only-text  in a README shell block outside the STEP blocks
  setup             the `git clone` of this repository, or the `cd` into the sample folder (the README
                    starts in that folder)
  allowed           in the allow-list
  docs-only         not in the README. This row fails the check.
A README STEP command that the page does not have is "readme-only" (information only).
A tab that the page does not have is "no-tab" and fails the check.

Exit code: 0 no drift, 1 drift, 2 the script could not read a page, a README or a list file.
Output: TSV rows (page, tab, kind, command, docs line). Python 3 standard library only.
"""
import argparse
import os
import re
import sys
import urllib.error
import urllib.request

RAW = "https://raw.githubusercontent.com/dapr/docs/{branch}/daprdocs/content/en/{path}"
FENCE = re.compile(r"^\s*```\s*(\w*)\s*$")
TAB = re.compile(r'\{\{%\s*tab\s+"([^"]+)"\s*%\}\}')
ENDTAB = re.compile(r"\{\{%\s*/tab\s*%\}\}")
SHELL = {"sh", "bash", "shell", "console", "zsh", ""}
CLONE = re.compile(r"^git clone (--depth[ =]1 )?https://github\.com/dapr/quickstarts(\.git)?$")


class Fatal(Exception):
    pass


def norm(c):
    c = c.strip()
    c = re.sub(r"^\$\s+", "", c)
    return re.sub(r"\s+", " ", c)


def blocks(lines, start=0, end=None):
    """Yield (line number, language, [commands]) for the fenced blocks in lines[start:end]."""
    end = len(lines) if end is None else end
    i = start
    while i < end:
        if not FENCE.match(lines[i]):
            i += 1
            continue
        lang, j, body = FENCE.match(lines[i]).group(1).lower(), i + 1, []
        while j < end and not FENCE.match(lines[j]):
            body.append(lines[j])
            j += 1
        prev = next((lines[k] for k in range(i - 1, max(-1, i - 4), -1) if lines[k].strip()), "")
        is_output = "output" in prev.lower() or sum(1 for b in body if b.lstrip().startswith("== ")) > len(body) / 2
        if is_output:
            i = j + 1
            continue
        cmds, cont = [], ""
        for b in body:
            b = b.rstrip("\n")
            if b.rstrip().endswith("\\"):
                cont += b.rstrip()[:-1] + " "
                continue
            b = cont + b
            cont = ""
            if b.strip() and not b.strip().startswith("#"):
                cmds.append(norm(b))
        yield i + 1, lang, cmds
        i = j + 1


def read_lines(path):
    try:
        with open(path, errors="ignore") as f:
            return [ln.strip() for ln in f if ln.strip() and not ln.lstrip().startswith("#")]
    except OSError as e:
        raise Fatal(f"cannot read {path}: {e}")


def parse_pages(path):
    pages = []
    for ln in read_lines(path):
        parts = [p.strip() for p in ln.split("|")]
        if len(parts) != 3 or not all(parts):
            raise Fatal(f"{path}: bad line (need 'branch | path | Tab=folder, ...'): {ln}")
        tabs = {}
        for item in parts[2].split(","):
            if "=" not in item:
                raise Fatal(f"{path}: bad tab map '{item.strip()}' in: {ln}")
            k, v = item.split("=", 1)
            tabs[k.strip()] = v.strip().strip("/")
        pages.append((parts[0], parts[1], tabs))
    return pages


def parse_allow(path):
    allow = []
    for ln in read_lines(path):
        parts = [p.strip() for p in ln.split("|", 1)]
        if len(parts) != 2 or not all(parts):
            raise Fatal(f"{path}: bad line (need 'Tab | command'): {ln}")
        allow.append((parts[0], norm(parts[1])))
    return allow


def fetch(branch, path):
    url = RAW.format(branch=branch, path=path)
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return r.read().decode("utf-8", "ignore").splitlines(keepends=True)
    except (urllib.error.URLError, OSError) as e:
        raise Fatal(f"cannot fetch {url}: {e}")


def find_tabs(page):
    tabs, cur = {}, None
    for i, line in enumerate(page):
        m = TAB.search(line)
        if m:
            cur = (m.group(1), i)
        elif ENDTAB.search(line) and cur:
            tabs[cur[0]] = (cur[1], i)
            cur = None
    return tabs


def readme_commands(repo, folder):
    d = os.path.join(repo, folder)
    try:
        name = next(n for n in os.listdir(d) if n.lower() == "readme.md")
    except (OSError, StopIteration):
        raise Fatal(f"no README.md in {d}")
    rl = open(os.path.join(d, name), errors="ignore").readlines()
    regions, st = [], None
    for i, line in enumerate(rl):
        if "<!-- STEP" in line:
            st = i
        elif "<!-- END_STEP" in line and st is not None:
            regions.append((st, i))
            st = None
    step = [c for a, b in regions for _, lang, cmds in blocks(rl, a, b) if lang in SHELL for c in cmds]
    every = [c for _, lang, cmds in blocks(rl) if lang in SHELL for c in cmds]
    return step, every


def check_page(branch, path, tabmap, page, repo, allow, out):
    drift = False
    tabs = find_tabs(page)
    for tab, folder in tabmap.items():
        if tab == "*":
            rng = (0, len(page))
        elif tab in tabs:
            rng = tabs[tab]
        else:
            out.append((path, tab, "no-tab", "-", "-"))
            drift = True
            continue
        docs = [(ln, c) for ln, lang, cmds in blocks(page, *rng) if lang in SHELL for c in cmds]
        step, every = readme_commands(repo, folder)
        cd = re.compile(r"^cd (\./)?(quickstarts/)?" + re.escape(folder) + r"(/[\w.-]+)?/?$")
        for ln, c in docs:
            if CLONE.match(c) or cd.match(c):
                kind = "setup"
            elif c in step:
                kind = "same"
            elif c in every:
                kind = "readme-only-text"
            elif any(t in ("*", tab) and c == a for t, a in allow):
                kind = "allowed"
            else:
                kind = "docs-only"
                drift = True
            out.append((path, tab, kind, c, str(ln)))
        have = {c for _, c in docs}
        for c in step:
            if c not in have:
                out.append((path, tab, "readme-only", c, "-"))
    return drift


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pages", default=os.path.join(here, "pages.txt"))
    ap.add_argument("--allow", default=os.path.join(here, "allow-list.txt"))
    ap.add_argument("--repo", default=os.path.abspath(os.path.join(here, "..", "..")))
    ap.add_argument("--only")
    ap.add_argument("--page-file")
    ap.add_argument("--tsv")
    a = ap.parse_args()
    try:
        pages, allow = parse_pages(a.pages), parse_allow(a.allow)
        if a.only:
            pages = [p for p in pages if p[1] == a.only]
            if not pages:
                raise Fatal(f"no page list entry for {a.only}")
        if a.page_file and len(pages) != 1:
            raise Fatal("--page-file needs exactly one page (use --only)")
        out, drift = [], False
        for branch, path, tabmap in pages:
            if a.page_file:
                try:
                    page = open(a.page_file, errors="ignore").readlines()
                except OSError as e:
                    raise Fatal(f"cannot read {a.page_file}: {e}")
            else:
                page = fetch(branch, path)
            drift |= check_page(branch, path, tabmap, page, a.repo, allow, out)
    except Fatal as e:
        print(f"drift_check: {e}", file=sys.stderr)
        return 2
    rows = ["page\ttab\tkind\tcommand\tdocs_line"] + ["\t".join(r) for r in out]
    print("\n".join(rows))
    if a.tsv:
        with open(a.tsv, "w") as f:
            f.write("\n".join(rows) + "\n")
    bad = [r for r in out if r[2] in ("docs-only", "no-tab")]
    for r in bad:
        print(f"::error::docs drift: {r[0]} tab {r[1]}: {r[2]}: {r[3]} (docs line {r[4]})", file=sys.stderr)
    print(f"drift_check: {len(pages)} page(s), {len(bad)} drift row(s)", file=sys.stderr)
    return 1 if drift else 0


if __name__ == "__main__":
    sys.exit(main())
