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

"""Data models for the workflow history propagation quickstart."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass


@dataclass
class PatientRecord:
    """A patient intake submitted by the front desk.

    Name/DOB/MRN are protected health information (PHI) in a real deployment
    and would be candidates for redaction when propagated downstream — a
    future addition for history propagation. `forward_lineage` controls
    whether PrescribeMedication propagates its own history to the
    DispenseMedication activity.
    """

    patient_id: str
    name: str
    dob: str
    mrn: str
    condition: str
    medication: str
    dosage: float
    forward_lineage: bool

    def to_json(self) -> str:
        return json.dumps(asdict(self))

    @classmethod
    def from_json(cls, data: str) -> 'PatientRecord':
        return cls(**json.loads(data))


@dataclass
class ComplianceResult:
    """Output of the ComplianceAudit child workflow."""

    compliant: bool
    risk_score: float
    reason: str
    event_count: int

    def to_json(self) -> str:
        return json.dumps(asdict(self))

    @classmethod
    def from_json(cls, data: str) -> 'ComplianceResult':
        return cls(**json.loads(data))


@dataclass
class DispenseResult:
    """Output of the DispenseMedication activity.

    `status` is ``"dispensed"`` when the pharmacy filled the prescription, or
    ``"refused"`` when it could not verify the prescribing pipeline in the
    propagated history (``reason`` explains what was missing).
    """

    dispense_id: str
    status: str
    reason: str
    event_count: int

    def to_json(self) -> str:
        return json.dumps(asdict(self))

    @classmethod
    def from_json(cls, data: str) -> 'DispenseResult':
        return cls(**json.loads(data))
