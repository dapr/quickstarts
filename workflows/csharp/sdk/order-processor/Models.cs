using System.Text.Json;
using System.Text.Json.Serialization;

namespace WorkflowConsoleApp.Models;

internal sealed record OrderPayload(string Name, double TotalCost, int Quantity = 1);
internal sealed record InventoryRequest(string RequestId, string ItemName, int Quantity);
internal sealed record InventoryResult(bool Success, OrderPayload? OrderPayload);
internal sealed record ApprovalRequest(string RequestId, string ItemBeingPurchased, int Quantity, double Amount);
[JsonConverter(typeof(ApprovalResponseConverter))]
internal sealed record ApprovalResponse(bool Approved);
internal sealed record PaymentRequest(string RequestId, string ItemBeingPurchased, int Amount, double Currency);
internal sealed record OrderResult(bool Processed);

// The Dapr CLI can send the event payload as a JSON object or as a JSON string that holds the object.
// This converter reads both: {"approved": true} and "{\"approved\": true}".
internal sealed class ApprovalResponseConverter : JsonConverter<ApprovalResponse>
{
    public override ApprovalResponse Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var document = JsonDocument.ParseValue(ref reader);
        var element = document.RootElement;
        if (element.ValueKind == JsonValueKind.String)
        {
            using var inner = JsonDocument.Parse(element.GetString()!);
            return new ApprovalResponse(ReadApproved(inner.RootElement));
        }

        return new ApprovalResponse(ReadApproved(element));
    }

    private static bool ReadApproved(JsonElement element)
    {
        foreach (var property in element.EnumerateObject())
        {
            if (string.Equals(property.Name, "approved", StringComparison.OrdinalIgnoreCase))
            {
                return property.Value.ValueKind == JsonValueKind.True;
            }
        }

        return false;
    }

    public override void Write(Utf8JsonWriter writer, ApprovalResponse value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteBoolean("approved", value.Approved);
        writer.WriteEndObject();
    }
}
