using Dapr.Actors;

namespace SmartDevice.Interfaces;
public interface ISmartDevice : IActor
{
    Task<string> SetDataAsync(SmartDeviceData device);
    Task<SmartDeviceData> GetDataAsync();
}

public class SmartDeviceData
{   
    public string Status { get; set; } = default!;
    public decimal Battery { get; set; } = default!;
    public decimal Temperature { get; set; } = default!;
    public string Location { get; set; } = default!;

    public override string ToString()
    {
        return $"Location: {this.Location}, Status: {this.Status}, Battery: {this.Battery}, Temperature: {this.Temperature}";
    }
}
