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

namespace PatientIntake;

using Dapr.Workflow;

public sealed class VerifyInsuranceActivity : WorkflowActivity<PatientRecord, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext ctx, PatientRecord rec)
    {
        Console.WriteLine($"  [VerifyInsurance] Checking coverage for patient {rec.PatientId}");
        return Task.FromResult(true);
    }
}

public sealed class CheckAllergiesActivity : WorkflowActivity<PatientRecord, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext ctx, PatientRecord rec)
    {
        Console.WriteLine($"  [CheckAllergies] Screening {rec.PatientId} for {rec.Medication}");
        return Task.FromResult(true);
    }
}

public sealed class ScreenDrugInteractionsActivity : WorkflowActivity<PatientRecord, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext ctx, PatientRecord rec)
    {
        Console.WriteLine($"  [ScreenDrugInteractions] Screening {rec.Medication} {rec.Dosage:F0}mg for {rec.PatientId}");
        return Task.FromResult(true);
    }
}

public sealed class DispenseMedicationActivity : WorkflowActivity<PatientRecord, DispenseResult>
{
    public override Task<DispenseResult> RunAsync(WorkflowActivityContext ctx, PatientRecord rec)
    {
        var dispenseId = $"rx-{rec.PatientId}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        Console.WriteLine($"  [DispenseMedication] DISPENSED: {dispenseId}");
        return Task.FromResult(new DispenseResult(
            DispenseId: dispenseId,
            Status: "dispensed",
            EventCount: 0)); // EventCount populated by DispenseMedicationWorkflow
    }
}
