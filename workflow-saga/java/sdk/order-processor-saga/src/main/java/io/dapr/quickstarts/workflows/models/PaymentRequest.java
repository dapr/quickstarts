package io.dapr.quickstarts.workflows.models;

public class PaymentRequest {
  private String requestId;
  private String itemBeingPurchased;
  private int amount;
  private int quantity;

  public String getRequestId() {
    return requestId;
  }

  public void setRequestId(String requestId) {
    this.requestId = requestId;
  }

  public String getItemBeingPurchased() {
    return itemBeingPurchased;
  }

  public void setItemBeingPurchased(String itemBeingPurchased) {
    this.itemBeingPurchased = itemBeingPurchased;
  }

  public int getAmount() {
    return amount;
  }

  public void setAmount(int amount) {
    this.amount = amount;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int quantity) {
    this.quantity = quantity;
  }

  @Override
  public String toString() {
    return "PaymentRequest [requestId=" + requestId + ", itemBeingPurchased=" + itemBeingPurchased + ", amount=" + amount
        + ", quantity=" + quantity + "]";
  }

}
