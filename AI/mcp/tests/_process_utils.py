# -*- coding: utf-8 -*-
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
"""
Vendored from python-sdk/tests/process_utils.py — the helpers there are
private to the python-sdk test suite (empty tests/__init__.py, not exported
on PyPI), so we copy verbatim. Re-vendor if the upstream version changes.

``dapr run`` spawns ``daprd`` and the user's app as siblings, not as children.
Terminating only the immediate process can orphan them if the signal isn't
forwarded, leaving stale listeners on the test ports across runs.
Putting all the processes in the same group lets cleanup take them all down
together.
"""

from __future__ import annotations

import os
import signal
import subprocess
import sys
from typing import Any


def get_kwargs_for_process_group() -> dict[str, Any]:
    """Popen kwargs that place the child at the head of its own process group."""
    if sys.platform == "win32":
        return {"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP}
    return {"start_new_session": True}


def terminate_process_group(proc: subprocess.Popen[str], *, force: bool = False) -> None:
    """Sends the right termination signal to an entire process group."""
    if sys.platform == "win32":
        if force:
            proc.kill()
        else:
            proc.send_signal(signal.CTRL_BREAK_EVENT)
        return

    sig = signal.SIGKILL if force else signal.SIGTERM
    try:
        os.killpg(os.getpgid(proc.pid), sig)
    except ProcessLookupError:
        pass
