# CLAUDE.md

This file provides guidance to AI coding assistants (Claude Code, Cursor, GitHub Copilot, and other tools that read repo-root context files) when working with code in this repository.

## What this repo is

The **Dapr Quickstarts and Tutorials** — runnable, doc-driven samples that teach Dapr building block APIs (pub/sub, state, service invocation, bindings, secrets, actors, configuration, cryptography, resiliency, jobs, workflows, conversation/AI) across five language SDKs. Each sample is self-contained and is validated end-to-end in CI. These samples back the [Dapr docs Quickstarts](https://docs.dapr.io/getting-started/quickstarts/) and are often a reader's *first* hands-on experience with Dapr, so clarity for newcomers, correctness, and consistency matter far more than cleverness.

## The single most important convention: the README *is* the test

Every quickstart's `README.md` is an executable document. `make validate` runs [`mechanical-markdown`](https://github.com/dapr/mechanical-markdown) (`mm.py`) over the README: it executes the shell commands inside `<!-- STEP ... -->` / `<!-- END_STEP -->` blocks and asserts that the program's output matches the annotated expectations. CI runs exactly this. Consequences:

- **A quickstart with no validated STEP blocks is not done.** New or changed behavior must be reflected in STEP annotations, or CI won't actually exercise it.
- **Outputs must be deterministic.** Samples are wired to deterministic components (e.g. the `conversation.echo` component, fixed message loops) so `expected_stdout_lines` is stable. Don't assert on values that vary run-to-run.
- **Editing prose is fine; editing commands or expected output means re-validating.** If you touch a fenced command block or the program it runs, re-run `make validate` for that quickstart.

A STEP block looks like this — the keys are the contract CI checks:

```markdown
<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Published data: {"orderId":1}'
  - 'Subscriber received: {"orderId":1}'
expected_stderr_lines:
output_match_mode: substring   # match substrings, not whole lines
match_order: none              # lines may appear in any order
background: true               # run async (long-lived `dapr run`)
sleep: 15                      # wait before checking output
timeout_seconds: 30            # then tear the process down
-->

​```bash
dapr run -f .
​```

<!-- END_STEP -->
```

Long-running `dapr run` commands use `background: true` and are paired with a later `dapr stop` STEP. The "Run individually" sections of READMEs are usually plain (non-STEP) examples for humans; the validated path is the `dapr run -f .` multi-app section.

## Anatomy of a quickstart

An individual quickstart contains:

- `README.md` — the validated walkthrough (the test; see above).
- `makefile` — boilerplate that includes `docker.mk` + `validate.mk` (no custom logic lives here).
- `dapr.yaml` — the multi-app run template.
- One or more app folders — the actual sample code.
- A shared `components/` directory with the Dapr component YAML the sample uses, referenced by relative path rather than duplicated per language.

Two cross-cutting conventions:

- **`http` vs `sdk` variants**: `http` calls Dapr's APIs over plain HTTP; `sdk` uses the language's Dapr SDK. Many samples ship both.
- **Coverage is intentionally uneven.** Not every building block is implemented in every language or variant (an SDK may not support a feature yet). Mirror what comparable samples already do rather than assuming a full matrix.

## Commands

Run from a **single quickstart directory** (e.g. `cd pub_sub/python/sdk`):
```sh
make validate          # run mechanical-markdown over README.md (the real test)
```

Run from the **repo root** to validate everything for a language:
```sh
make test_python_quickstarts       # also: go | csharp | java | javascript
make test_all_quickstarts          # every language
```
These iterate the top-level building-block directories and run `make validate` in each `<lang>/http` and `<lang>/sdk` they find (Python wraps each in a throwaway `.venv`).

Bump SDK versions across all quickstarts (then verify + re-validate before committing):
```sh
make update_python_sdk_version DAPR_VERSION=1.16.0 FASTAPI_VERSION=1.16.0 WORKFLOW_VERSION=1.16.0
make update_gosdk_version VERSION=v1.16.0          # Go version MUST start with 'v'
make update_dotnet_sdk_version VERSION=1.15.0
make update_java_sdk_version VERSION=1.12.0
make update_javascript_sdk_version VERSION=3.4.0
```

## Prerequisites for validating locally

- **Dapr CLI + initialized runtime**: `dapr init` (pinned versions live in `.github/env/global.env`).
- **mechanical-markdown**: `uv tool install mechanical-markdown` (or `pip install mechanical-markdown`) so `mm.py` is on PATH. `make validate` will attempt to `pip install` it if missing.
- **A container runtime** (Docker or Podman) for samples that use real components — e.g. pub/sub defaults to a local Redis (`pubsub.redis` at `localhost:6379`) provisioned by `dapr init`.
- **Language toolchain** for the variant you touch (see below).
- Samples backed by a real LLM (conversation/AI) expect **Ollama** with a pulled model in CI; the default `conversation.echo` component needs nothing.

## Per-language toolchain notes

- **Python**: nearly all building-block quickstarts are uv-managed — `pyproject.toml` + `uv.lock` + `.python-version`, deps installed with `uv sync`, commands run via `uv run` (e.g. `uv run dapr run -f .`); `mise.local.toml` pins Python + uv. The migration isn't 100%: a few samples still use `requirements.txt` with `dapr>=` / `dapr-ext-fastapi>=` / `dapr-ext-workflow>=` pins — currently `jobs/python/sdk` and the `tutorials/workflow/python/*` tutorials. The Python version-bump target edits that legacy style. Match whichever style the sibling samples use.
- **Go**: `go.mod` per app, depends on `github.com/dapr/go-sdk`. SDK versions are `v`-prefixed.
- **JavaScript**: npm per app (`npm install`, `npm run start`), `@dapr/dapr` SDK.
- **Java**: Maven `pom.xml`, `io.dapr:dapr-sdk`.
- **C#**: `.csproj`, `Dapr.*` NuGet packages, run via `dotnet run`.

## Conventions when authoring or changing a quickstart

**The audience is newcomers, and teaching them is the whole point.** A reader is here to learn one thing — how a building block works, or how to use it from a particular SDK — and not much else. Optimize relentlessly for that: a quickstart must be **easy to read, easy to follow, and low cognitive load**, so the concept actually lands. Favor the smallest, clearest, fully-runnable demonstration of a single idea over completeness or cleverness. Every extra app, dependency, config knob, abstraction, or unexplained step is friction between the reader and the lesson — cut it. Keep code obvious over idiomatic-but-dense, name things plainly, and make the README walk the reader through *why*, not just *what*.

Before scaffolding, **confirm which languages and variants are in scope** — don't assume a full matrix; build what's asked and what the SDK actually supports.

When adding code, hold to the patterns already present across the repo (browse a few comparable quickstarts for the exact shape):

- **`makefile`** is boilerplate — it only includes the repo's shared `docker.mk` and `validate.mk` (via relative path). Don't add custom logic here; build/run steps belong in README STEP blocks.
- **`dapr.yaml`** is the multi-app run template: `version: 1`, `common.resourcesPath` pointing at the shared `components/` dir, and an `apps:` list with `appID`, `appDirPath`, `command`, and `appPort` where needed.
- **`resourcesPath` / `--resources-path` is relative to where it's resolved, not to the repo root.** The value in `dapr.yaml` is relative to the `dapr.yaml` file; a `--resources-path` passed to an individual `dapr run` is relative to the directory you launch it from (often an app subfolder, i.e. one level deeper). Count the `../` carefully or the components won't load.
- **App IDs are suffixed by variant**: `<role>-sdk` / `<role>-http` (e.g. `conversation-sdk`, `checkout-sdk`, `order-processor-http`).
- **README structure** follows a consistent shape: title + one-line intro, a link to the relevant Dapr docs page, a note cross-linking the http/sdk sibling, the validated "Run with multi-app template (`dapr run -f .`)" section using STEP blocks, then an optional non-validated "Run individually" section.
- Keep expected outputs **short and deterministic**, and always pair a backgrounded `dapr run` STEP with a `dapr stop` STEP.

## CI

Workflows in `.github/workflows/validate_<lang>_quickstarts.yaml` run on PRs to `master`/`release-*`. Each installs the pinned Dapr CLI/runtime from `.github/env/global.env`, the language toolchain, and `mechanical-markdown`, then loops the building-block quickstarts running `make validate`. To reproduce a CI failure locally, `cd` into the failing quickstart directory and run `make validate`. The repo-root `make validate` link-checks the top-level `README.md`.

`validate_tutorials.yaml` covers tutorials, but only `hello-world` and `hello-kubernetes` are actually enabled — the rest (including **all** of `tutorials/workflow/*`) are commented out because mechanical-markdown can't drive their long-running services. **Treat the workflow tutorials as untested by CI: validate them manually before relying on them.**

## Contributing constraints

- Commits must be **DCO signed off** (`git commit -s`); the DCO bot blocks unsigned PRs.
- Code changes require the corresponding README STEP validation to pass.
