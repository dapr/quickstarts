package io.dapr.quickstarts.saga.models;

public class OrderResult {
  private boolean processed;
  private boolean compensated;

  public boolean isProcessed() {
    return processed;
  }

  public void setProcessed(boolean processed) {
    this.processed = processed;
  }

  public boolean isCompensated() {
    return compensated;
  }

  public void setCompensated(boolean compensated) {
    this.compensated = compensated;
  }

  @Override
  public String toString() {
    return "OrderResult [processed=" + processed + ", compensated=" + compensated + "]";
  }
}
