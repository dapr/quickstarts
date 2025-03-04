using System.Net;
using System.Text;
using Microsoft.AspNetCore.Http.Json;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
  serverOptions.Listen(IPAddress.Any, 6200);
});
builder.Services.Configure<JsonOptions>(options =>
{
  options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
builder.Services.AddHostedService<DroidWorkService>();

var app = builder.Build();
app.UseRouting();

//Job handler route
app.MapPost("/job/{*path}", async (HttpRequest request, HttpResponse response) =>
{
  Console.WriteLine("Received job request...");

  try
  {
    // Parse the incoming JSON body
    var jobData = await JsonSerializer.DeserializeAsync<JobData>(request.Body);
    if (jobData == null || string.IsNullOrEmpty(jobData.Value))
    {
      throw new Exception("Invalid job data. 'value' field is required.");
    }

    // Creating Droid Job from decoded value
    var droidJob = SetDroidJob(jobData.Value);
    Console.WriteLine($"Starting droid: {droidJob.Droid}");
    Console.WriteLine($"Executing maintenance job: {droidJob.Task}");
    response.StatusCode = 200; 
  }
  catch (Exception ex)
  {
    Console.Error.WriteLine($"Error processing job: {ex.Message}");
    response.StatusCode = 400; // Bad Request
    var errorResponse = new { error = $"Error processing request: {ex.Message}" };
    await response.WriteAsJsonAsync(errorResponse);
  }
});

// Start the server
app.Run();
return;

static DroidJob SetDroidJob(string droidStr)
{
  var parts = droidStr.Split(":");
  if (parts.Length != 2)
  {
    throw new Exception("Invalid droid job format. Expected format: 'Droid:Task'");
  }

  return new DroidJob(parts[0], parts[1]);
}

internal sealed class DroidWorkService : IHostedService
{
  private readonly string _daprHost = Environment.GetEnvironmentVariable("DAPR_HOST") ?? "http://localhost";
  private readonly string _appPort = Environment.GetEnvironmentVariable("APP_PORT") ?? "6280";
  
  /// <summary>
  /// Triggered when the application host is ready to start the service.
  /// </summary>
  /// <param name="cancellationToken">Indicates that the start process has been aborted.</param>
  /// <returns>A <see cref="T:System.Threading.Tasks.Task" /> that represents the asynchronous Start operation.</returns>
  public async Task StartAsync(CancellationToken cancellationToken)
  {   
    // Job request bodies
    var c3poJobBody = new
    {
      data = new { Value = "C-3PO:Limb Calibration" },
      dueTime = "20s"
    };

    var r2d2JobBody = new
    {
      data = new { Value = "R2-D2:Oil Change" },
      dueTime = "15s"
    };
    
    // Schedule the R2-D2 job
    await ScheduleJob("R2-D2", r2d2JobBody);
    await Task.Delay(5000, cancellationToken);
    // Get the R2-D2 job details
    await GetJobDetails("R2-D2");

    // Schedule C-3PC job
    await ScheduleJob("C-3PO", c3poJobBody);
    await Task.Delay(5000, cancellationToken);
    // Get C-3PO job details
    await GetJobDetails("C-3PO");
    await Task.Delay(30000, cancellationToken);
  }

  private async Task ScheduleJob(string jobName, object jobBody)
  {
    var reqUrl = $"{_daprHost}:{_appPort}/v1.0-alpha1/jobs/{jobName}";
    var jsonBody = JsonSerializer.Serialize(jobBody);
    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

    var httpClient = new HttpClient();
    var response = await httpClient.PostAsync(reqUrl, content);

    if (response.StatusCode != System.Net.HttpStatusCode.NoContent)
    {
      throw new Exception($"Failed to register job event handler. Status code: {response.StatusCode}");
    }

    Console.WriteLine($"Job Scheduled: {jobName}");
  }

  private async Task GetJobDetails(string jobName)
  {
    var reqUrl = $"{_daprHost}:{_appPort}/v1.0-alpha1/jobs/{jobName}";
    var httpClient = new HttpClient();
    var response = await httpClient.GetAsync(reqUrl);

    if (!response.IsSuccessStatusCode)
    {
      throw new Exception($"HTTP error! Status: {response.StatusCode}");
    }

    var jobDetails = await response.Content.ReadAsStringAsync();
    Console.WriteLine($"Job details: {jobDetails}");
  }

  /// <summary>
  /// Triggered when the application host is performing a graceful shutdown.
  /// </summary>
  /// <param name="cancellationToken">Indicates that the shutdown process should no longer be graceful.</param>
  /// <returns>A <see cref="T:System.Threading.Tasks.Task" /> that represents the asynchronous Stop operation.</returns>
  public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

// Classes for request and response models
internal sealed record JobData(string? Value = null);

internal sealed record DroidJob(string Droid, string Task);