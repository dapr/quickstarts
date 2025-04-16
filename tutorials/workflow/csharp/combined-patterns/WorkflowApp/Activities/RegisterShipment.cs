using Dapr.Client;
using Dapr.Workflow;

namespace WorkflowApp.Activities;

internal sealed class RegisterShipment(DaprClient daprClient) : WorkflowActivity<Order, RegisterShipmentResult>
{
    public override async Task<RegisterShipmentResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(RegisterShipment)}: Received input: {order}.");

        await daprClient.PublishEventAsync(
            Constants.DAPR_PUBSUB_COMPONENT,
            Constants.DAPR_PUBSUB_REGISTRATION_TOPIC,
            order);

        return new RegisterShipmentResult(IsSucces: true);
    }
}

internal sealed record RegisterShipmentResult(bool IsSucces);
