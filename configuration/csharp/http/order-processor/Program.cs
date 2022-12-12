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
    Environment.Exit(1);
  }
}

async Task<string> subscribeToConfigUpdates()
{
  // Add delay to allow app channel to be ready
  Thread.Sleep(3000);
  try
  {
    var subscription = await httpClient.GetStringAsync($"{baseURL}/v1.0-alpha1/configuration/{DAPR_CONFIGURATION_STORE}/subscribe");
    if (subscription.Contains("errorCode"))
    {
      Console.WriteLine("Error subscribing to config updates, err:" + subscription);
      Environment.Exit(1);
      return string.Empty;
    }
    dynamic data = JObject.Parse(subscription);
    Console.WriteLine("App subscribed to config changes with subscription id: " + data.id);
    return data.id;
  }
  catch (Exception ex)
  {
    Console.WriteLine("Error subscribing to config updates, err:" + ex.Message);
    Environment.Exit(1);
    return string.Empty;
  }
}

async Task readConfigurationChanges()
{
  // Create POST endpoint to receive config updates
  app.MapPost("/configuration/configstore/{item}", async (HttpRequest request) =>
  {
    using var sr = new StreamReader(request.Body);
    var config = await sr.ReadToEndAsync();
    dynamic update = JObject.Parse(config);
    Console.WriteLine("Configuration update " + update.items.ToString(Formatting.None));
  });
  await app.StartAsync();
}

await readConfigurationChanges();
string subscriptionId = await subscribeToConfigUpdates();

// Unsubscribe to config updates and exit app after 20 seconds
await Task.Delay(20000);
try
{
  string unsubscribe = await httpClient.GetStringAsync($"{baseURL}/v1.0-alpha1/configuration/{DAPR_CONFIGURATION_STORE}/{subscriptionId}/unsubscribe");
  if (unsubscribe.Contains("true"))
  {
    Console.WriteLine("App unsubscribed from config updates");
    Environment.Exit(0);
  }
  else
  {
    Console.WriteLine("Error unsubscribing from config updates, err:" + unsubscribe);
    Environment.Exit(1);
  }
}
catch (Exception ex)
{
  Console.WriteLine("Error unsubscribing from config updates, err:" + ex.Message);
  Environment.Exit(1);
}
