#pragma warning disable CS0618 // Type or member is obsolete
using Dapr.Jobs;
using Dapr.Jobs.Extensions;
using Dapr.Jobs.Models;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

// The jobs host is a background service that connects to the sidecar over gRPC
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprJobsClient();
var app = builder.Build();

var appPort = Environment.GetEnvironmentVariable("APP_PORT") ?? "6200";
var jobsClient = app.Services.GetRequiredService<DaprJobsClient>();

app.MapPost("/scheduleJob", async (HttpContext context) =>
{
  Console.WriteLine("Scheduling job...");
  var droidJob = await JsonSerializer.DeserializeAsync<DroidJob>(context.Request.Body);
  if (droidJob?.Name is null || droidJob?.Job is null)
  {
    context.Response.StatusCode = 400;
    await context.Response.WriteAsync("Job must contain a name and a task " + context.Request.Body);
    return;
  }

  try {
    //Create a Cron expression to run once after schedule defined seconds
    var cronBuilder = new CronExpressionBuilder().On(OnCronPeriod.Second, droidJob.DueTime);
    Console.WriteLine($"Scheduling job with cron expression: " + cronBuilder);

    var jobData = new JobData {
      Droid = droidJob.Name,
      Task = droidJob.Job
    };

    //await jobsClient.ScheduleJobAsync(droidJob.Name, DaprJobSchedule.FromDateTime(DateTime.UtcNow.AddSeconds(droidJob.DueTime)), JsonSerializer.SerializeToUtf8Bytes(jobData), DateTime.UtcNow, 1);
    await jobsClient.ScheduleJobWithPayloadAsync(droidJob.Name, DaprJobSchedule.FromCronExpression(cronBuilder), jobData, DateTime.UtcNow, 1); //Schedule cron job that repeats once
    Console.WriteLine($"Job Scheduled: {droidJob.Name}");

    context.Response.StatusCode = 200;
    await context.Response.WriteAsJsonAsync(droidJob);
    
  } catch (Exception e) {
    Console.WriteLine($"Error scheduling job: " + e);
  }
  return;
});

app.MapGet("/getJob/{name}", async (HttpContext context) =>
{
  var jobName = context.Request.RouteValues["name"]?.ToString();
  Console.WriteLine($"Getting job: " + jobName);
  
  if (string.IsNullOrEmpty(jobName))
  {
    context.Response.StatusCode = 400;
    await context.Response.WriteAsync("Job name required");
    return;
  }

  try {
    // Error here:  ---> System.FormatException: String '' was not recognized as a valid DateTime.
    var jobDetails = await jobsClient.GetJobAsync(jobName);
    Console.WriteLine($"Job schedule: {jobDetails?.Schedule}");
    Console.WriteLine($"Job payload: {jobDetails?.Payload}");

    context.Response.StatusCode = 200;
    await context.Response.WriteAsJsonAsync(jobDetails);

  } catch (Exception e) {
    Console.WriteLine($"Error getting job: " + e);
    context.Response.StatusCode = 400;
    await context.Response.WriteAsync($"Error getting job");
  }
  return;
});

app.MapDelete("/deleteJob/{name}", async (HttpContext context) =>
{
  var jobName = context.Request.RouteValues["name"]?.ToString();
  Console.WriteLine($"Deleting job: " + jobName);
  
  if (string.IsNullOrEmpty(jobName))
  {
    context.Response.StatusCode = 400;
    await context.Response.WriteAsync("Job name required");
    return;
  }

  try {
    await jobsClient.DeleteJobAsync(jobName);
    Console.WriteLine($"Job deleted: {jobName}");

    context.Response.StatusCode = 200;
    await context.Response.WriteAsync("Job deleted");

  } catch (Exception e) {
    Console.WriteLine($"Error deleting job: " + e);
    context.Response.StatusCode = 400;
    await context.Response.WriteAsync($"Error deleting job");
  }
  return;
});

//Job handler route to capture incoming jobs
app.MapDaprScheduledJobHandler((string jobName, ReadOnlyMemory<byte> jobPayload) =>
{
  Console.WriteLine($"Received trigger invocation for job name: {jobName}");
  var deserializedPayload = Encoding.UTF8.GetString(jobPayload.Span);

  try
  {
    if (deserializedPayload is null){
      throw new Exception("Payload is null");
    }

    var jobData = JsonSerializer.Deserialize<JobData>(deserializedPayload);
    Console.WriteLine($"Received invocation for the job {jobName} with job data droid {jobData?.Droid}");

    if (jobData?.Droid is null || jobData?.Task is null)
    {
      throw new Exception("Invalid format of job data.");
    }

    // Handling Droid Job from decoded value
    Console.WriteLine($"Starting droid: {jobData.Droid}");
    Console.WriteLine($"Executing maintenance job: {jobData.Task}");
  } catch (Exception ex)
  {
    Console.WriteLine($"Failed to handle job {jobName}");
    Console.Error.WriteLine($"Error handling job: {ex.Message}");
  }
  return Task.CompletedTask;
});

app.UseRouting();
app.Run($"http://*:{appPort}");

// Classes for request and response models
public class JobData
{
  [JsonPropertyName("droid")]
  public string? Droid { get; set; }

  [JsonPropertyName("task")]
  public string? Task { get; set; }
}

public class DroidJob
{
  [JsonPropertyName("name")]
  public string? Name { get; set; }

  [JsonPropertyName("job")]
  public string? Job { get; set; }
  
  [JsonPropertyName("dueTime")]
  public int DueTime { get; set; }
}

#pragma warning restore CS0618 // Type or member is obsolete