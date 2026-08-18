using Dapr.Client;
using Dapr.Workflow;

namespace WorkflowApp.Activities;

internal sealed class CheckShippingDestination(DaprClient daprClient) : WorkflowActivity<Order, ActivityResult>
{
    public override async Task<ActivityResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(CheckShippingDestination)}: Received input: {order}.");

        using var httpClient = daprClient.CreateInvokableHttpClient(Constants.SHIPPING_APP_ID);
        var response = await httpClient.PostAsJsonAsync("/checkDestination", order);
        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Failed to register shipment. Reason: {response.ReasonPhrase}.");
            throw new Exception($"Failed to register shipment. Reason: {response.ReasonPhrase}.");
        }

        var result = await response.Content.ReadFromJsonAsync<ShippingDestinationResult>();
        return new ActivityResult(IsSuccess: result!.IsSuccess);
    }
}

internal sealed record ShippingDestinationResult(bool IsSuccess);
