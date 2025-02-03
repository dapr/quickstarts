using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options =>
{
  options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

var app = builder.Build();
var appPort = Environment.GetEnvironmentVariable("APP_PORT") ?? "6200";

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
app.Run($"http://localhost:{appPort}");

static DroidJob SetDroidJob(string droidStr)
{
  var parts = droidStr.Split(":");
  if (parts.Length != 2)
  {
    throw new Exception("Invalid droid job format. Expected format: 'Droid:Task'");
  }

  return new DroidJob
  {
    Droid = parts[0],
    Task = parts[1]
  };
}

// Classes for request and response models
public class JobData
{
  public string? Value { get; set; }
}

public class DroidJob
{
  public string? Droid { get; set; }
  public string? Task { get; set; }
}
