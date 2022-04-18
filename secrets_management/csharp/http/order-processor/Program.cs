using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var baseURL = (Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost") + ":" 
+ (Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3500");
const string DAPR_SECRET_STORE = "localsecretstore";
const string SECRET_NAME = "secret";

var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

// Get secret from a local secret store
var secret = await httpClient.GetStringAsync($"{baseURL}/v1.0/secrets/{DAPR_SECRET_STORE}/{SECRET_NAME}");
Console.WriteLine("Fetched Secret: " + secret);