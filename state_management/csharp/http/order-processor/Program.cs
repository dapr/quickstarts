using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var baseURL = (Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost") + ":" 
+ (Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3500");
const string DAPR_STATE_STORE = "statestore";

var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

for (int i = 1; i <= 10; i++) {
    var orderId = i;
    var order = new Order(orderId);
    var orderJson = JsonSerializer.Serialize(
        new[] {
            new {
                key = orderId.ToString(),
                value = order
            }
        }
    );
    var state = new StringContent(orderJson, Encoding.UTF8, "application/json");

    // Save state into a state store
    await httpClient.PostAsync($"{baseURL}/v1.0/state/{DAPR_STATE_STORE}", state);
    Console.WriteLine("Saving Order: " + order);
    
    // Get state from a state store
    var response = await httpClient.GetStringAsync($"{baseURL}/v1.0/state/{DAPR_STATE_STORE}/{orderId.ToString()}");
    Console.WriteLine("Getting Order: " + response);

    // Delete state from the state store
    await httpClient.DeleteAsync($"{baseURL}/v1.0/state/{DAPR_STATE_STORE}/{orderId.ToString()}");
    Console.WriteLine("Deleting Order: " + order);
    
    await Task.Delay(TimeSpan.FromSeconds(1));
}

public record Order([property: JsonPropertyName("orderId")] int orderId);