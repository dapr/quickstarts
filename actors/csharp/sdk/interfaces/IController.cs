using Dapr.Actors;

namespace smartdevice.Interfaces;
public interface IController : IActor
{
    Task<decimal> GetNetBatteryPercentage();
    Task<decimal> GetAverageTemperature();
    Task RegisterReminder();
    Task UnregisterReminder();
    Task RegisterTimer();
    Task UnregisterTimer();
}
