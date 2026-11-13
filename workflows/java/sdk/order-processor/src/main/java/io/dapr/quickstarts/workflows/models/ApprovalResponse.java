package io.dapr.quickstarts.workflows.models;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ApprovalResponse {
  private boolean approved;

  public ApprovalResponse() {
  }

  /**
   * Reads the event payload. It accepts a JSON object, such as {"approved": true},
   * and a JSON string that holds that object. The Dapr CLI sends the second form.
   */
  @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
  public static ApprovalResponse fromJson(JsonNode node) throws IOException {
    if (node.isTextual()) {
      node = new ObjectMapper().readTree(node.asText());
    }
    ApprovalResponse response = new ApprovalResponse();
    response.approved = node.path("approved").asBoolean(false);
    return response;
  }

  public boolean isApproved() {
    return approved;
  }

  public void setApproved(boolean approved) {
    this.approved = approved;
  }

  @Override
  public String toString() {
    return "ApprovalResponse [isApproved=" + approved + "]";
  }

}
