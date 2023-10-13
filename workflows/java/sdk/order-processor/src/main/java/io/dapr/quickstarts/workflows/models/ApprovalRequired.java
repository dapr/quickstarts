package io.dapr.quickstarts.workflows.models;

public class ApprovalRequired {
  private boolean approval;

  public boolean isApproval() {
    return approval;
  }

  public void setApproval(boolean approval) {
    this.approval = approval;
  }

  @Override
  public String toString() {
    return "ApprovalRequired [approval=" + approval + "]";
  }

}