#!/usr/bin/env bash
#
# Copyright 2026 The Dapr Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Usage: tutorials/workflow/validate.sh <lang> <topic>
#   <lang>   python | csharp | go | java
#   <topic>  a folder name under tutorials/workflow/<lang>, for example fundamentals
#
# What it does:
#   1. Builds the tutorial (python: uv venv + uv pip install, csharp: dotnet build, go: go build).
#   2. Starts it. python, csharp and go: `dapr run -f <run file>`. java: `mvn spring-boot:test-run`.
#   3. Sends the requests of the topic's .http file, in order. It reads the `@var = value` lines,
#      the `###` request blocks, the `# @name` names, and the `{{var}}`, `{{$guid}}`,
#      `{{name.response.headers.X}}` and `{{name.response.body.<path>}}` references.
#   4. Checks every instance that a request started through GET /v1.0/workflows/dapr/<id>.
#      An instance must reach COMPLETED. An instance that the .http file purges must be gone.
#   5. Stops everything that it started and prints one RESULT line per instance.
# A topic with no .http file (an app that runs its scenarios and exits) is checked on the app output.
#
# It does not start the Dapr control plane. Before a python, csharp or go topic, the Scheduler and
# Placement services must run (the "Run the tutorials without Docker" section of the language
# README starts them) and, for combined-patterns, Redis on localhost:6379.
# Java topics start their own Dapr with Testcontainers and need a running Docker daemon.
#
# Environment:
#   VALIDATE_RUN_FILE  force the run file (default: dapr-sqlite.yaml when present, otherwise dapr.yaml)
#   VALIDATE_TIMEOUT   seconds that an instance may take to reach COMPLETED (default 180)
#   VALIDATE_LOG_DIR   where the app logs go (default: a new temporary folder)
# Exit code: 0 when every instance passes, 1 when one fails, 2 for a usage error.

set -u

LANG_=${1:-}
TOPIC=${2:-}
[ -n "$LANG_" ] && [ -n "$TOPIC" ] || { echo "usage: $0 <python|csharp|go|java|javascript> <topic>" >&2; exit 2; }

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DIR=$HERE/$LANG_/$TOPIC
[ -d "$DIR" ] || { echo "no such folder: $DIR" >&2; exit 2; }
TIMEOUT=${VALIDATE_TIMEOUT:-180}
LOGDIR=${VALIDATE_LOG_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/validate-$LANG_-$TOPIC.XXXXXX")}
mkdir -p "$LOGDIR"

say() { echo "[validate] $*"; }
fail() { say "FAIL: $*"; exit 1; }

# One process group per started app, so that cleanup stops the children too.
PIDS=()
cleanup() {
  local p
  for p in "${PIDS[@]:-}"; do [ -n "$p" ] && kill -INT -- "-$p" 2>/dev/null; done
  for _ in $(seq 1 20); do
    local alive=0
    for p in "${PIDS[@]:-}"; do [ -n "$p" ] && kill -0 "$p" 2>/dev/null && alive=1; done
    [ "$alive" = 0 ] && break
    sleep 0.5
  done
  for p in "${PIDS[@]:-}"; do [ -n "$p" ] && kill -9 -- "-$p" 2>/dev/null; done
  if [ "$LANG_" = java ] && command -v docker > /dev/null 2>&1; then
    local c; c=$(docker ps -aq --filter label=org.testcontainers=true 2>/dev/null)
    [ -n "$c" ] && docker rm -f $c > /dev/null 2>&1
  fi
  return 0
}
trap cleanup EXIT
trap 'exit 130' INT TERM

# start <name> <folder> <command...>: run a command in its own process group, log to $LOGDIR/<name>.log.
start() {
  local name=$1 dir=$2; shift 2
  say "start $name in ${dir#$HERE/}: $*"
  ( cd "$dir" && exec setsid "$@" ) > "$LOGDIR/$name.log" 2>&1 < /dev/null &
  PIDS+=("$!")
}

wait_port() {  # wait_port <port> <seconds>
  local end=$(( $(date +%s) + $2 ))
  while [ "$(date +%s)" -lt "$end" ]; do
    (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null && return 0
    for pid in "${PIDS[@]:-}"; do [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null && return 1; done
    sleep 0.5
  done
  return 1
}
wait_healthz() {  # wait_healthz <dapr http port> <seconds>
  local end=$(( $(date +%s) + $2 )) code
  while [ "$(date +%s)" -lt "$end" ]; do
    code=$(curl -s -o /dev/null -m 3 -w '%{http_code}' "http://localhost:$1/v1.0/healthz")
    case "$code" in 2*) return 0;; esac
    sleep 0.5
  done
  return 1
}
show_logs() {
  local f
  for f in "$LOGDIR"/*.log; do [ -f "$f" ] && { say "--- tail of $f"; tail -n 40 "$f"; }; done
}

# --- Find the run folder. csharp/versioning keeps its files in a Versioning subfolder.
APP=$DIR
if [ ! -f "$APP/dapr.yaml" ] && [ "$LANG_" != java ]; then
  nested=$(find "$DIR" -mindepth 2 -maxdepth 2 -name dapr.yaml -print | head -n 2)
  [ "$(echo "$nested" | wc -l)" = 1 ] && [ -n "$nested" ] && APP=$(dirname "$nested")
fi

HTTP_FILE=$(find "$APP" -maxdepth 1 -name '*.http' -print | head -n 1)
[ -z "$HTTP_FILE" ] && HTTP_FILE=$(find "$APP" -maxdepth 2 -name '*.http' -print | head -n 1)

# --- Build, then start.
APP_PORTS=""
DAPR_PORTS=""
case "$LANG_" in
  python)
    reqs=""
    for r in $(find "$APP" -maxdepth 2 -name requirements.txt | sort); do reqs="$reqs -r $r"; done
    [ -n "$reqs" ] || fail "no requirements.txt under $APP"
    ( cd "$APP" && uv venv && uv pip install $reqs ) > "$LOGDIR/build.log" 2>&1 || { show_logs; fail "uv venv or uv pip install failed"; }
    ;;
  csharp)
    for p in $(find "$APP" -maxdepth 2 -name '*.csproj' | sort); do
      ( cd "$(dirname "$p")" && dotnet build ) > "$LOGDIR/build-$(basename "$p").log" 2>&1 || { show_logs; fail "dotnet build failed for $p"; }
    done
    ;;
  go)
    ( cd "$APP" && go build ./... ) > "$LOGDIR/build.log" 2>&1 || { show_logs; fail "go build failed"; }
    ;;
  javascript)
    for p in $(find "$APP" -maxdepth 2 -name package.json -not -path '*/node_modules/*' | sort); do
      d=$(dirname "$p")
      ( cd "$d" && if [ -f package-lock.json ]; then npm ci; else npm install; fi \
          && if grep -q '"build"' package.json; then npm run build; fi ) > "$LOGDIR/build-$(basename "$d").log" 2>&1 \
        || { show_logs; fail "npm install or npm run build failed in $d"; }
    done
    ;;
esac

if [ "$LANG_" = java ]; then
  if [ -d "$APP/workflow-app" ] && [ -d "$APP/shipping-app" ]; then
    # The README of combined-patterns: reuse the Testcontainers Dapr containers across the two apps.
    grep -qs 'testcontainers.reuse.enable=true' "$HOME/.testcontainers.properties" 2>/dev/null \
      || echo 'testcontainers.reuse.enable=true' >> "$HOME/.testcontainers.properties"
    # Start the second app after the first one is up, as the README does: both apps create the
    # same Testcontainers network and Redis container.
    start workflow-app "$APP/workflow-app" mvn clean -Dspring-boot.run.arguments="--reuse=true" spring-boot:test-run
    wait_port 8080 900 || { show_logs; fail "app port 8080 did not open in 900 s"; }
    start shipping-app "$APP/shipping-app" mvn clean -Dspring-boot.run.arguments="--reuse=true" spring-boot:test-run
    APP_PORTS="8080 8081"
  else
    start app "$APP" mvn spring-boot:test-run
    APP_PORTS="8080"
  fi
  DAPR_PORTS=docker
  WAIT=900
else
  RUN_FILE=${VALIDATE_RUN_FILE:-}
  if [ -z "$RUN_FILE" ]; then
    if [ -f "$APP/dapr-sqlite.yaml" ]; then RUN_FILE=dapr-sqlite.yaml; else RUN_FILE=dapr.yaml; fi
  fi
  [ -f "$APP/$RUN_FILE" ] || fail "no run file $APP/$RUN_FILE"
  APP_PORTS=$(sed -n 's/^[[:space:]]*appPort:[[:space:]]*\([0-9]*\).*/\1/p' "$APP/$RUN_FILE" | tr '\n' ' ')
  DAPR_PORTS=$(sed -n 's/^[[:space:]]*daprHTTPPort:[[:space:]]*\([0-9]*\).*/\1/p' "$APP/$RUN_FILE" | paste -sd, -)
  if [ "$LANG_" = python ]; then
    start app "$APP" uv run dapr run -f "$RUN_FILE"
  else
    start app "$APP" dapr run -f "$RUN_FILE"
  fi
  WAIT=180
fi

# --- A topic with no .http file runs its scenarios and exits (history propagation).
if [ -z "$HTTP_FILE" ]; then
  say "no .http file in ${APP#$HERE/}: checking the app output"
  APPLOG=$LOGDIR/app.log
  end=$(( $(date +%s) + 300 ))
  while [ "$(date +%s)" -lt "$end" ]; do
    grep -q 'SCENARIO 2' "$APPLOG" 2>/dev/null && grep -qE 'REFUSED' "$APPLOG" 2>/dev/null && break
    kill -0 "${PIDS[0]}" 2>/dev/null || break
    sleep 1
  done
  sleep 2
  rc=0
  check() {  # check <label> <fixed string>
    if grep -qF -- "$2" "$APPLOG"; then say "RESULT $TOPIC scenario=\"$1\" app output shows the expected result PASS"
    else say "RESULT $TOPIC scenario=\"$1\" expected line not found: $2 FAIL"; rc=1; fi
  }
  check "lineage forwarded" "[DispenseMedication] DISPENSED"
  check "lineage withheld" "[DispenseMedication] REFUSED"
  [ "$rc" = 0 ] || { show_logs; exit 1; }
  exit 0
fi

# --- Wait for the app ports and the sidecars.
for p in $APP_PORTS; do
  wait_port "$p" "$WAIT" || { show_logs; fail "app port $p did not open in $WAIT s"; }
done
for pid in "${PIDS[@]}"; do
  kill -0 "$pid" 2>/dev/null || { show_logs; fail "a started app exited before the requests"; }
done
if [ "$DAPR_PORTS" != docker ]; then
  for p in $(echo "$DAPR_PORTS" | tr ',' ' '); do
    wait_healthz "$p" 120 || { show_logs; fail "daprd on port $p is not healthy"; }
  done
fi

# --- Send the .http requests and check the instances.
export VALIDATE_HTTP_FILE=$HTTP_FILE VALIDATE_DAPR_PORTS=$DAPR_PORTS VALIDATE_TIMEOUT=$TIMEOUT VALIDATE_TOPIC=$TOPIC
python3 - <<'PYEOF'
import json, os, re, subprocess, sys, time, urllib.error, urllib.request, uuid

HTTP_FILE = os.environ["VALIDATE_HTTP_FILE"]
TOPIC = os.environ["VALIDATE_TOPIC"]
TIMEOUT = int(os.environ["VALIDATE_TIMEOUT"])
PORTS_ARG = os.environ["VALIDATE_DAPR_PORTS"]
TERMINAL = {"COMPLETED", "FAILED", "TERMINATED"}
# The status that an instance must have before the request of an action is sent.
PRE_STATE = {"suspend": "RUNNING", "resume": "SUSPENDED", "terminate": "RUNNING|SUSPENDED",
             "purge": "COMPLETED|FAILED|TERMINATED", "raiseEvent": "RUNNING", "event": "RUNNING"}


def log(msg):
    print("[validate] " + msg, flush=True)


# ---------------------------------------------------------------- the .http parser
class Unresolved(Exception):
    pass


def parse(path):
    variables, requests = {}, []
    cur, pending = None, None

    def finish():
        nonlocal cur
        if cur is not None:
            cur["body"] = "\n".join(cur["body"]).strip()
            requests.append(cur)
        cur = None

    with open(path, encoding="utf-8-sig") as f:
        lines = f.read().splitlines()
    for line in lines:
        s = line.strip()
        if s.startswith("###"):
            finish()
            continue
        m = re.match(r"^#\s*@name\s+(\S+)", s)
        if m:
            pending = m.group(1)
            continue
        m = re.match(r"^@(\w+)\s*=\s*(.*)$", s)
        if m:
            variables[m.group(1)] = m.group(2).strip()
            continue
        if s.startswith("#") or s.startswith("//"):
            continue
        if cur is None:
            m = re.match(r"^(GET|POST|PUT|DELETE|PATCH)\s+(.+?)(\s+HTTP/\d\S*)?$", s)
            if m:
                cur = {"method": m.group(1), "url": m.group(2), "name": pending, "headers": {}, "body": [], "state": "headers"}
                pending = None
            continue
        if s == "":
            cur["state"] = "body"
            if cur["body"]:
                cur["body"].append("")
            continue
        if cur["state"] == "headers":
            m = re.match(r"^([\w-]+)\s*:\s*(.*)$", s)
            if m:
                cur["headers"][m.group(1)] = m.group(2)
                continue
            cur["state"] = "body"
        cur["body"].append(line)
    finish()
    return variables, requests


variables, requests = parse(HTTP_FILE)
responses = {}
cache = {}


def lookup(name):
    parts = name.split(".")
    resp = responses.get(parts[0])
    if resp is None or len(parts) < 3 or parts[1] != "response":
        raise Unresolved(name)
    if parts[2] == "headers":
        key = ".".join(parts[3:]).lower()
        if key not in resp["headers"]:
            raise Unresolved(name)
        return resp["headers"][key]
    if parts[2] == "body":
        path = parts[3:]
        if not path or path == ["*"] or path == ["$"]:
            return resp["text"]
        node = resp["json"]
        for p in path:
            if p.startswith("$"):
                continue
            if isinstance(node, dict) and p in node:
                node = node[p]
            else:
                raise Unresolved(name)
        return node if isinstance(node, str) else json.dumps(node)
    raise Unresolved(name)


def resolve(text):
    def sub(m):
        key = m.group(1).strip()
        if key.startswith("$guid"):
            return str(uuid.uuid4())
        if key in variables:
            if key not in cache:
                cache[key] = resolve(variables[key])
            return cache[key]
        return lookup(key)
    return re.sub(r"\{\{(.+?)\}\}", sub, text)


# ---------------------------------------------------------------- the workflow API
def dapr_ports():
    ports = []
    if PORTS_ARG == "docker":
        try:
            out = subprocess.run(["docker", "ps", "--format", "{{.Image}} {{.Ports}}"], capture_output=True, text=True, timeout=20).stdout
        except Exception:
            out = ""
        for line in out.splitlines():
            if "daprd" in line:
                ports += re.findall(r"(\d+)->3500/tcp", line)
    else:
        ports += [p for p in PORTS_ARG.split(",") if p]
    for v in list(variables.values()):
        m = re.match(r"^http://localhost:(\d+)$", v)
        if m and "daprHost" in [k for k, val in variables.items() if val == v]:
            ports.append(m.group(1))
    return list(dict.fromkeys(ports))


def raw_get(url, timeout=10):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return 0, str(e)


def status_of(iid):
    """Return (port, runtimeStatus) for the first daprd that knows the instance, else (None, None)."""
    for port in dapr_ports():
        code, body = raw_get("http://localhost:%s/v1.0/workflows/dapr/%s" % (port, iid))
        if code == 200:
            try:
                return port, json.loads(body).get("runtimeStatus")
            except ValueError:
                pass
    return None, None


def wait_status(iid, want, timeout):
    end = time.time() + timeout
    st = None
    while time.time() < end:
        _, st = status_of(iid)
        if st and re.fullmatch(want, st):
            return st
        time.sleep(1)
    return st


# ---------------------------------------------------------------- the run
instances = []   # {"id", "cands", "purged", "label"}
START_RE = re.compile(r"/start(-[A-Za-z]+)?(/|\?|$)")


def candidates(resp, req_body):
    out = []
    j = resp["json"]
    if isinstance(j, dict):
        for k in ("instance_id", "instanceId", "instanceID", "id"):
            if isinstance(j.get(k), str):
                out.append(j[k])
    loc = resp["headers"].get("location")
    if loc:
        out.append(loc.rstrip("/").split("/")[-1])
    t = resp["text"].strip().strip('"')
    if re.fullmatch(r"[A-Za-z0-9_-]{6,80}", t):
        out.append(t)
    try:
        b = json.loads(req_body) if req_body else None
        if isinstance(b, dict) and isinstance(b.get("id"), str):
            out.append(b["id"])
    except ValueError:
        pass
    return list(dict.fromkeys(out))


def send(req, url, body):
    data = body.encode() if body else None
    r = urllib.request.Request(url, data=data, method=req["method"])
    for k, v in req["headers"].items():
        r.add_header(k, resolve(v))
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            code, headers, text = resp.status, dict(resp.headers), resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        code, headers, text = e.code, dict(e.headers), e.read().decode("utf-8", "replace")
    except Exception as e:
        code, headers, text = 0, {}, str(e)
    headers = {k.lower(): v for k, v in headers.items()}
    try:
        js = json.loads(text)
    except ValueError:
        js = None
    return code, {"headers": headers, "text": text.strip().strip('"') if js is None else text.strip(), "json": js}


failures = 0
for req in requests:
    is_start = "v1.0/workflows" not in req["url"] and bool(START_RE.search(req["url"]))
    if is_start:
        for inst in instances:
            if inst["id"]:
                wait_status(inst["id"], "COMPLETED|FAILED|TERMINATED", 120)
    try:
        url = resolve(req["url"])
        body = resolve(req["body"]) if req["body"] else ""
    except Unresolved as e:
        log("FAIL: cannot resolve %s in %s %s" % (e, req["method"], req["url"]))
        failures += 1
        continue
    # A transition request waits until the instance is in the state that the request needs.
    target = None
    for inst in instances:
        if inst["id"] and inst["id"] in url:
            target = inst
    for key, want in PRE_STATE.items():
        if re.search(r"/%s(/|$|\?)" % key, url):
            target = target or (instances[-1] if instances else None)
            if target and target["id"]:
                st = wait_status(target["id"], want, 60)
                log("before %s: instance %s is %s" % (key, target["id"], st))
                if key == "raiseEvent" or key == "event":
                    time.sleep(1)
            if key == "purge" and target:
                target["purged"] = True
            break
    attempts = 1 if req["method"] != "GET" or is_start else 40
    for n in range(attempts):
        code, resp = send(req, url, body)
        if 200 <= code < 300:
            break
        if n + 1 < attempts:
            time.sleep(3)
    log("%s %s -> %s %s" % (req["method"], url, code, resp["text"][:120].replace("\n", " ")))
    if not 200 <= code < 300:
        log("FAIL: %s %s returned %s" % (req["method"], url, code))
        failures += 1
        continue
    if req["name"]:
        responses[req["name"]] = resp
    if is_start:
        cands = candidates(resp, body)
        found = None
        end = time.time() + 60
        while time.time() < end and not found:
            for c in cands:
                if status_of(c)[1]:
                    found = c
                    break
            else:
                time.sleep(1)
        inst = {"id": found, "cands": cands, "purged": False}
        instances.append(inst)
        log("started instance %s (candidates %s)" % (found or "NOT FOUND", cands))
    time.sleep(1)

if not instances:
    log("FAIL: no request of %s started a workflow instance" % os.path.basename(HTTP_FILE))
    failures += 1

for inst in instances:
    iid = inst["id"] or (inst["cands"][0] if inst["cands"] else "?")
    if not inst["id"]:
        print("[validate] RESULT %s instance=%s status=none expected=COMPLETED FAIL (no daprd knows this id)" % (TOPIC, iid), flush=True)
        failures += 1
        continue
    if inst["purged"]:
        time.sleep(2)
        port, st = status_of(inst["id"])
        ok = st is None
        print("[validate] RESULT %s instance=%s status=%s expected=purged %s" % (TOPIC, iid, st or "gone", "PASS" if ok else "FAIL"), flush=True)
    else:
        st = wait_status(inst["id"], "COMPLETED|FAILED|TERMINATED", TIMEOUT)
        ok = st == "COMPLETED"
        print("[validate] RESULT %s instance=%s status=%s expected=COMPLETED %s" % (TOPIC, iid, st, "PASS" if ok else "FAIL"), flush=True)
    if not ok:
        failures += 1

sys.exit(1 if failures else 0)
PYEOF
rc=$?
if [ "$rc" != 0 ]; then show_logs; say "FAIL $LANG_/$TOPIC"; exit 1; fi
say "PASS $LANG_/$TOPIC"
exit 0
