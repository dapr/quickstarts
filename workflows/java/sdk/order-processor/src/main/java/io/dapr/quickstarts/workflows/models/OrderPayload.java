package io.dapr.quickstarts.workflows.models;

public class OrderPayload {

  private String itemName;
  private int totalCost;
  private int quantity;

  public String getItemName() {
    return itemName;
  }

  public void setItemName(String itemName) {
    this.itemName = itemName;
  }

  public int getTotalCost() {
    return totalCost;
  }

  public void setTotalCost(int totalCost) {
    this.totalCost = totalCost;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int quantity) {
    this.quantity = quantity;
  }

  @Override
  public String toString() {
    return "OrderPayload [itemName=" + itemName + ", totalCost=" + totalCost + ", quantity=" + quantity + "]";
  }

}
