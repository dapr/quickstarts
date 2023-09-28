package io.dapr.quickstarts.workflows.models;

public class Notification {
  private String message;

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  @Override
  public String toString() {
    return "Notification [message=" + message + "]";
  }

}
