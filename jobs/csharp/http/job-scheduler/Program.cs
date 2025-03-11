using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

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

var daprHost = Environment.GetEnvironmentVariable("DAPR_HOST") ?? "http://localhost";
var jobServiceDaprHttpPort = "6280";
var httpClient = new HttpClient();

await Task.Delay(5000); // Wait for job-service to start

try
{
  // Schedule R2-D2 job
  await ScheduleJob("R2-D2", r2d2JobBody);
  await Task.Delay(5000);
  // Get R2-D2 job details
  await GetJobDetails("R2-D2");

  // Schedule C-3PO job
  await ScheduleJob("C-3PO", c3poJobBody);
  await Task.Delay(5000);
  // Get C-3PO job details
  await GetJobDetails("C-3PO");

  await Task.Delay(30000); // Allow time for jobs to complete
}
catch (Exception ex)
{
  Console.Error.WriteLine($"Error: {ex.Message}");
  Environment.Exit(1);
}

async Task ScheduleJob(string jobName, object jobBody)
{
  var reqURL = $"{daprHost}:{jobServiceDaprHttpPort}/v1.0-alpha1/jobs/{jobName}";
  var jsonBody = JsonSerializer.Serialize(jobBody);
  var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

  var response = await httpClient.PostAsync(reqURL, content);

  if (response.StatusCode != System.Net.HttpStatusCode.NoContent)
  {
      throw new Exception($"Failed to register job event handler. Status code: {response.StatusCode}");
  }

  Console.WriteLine($"Job Scheduled: {jobName}");
}

async Task GetJobDetails(string jobName)
{
  var reqURL = $"{daprHost}:{jobServiceDaprHttpPort}/v1.0-alpha1/jobs/{jobName}";
  var response = await httpClient.GetAsync(reqURL);

  if (!response.IsSuccessStatusCode)
  {
      throw new Exception($"HTTP error! Status: {response.StatusCode}");
  }

  var jobDetails = await response.Content.ReadAsStringAsync();
  Console.WriteLine($"Job details: {jobDetails}");
}
