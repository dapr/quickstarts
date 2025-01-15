using System.Text.Json;
using Dapr.Client;
using Dapr.Jobs;
using Dapr.Jobs.Extensions;
using Dapr.Jobs.Models;
using Dapr.Jobs.Models.Responses;
using JobsApp.Models;

// The jobs host is a background service that connects to the sidecar over gRPC
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDaprClient();
builder.Services.AddDaprJobsClient();

var app = builder.Build();

//Set up a handler to capture incoming jobs
var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(60));
app.MapDaprScheduledJobHandler(async (
    string? jobName,
    DaprJobDetails? jobDetails,
    ILogger? logger,
    DaprClient daprClient,
    CancellationToken cancellationToken) => 
{
    var payload = JsonSerializer.Deserialize<JobEtlPayload>(jobDetails?.Payload);

    if (logger is not null) 
        Log.LogJobInvocation(logger, jobName, payload);

    if (payload is null)
    {
        if (logger is not null)
            Log.LogPaylodNotAvailable(logger);
        throw new Exception("Unable to deserialize the payload from the scheduled job invocation");
    }

    await daprClient.InvokeMethodAsync(HttpMethod.Get, "etl-svc", $"/etl/{payload.TaskId}", cancellationToken);
}, cancellationTokenSource.Token);

//Schedule with the Dapr Jobs client
var jobsClient = app.Services.GetRequiredService<DaprJobsClient>();
var logger = app.Services.GetRequiredService<ILogger<Program>>();

//Create a Cron expression to run every day at 6 AM
var cronBuilder = new CronExpressionBuilder()
    .Each(CronPeriod.DayOfWeek)
    .On(OnCronPeriod.Hour, 6);

//Schedule ETL job to run indefinitely
var payload = new JobEtlPayload("etl-svc", "op-109780792");
const string nameOfJob = "daily-etl";
await jobsClient.ScheduleJobWithPayloadAsync(nameOfJob, DaprJobSchedule.FromCronExpression(cronBuilder), payload, DateTime.Now);
Log.LogJobSchedule(logger, nameOfJob, payload);

await app.RunAsync();

static partial class Log
{
    [LoggerMessage(LogLevel.Information, "Scheduled job '{jobName}' with payload {payload}")]
    public static partial void LogJobSchedule(ILogger logger, string jobName, JobEtlPayload payload);

    [LoggerMessage(LogLevel.Information, "Unable to deserialize the payload from the scheduled job invocation")]
    public static partial void LogPaylodNotAvailable(ILogger logger);
    
    [LoggerMessage(LogLevel.Information, "ETL job invoked: {jobName} with payload {payload}")]
    public static partial void LogJobInvocation(ILogger logger, string? jobName, JobEtlPayload? payload);
}
