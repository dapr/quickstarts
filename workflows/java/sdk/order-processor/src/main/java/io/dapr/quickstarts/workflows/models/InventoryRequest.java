package io.dapr.quickstarts.workflows.models;

public class InventoryRequest {

  private String requestId;
  private String itemName;
  private int quantity;

  public String getRequestId() {
    return requestId;
  }

  public void setRequestId(String requestId) {
    this.requestId = requestId;
  }

  public String getItemName() {
    return itemName;
  }

  public void setItemName(String itemName) {
    this.itemName = itemName;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int quantity) {
    this.quantity = quantity;
  }

  @Override
  public String toString() {
    return "InventoryRequest [requestId=" + requestId + ", itemName=" + itemName + ", quantity=" + quantity + "]";
  }
}