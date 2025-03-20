using System.Net;
using Dapr.Workflow;

namespace WorkflowApp.Activities;

public class CheckShippingDestination : WorkflowActivity<Order, ActivityResult>
{
    private readonly HttpClient _httpClient;

    public CheckShippingDestination(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public override async Task<ActivityResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(CheckShippingDestination)}: Received input: {order}.");

        var response = await _httpClient.PostAsJsonAsync("/checkDestination", order);
        if (response.StatusCode != HttpStatusCode.OK)
        {
            throw new Exception($"Failed to register shipment. Reason: {response.ReasonPhrase}.");
        }

        var result = await response.Content.ReadFromJsonAsync<ShippingDestinationResult>();
        return new ActivityResult(IsSuccess: result.IsSuccess);
    }
}

public record ShippingDestinationResult(bool IsSuccess);
