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

// Workflow History Propagation Quickstart (.NET SDK)
//
// Scenario: patient intake / e-prescribing pipeline.
//
// Flow:
//   PatientIntake (root)
//     └─ VerifyInsurance         (activity, no propagation)
//     └─ PrescribeMedication     (child wf, HistoryPropagationScope.Lineage)
//           └─ CheckAllergies                (activity, no propagation)
//           └─ ScreenDrugInteractions        (activity, no propagation)
//           └─ ComplianceAudit               (grandchild wf, HistoryPropagationScope.Lineage)
//           |      reads: PatientIntake + PrescribeMedication events
//           └─ DispenseMedicationWorkflow    (grandchild wf, HistoryPropagationScope.OwnHistory)
//                  reads: PrescribeMedication events only
//                  └─ DispenseMedication      (activity)
//
// Requires Dapr 1.18+ (dapr/dapr#9810) and Dapr.Workflow 1.18+ (dapr/dotnet-sdk#1802).
// Against an older sidecar GetPropagatedHistory() returns null and the sample
// exits gracefully.

using Dapr.Workflow;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OrderProcessor;

const string Banner =
    "================================================================\n" +
    "= WORKFLOW HISTORY PROPAGATION DEMO — PATIENT INTAKE (.NET)   =\n" +
    "================================================================";

// ---------------------------------------------------------------------------
// Host setup — register workflows and activities
// ---------------------------------------------------------------------------

var builder = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddDaprClient();
        services.AddDaprWorkflow(options =>
        {
            options.RegisterWorkflow<PatientIntakeWorkflow>();
            options.RegisterWorkflow<PrescribeMedicationWorkflow>();
            options.RegisterWorkflow<ComplianceAuditWorkflow>();
            options.RegisterWorkflow<DispenseMedicationWorkflow>();

            options.RegisterActivity<VerifyInsuranceActivity>();
            options.RegisterActivity<CheckAllergiesActivity>();
            options.RegisterActivity<ScreenDrugInteractionsActivity>();
            options.RegisterActivity<DispenseMedicationActivity>();
        });
    });

using var host = builder.Build();

await host.StartAsync();

var workflowClient = host.Services.GetRequiredService<DaprWorkflowClient>();

// ---------------------------------------------------------------------------
// Kick off the root workflow
// ---------------------------------------------------------------------------

Console.WriteLine(Banner);
Console.WriteLine();
Console.WriteLine("  Flow: PatientIntake -> VerifyInsurance");
Console.WriteLine("           -> PrescribeMedication (child wf, Lineage)");
Console.WriteLine("               -> CheckAllergies -> ScreenDrugInteractions");
Console.WriteLine("               -> ComplianceAudit              (child wf, Lineage)    <-- sees PatientIntake + PrescribeMedication events");
Console.WriteLine("               -> DispenseMedicationWorkflow   (child wf, OwnHistory) <-- sees only PrescribeMedication events");
Console.WriteLine();

var record = new PatientRecord(
    PatientId: "P-1042",
    Name: "Jane Doe",
    Dob: "1985-06-12",
    Mrn: "MRN-77231",
    Condition: "bacterial sinusitis",
    Medication: "amoxicillin",
    Dosage: 500);

const string instanceId = "intake-001";

Console.WriteLine($"  [main] Scheduling workflow instance: {instanceId}");

await workflowClient.ScheduleNewWorkflowAsync(
    name: nameof(PatientIntakeWorkflow),
    instanceId: instanceId,
    input: record);

var state = await workflowClient.WaitForWorkflowCompletionAsync(instanceId: instanceId);

if (state is null)
{
    Console.WriteLine("  [main] Workflow not found!");
}
else if (state.RuntimeStatus == WorkflowRuntimeStatus.Completed)
{
    Console.WriteLine($"  [main] Workflow completed! Output: {state.ReadOutputAs<object>()}");
}
else
{
    Console.WriteLine($"  [main] Workflow ended with status: {state.RuntimeStatus}");
}

Console.WriteLine();
Console.WriteLine("================================================================");
Console.WriteLine("=                          COMPLETE                            =");
Console.WriteLine("================================================================");

await host.StopAsync();
