using System.Net;
using Dapr.Workflow;

namespace WorkflowApp.Activities;

internal sealed class CheckShippingDestination(HttpClient httpClient) : WorkflowActivity<Order, ActivityResult>
{
    public override async Task<ActivityResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(CheckShippingDestination)}: Received input: {order}.");

        var response = await httpClient.PostAsJsonAsync("/checkDestination", order);
        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Failed to register shipment. Reason: {response.ReasonPhrase}.");
            throw new Exception($"Failed to register shipment. Reason: {response.ReasonPhrase}.");
        }

        var result = await response.Content.ReadFromJsonAsync<ShippingDestinationResult>();
        return new ActivityResult(IsSuccess: result.IsSuccess);
    }
}

internal sealed record ShippingDestinationResult(bool IsSuccess);
