using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

var baseURL = (Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost") + ":"
+ (Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3500");

const string DAPR_CONFIGURATION_STORE = "configstore";

var CONFIGURATION_ITEMS = new List<string> { "orderId1", "orderId2" };

var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

foreach (var item in CONFIGURATION_ITEMS)
{
  // Get config items from the config store
  try
  {
    var response = await httpClient.GetStringAsync($"{baseURL}/v1.0-alpha1/configuration/{DAPR_CONFIGURATION_STORE}?key={item.ToString()}");
    Console.WriteLine("Configuration for " + item + ": " + response);
  }
  catch (Exception ex)
  {
    Console.WriteLine("Could not get config item, err:" + ex.Message);
  }
}

async Task subscribeToConfigUpdates()
{
  // Add delay to allow app channel to be ready
  Thread.Sleep(3000);
  var subscription = await httpClient.GetStringAsync($"{baseURL}/v1.0-alpha1/configuration/{DAPR_CONFIGURATION_STORE}/subscribe");
  // subscription.EnsureSuccessStatusCode();
  Console.WriteLine("App subscribed to config changes with subscription id: " + subscription);
}

async Task readConfigurationChanges()
{
  // Create POST endpoint to receive config updates
  app.MapPost("/configuration/configstore/{item}", async (HttpRequest request) =>
  {
    using var sr = new StreamReader(request.Body);
    var config = await sr.ReadToEndAsync();
    dynamic update = JObject.Parse(config);
    Console.WriteLine("Configuration update "+ update.items.ToString(Formatting.None));
  });
  await app.StartAsync();
}

await readConfigurationChanges();
await subscribeToConfigUpdates();

// Exit the app after 20 seconds
await Task.Delay(20000);



