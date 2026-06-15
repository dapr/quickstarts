using Dapr.Workflow;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PatientIntake;

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
// Run two scenarios back-to-back
// ---------------------------------------------------------------------------

Console.WriteLine(Banner("WORKFLOW HISTORY PROPAGATION DEMO — PATIENT INTAKE (.NET)"));
Console.WriteLine();
Console.WriteLine("  Flow: PatientIntake -> VerifyInsurance");
Console.WriteLine("           -> PrescribeMedication (child wf, Lineage)");
Console.WriteLine("               -> CheckAllergies -> ScreenDrugInteractions");
Console.WriteLine("               -> ComplianceAudit              (child wf, Lineage)    <-- sees PatientIntake + PrescribeMedication events");
Console.WriteLine("               -> DispenseMedicationWorkflow   (child wf, OwnHistory) <-- sees only PrescribeMedication events");

// Scenario 1 (happy path): PrescribeMedication forwards its own history to the
// pharmacy, which verifies the upstream screening and dispenses.
await RunScenario(
    "SCENARIO 1: lineage forwarded — pharmacy dispenses",
    "intake-ok",
    new PatientRecord(
        PatientId: "P-1042",
        Name: "Jane Doe",
        Dob: "1985-06-12",
        Mrn: "MRN-77231",
        Condition: "bacterial sinusitis",
        Medication: "amoxicillin",
        Dosage: 500,
        ForwardLineage: true));

// Scenario 2 (negative): PrescribeMedication dispenses WITHOUT propagating its
// history, so the pharmacy receives no lineage and refuses to dispense.
await RunScenario(
    "SCENARIO 2: lineage withheld — pharmacy refuses",
    "intake-missing-lineage",
    new PatientRecord(
        PatientId: "P-2087",
        Name: "John Roe",
        Dob: "1979-03-04",
        Mrn: "MRN-55810",
        Condition: "strep throat",
        Medication: "penicillin",
        Dosage: 500,
        ForwardLineage: false));

Console.WriteLine();
Console.WriteLine(Banner("COMPLETE"));

await host.StopAsync();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Schedules one PatientIntake run, waits for it to finish, prints the final
// result, and purges its state so the demo can exit cleanly.
async Task RunScenario(string title, string instanceId, PatientRecord rec)
{
    Console.WriteLine();
    Console.WriteLine(Banner(title));
    Console.WriteLine($"  [main] Scheduling workflow instance: {instanceId}");

    await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(PatientIntakeWorkflow),
        instanceId: instanceId,
        input: rec);

    var state = await workflowClient.WaitForWorkflowCompletionAsync(instanceId: instanceId);

    if (state is null)
        Console.WriteLine("  [main] Workflow not found!");
    else if (state.RuntimeStatus == WorkflowRuntimeStatus.Completed)
        Console.WriteLine($"  [main] Result: {state.ReadOutputAs<string>()}");
    else
        Console.WriteLine($"  [main] Workflow ended with status: {state.RuntimeStatus}");

    await workflowClient.PurgeInstanceAsync(instanceId);
}

static string Banner(string msg)
{
    var line = new string('=', msg.Length + 4);
    return $"{line}\n= {msg} =\n{line}";
}
