package io.dapr.quickstarts.workflows.models;

public class InventoryResult {
  private boolean success;
  private InventoryItem inventoryItem;

  public boolean isSuccess() {
    return success;
  }

  public void setSuccess(boolean success) {
    this.success = success;
  }

  public InventoryItem getInventoryItem() {
    return inventoryItem;
  }

  public void setInventoryItem(InventoryItem inventoryItem) {
    this.inventoryItem = inventoryItem;
  }

  @Override
  public String toString() {
    return "InventoryResult [success=" + success + ", inventoryItem=" + inventoryItem + "]";
  }
}
