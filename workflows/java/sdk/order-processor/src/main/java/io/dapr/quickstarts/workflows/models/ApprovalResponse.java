package io.dapr.quickstarts.workflows.models;

public class ApprovalResponse {
  private boolean approved;

  public boolean isApproved() {
    return approved;
  }

  public void setIsApproved(boolean isApproved) {
    this.approved = isApproved;
  }

  @Override
  public String toString() {
    return "ApprovalResponse [isApproved=" + approved + "]";
  }

}
