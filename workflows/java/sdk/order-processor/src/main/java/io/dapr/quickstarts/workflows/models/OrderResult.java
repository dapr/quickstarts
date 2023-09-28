package io.dapr.quickstarts.workflows.models;

public class OrderResult {
  private boolean processed;

  public boolean isProcessed() {
    return processed;
  }

  public void setProcessed(boolean processed) {
    this.processed = processed;
  }

  @Override
  public String toString() {
    return "OrderResult [processed=" + processed + "]";
  }

}
