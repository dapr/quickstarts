using Dapr.Actors;

namespace smartdevice.Interfaces;
public interface ISmartDevice : IActor
{
    Task<string> SetDataAsync(SmartDeviceData device);
    Task<SmartDeviceData> GetDataAsync();
    Task RegisterReminder();
    Task UnregisterReminder();
    Task RegisterTimer();
    Task UnregisterTimer();
}

public class SmartDeviceData
{   
    public string Name { get; set; } = default!;
    public string Status { get; set; } = default!;
    public decimal Battery { get; set; } = default!;
    public decimal Temperature { get; set; } = default!;
    public string Location { get; set; } = default!;
    public decimal FirmwareVersion { get; set; } = default!;
    public string SerialNo { get; set; } = default!;
    public string MACAddress { get; set; } = default!;
    public DateTime LastUpdate { get; set; } = default!;

    public override string ToString()
    {
        return $"Name: {this.Name}, Status: {this.Status}, Battery: {this.Battery}, Temperature: {this.Temperature}, Location: {this.Location}, " +
                $"FirmwareVersion: {this.FirmwareVersion}, SerialNo: {this.SerialNo}, MACAddress: {this.MACAddress}, LastUpdate: {this.LastUpdate}";
    }
}
