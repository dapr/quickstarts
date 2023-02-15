using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapr.Client;

const string DAPR_CONFIGURATION_STORE = "configstore";
var CONFIGURATION_ITEMS = new List<string> { "orderId1", "orderId2" };
string subscriptionId = string.Empty;

var client = new DaprClientBuilder().Build();

// Get config from configuration store
GetConfigurationResponse config = await client.GetConfiguration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
foreach (var item in config.Items)
{
  var cfg = System.Text.Json.JsonSerializer.Serialize(item.Value);
  Console.WriteLine("Configuration for " + item.Key + ": " + cfg);
}

// Exit the app after 30 seconds
var shutdownTimer = new System.Timers.Timer();
shutdownTimer.Interval = 30000;
shutdownTimer.Elapsed += (o, e) => Task.Run(async () => await unsubscribe(subscriptionId)).GetAwaiter().GetResult();
shutdownTimer.Start();

// Subscribe for configuration changes
SubscribeConfigurationResponse subscribe = await client.SubscribeConfiguration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);

// Print configuration changes
await foreach (var configItem in subscribe.Source)
{
  // First invocation when app subscribes to config changes only returns subscription id
  if (configItem.Keys.Count == 0)
  {
    Console.WriteLine("App subscribed to config changes with subscription id: " + subscribe.Id);
    subscriptionId = subscribe.Id;
    continue;
  }
  var cfg = System.Text.Json.JsonSerializer.Serialize(configItem);
  Console.WriteLine("Configuration update " + cfg);
}


// Unsubscribe to config updates and exit the app
async Task unsubscribe(string subscriptionId)
{
  try
  {
    await client.UnsubscribeConfiguration(DAPR_CONFIGURATION_STORE, subscriptionId);
    Console.WriteLine("App unsubscribed from config changes");
    Environment.Exit(0);
  }
  catch (Exception ex)
  {
    Console.WriteLine("Error unsubscribing from config updates: " + ex.Message);
  }
}
