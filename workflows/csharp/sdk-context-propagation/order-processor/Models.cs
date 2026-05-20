// ------------------------------------------------------------------------
// Copyright 2026 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------------------

namespace OrderProcessor;

/// <summary>
/// Patient record propagated through the workflow hierarchy. In a real
/// deployment the Name / DOB / MRN fields are protected health info and
/// would be candidates for redaction when the record is propagated downstream.
/// </summary>
/// <param name="PatientId">Patient identifier.</param>
/// <param name="Name">Patient name.</param>
/// <param name="Dob">Date of birth (YYYY-MM-DD).</param>
/// <param name="Mrn">Medical record number.</param>
/// <param name="Condition">Diagnosis / indication.</param>
/// <param name="Medication">Prescribed drug name.</param>
/// <param name="Dosage">Dosage in milligrams.</param>
public sealed record PatientRecord(
    string PatientId,
    string Name,
    string Dob,
    string Mrn,
    string Condition,
    string Medication,
    double Dosage);

/// <summary>Result produced by the ComplianceAudit workflow.</summary>
/// <param name="Compliant">Whether the prescription cleared compliance.</param>
/// <param name="RiskScore">Risk score in the range [0, 1].</param>
/// <param name="Reason">Human-readable decision rationale.</param>
/// <param name="EventCount">Number of propagated history segments inspected.</param>
public sealed record ComplianceResult(
    bool Compliant,
    double RiskScore,
    string Reason,
    int EventCount);

/// <summary>Result produced by the DispenseMedication activity.</summary>
/// <param name="DispenseId">Pharmacy dispense identifier.</param>
/// <param name="Status">Dispense status string.</param>
/// <param name="EventCount">Number of propagated history events inspected.</param>
public sealed record DispenseResult(
    string DispenseId,
    string Status,
    int EventCount);
