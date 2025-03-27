using Dapr.Client;
using Dapr.Workflow;

namespace WorkflowApp.Activities;

public class RegisterShipment : WorkflowActivity<Order, RegisterShipmentResult>
{
    private readonly DaprClient _daprClient;

    public RegisterShipment(DaprClient daprClient)
    {
        _daprClient = daprClient;
    }

    public override async Task<RegisterShipmentResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(RegisterShipment)}: Received input: {order}.");

        await _daprClient.PublishEventAsync(
            Constants.DAPR_PUBSUB_COMPONENT,
            Constants.DAPR_PUBSUB_REGISTRATION_TOPIC,
            order);

        return new RegisterShipmentResult(IsSucces: true);
    }
}

public record RegisterShipmentResult(bool IsSucces);
