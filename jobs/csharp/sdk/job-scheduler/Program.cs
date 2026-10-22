#pragma warning disable CS0618 // Type or member is obsolete

using System.Text.Json.Serialization;
using Dapr.Client;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

await Task.Delay(5000); // Allow time for the job-service-sdk to start

// Instantiate an HTTP client for invoking the job-service-sdk application
var httpClient = DaprClient.CreateInvokeHttpClient(appId: "job-service-sdk");

// Job details
var r2d2Job = new DroidJob
{
  Name = "R2-D2",
  Job = "Oil Change",
  DueTime = 15
};

var c3poJob = new DroidJob
{
  Name = "C-3PO",
  Job = "Limb Calibration",
  DueTime = 20
};

await Task.Delay(50);

try
{
  // Schedule R2-D2 job
  await ScheduleJob(r2d2Job);
  await Task.Delay(5000);
  // Get R2-D2 job details
  await GetJobDetails(r2d2Job);

  // Schedule C-3PO job
  await ScheduleJob(c3poJob);
  await Task.Delay(5000);
  // Get C-3PO job details
  await GetJobDetails(c3poJob);

  await Task.Delay(30000); // Allow time for jobs to complete
}
catch (Exception ex)
{
  Console.Error.WriteLine($"Error: {ex.Message}");
  Environment.Exit(1);
}

async Task ScheduleJob(DroidJob job)
{
  Console.WriteLine($"Scheduling job...");

  try
  {
    var response = await httpClient.PostAsJsonAsync("/scheduleJob", job);
    var result = await response.Content.ReadAsStringAsync();

    response.EnsureSuccessStatusCode();
    Console.WriteLine($"Job scheduled: {result}");
  }
  catch (Exception e)
  {
    Console.WriteLine($"Error scheduling job: " + e);
  }
}

async Task GetJobDetails(DroidJob job)
{
  Console.WriteLine($"Getting job: " + job.Name);

  try
  {
    var response = await httpClient.GetAsync($"/getJob/{job.Name}");
    var jobDetails = await response.Content.ReadAsStringAsync();

    response.EnsureSuccessStatusCode();
    Console.WriteLine($"Job details: {jobDetails}");
  }
  catch (Exception e)
  {
    Console.WriteLine($"Error getting job: " + e);
  }
}

await app.RunAsync();

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