using Dapr.Actors;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace smartdevice.Interfaces;
public interface ISmartDevice : IActor
{
    Task<string> SetDataAsync(SmokeDetector device);
    Task<SmokeDetector> GetDataAsync();
    Task RegisterReminder();
    Task UnregisterReminder();
    Task RegisterTimer();
    Task UnregisterTimer();
}

public record SmokeDetector
(   [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("battery")] decimal Battery,
    [property: JsonPropertyName("location")] string Location,
    [property: JsonPropertyName("firmware_version")] decimal FirmwareVersion,
    [property: JsonPropertyName("serial_no")] string SerialNo,
    [property: JsonPropertyName("mac_address")] string MACAddress,
    [property: JsonPropertyName("last_update")] DateTime LastUpdate
)
{
    public override string ToString()
    {
        return $"Name: {this.Name}, Status: {this.Status}, Battery: {this.Battery}, Location: {this.Location}, " +
                $"FirmwareVersion: {this.FirmwareVersion}, SerialNo: {this.SerialNo}, MACAddress: {this.MACAddress}, LastUpdate: {this.LastUpdate}";
    }
}
