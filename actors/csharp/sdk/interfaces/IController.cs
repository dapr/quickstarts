using Dapr.Actors;

namespace SmartDevice.Interfaces;
public interface IController : IActor
{
    Task<decimal> GetNetBatteryPercentage();
    Task<decimal> GetAverageTemperature();
}
