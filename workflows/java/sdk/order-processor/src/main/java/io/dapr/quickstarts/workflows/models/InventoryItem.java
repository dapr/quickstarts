package io.dapr.quickstarts.workflows.models;

public class InventoryItem {
  private String name;
  private int perItemCost;
  private int quantity;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int getPerItemCost() {
    return perItemCost;
  }

  public void setPerItemCost(int perItemCost) {
    this.perItemCost = perItemCost;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int quantity) {
    this.quantity = quantity;
  }

  @Override
  public String toString() {
    return "InventoryItem [name=" + name + ", perItemCost=" + perItemCost + ", quantity=" + quantity + "]";
  }
}
