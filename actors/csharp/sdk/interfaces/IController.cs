using Dapr.Actors;

namespace SmartDevice.Interfaces;
public interface IController : IActor
{
    Task RegisterDeviceIdsAsync(string[] deviceIds);
    Task<string[]> ListRegisteredDeviceIdsAsync();
    Task TriggerAlarmForAllDetectors();

    /// <summary>
    /// Registers a timer.
    /// </summary>
    /// <returns>A task that represents the asynchronous save operation.</returns>
    Task RegisterReminder();
}

public class ControllerData
{
    public string[] DeviceIds { get; set; } = default!;
}