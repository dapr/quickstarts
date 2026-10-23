/*
 * Copyright 2026 The Dapr Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.dapr.springboot.examples.historypropagation.models;

public class AuditResult {

  private boolean compliant;
  private double riskScore;
  private int reviewedWorkflows;
  private String notes;

  public AuditResult() {
  }

  public AuditResult(boolean compliant, double riskScore, int reviewedWorkflows, String notes) {
    this.compliant = compliant;
    this.riskScore = riskScore;
    this.reviewedWorkflows = reviewedWorkflows;
    this.notes = notes;
  }

  public boolean isCompliant() {
    return compliant;
  }

  public void setCompliant(boolean compliant) {
    this.compliant = compliant;
  }

  public double getRiskScore() {
    return riskScore;
  }

  public void setRiskScore(double riskScore) {
    this.riskScore = riskScore;
  }

  public int getReviewedWorkflows() {
    return reviewedWorkflows;
  }

  public void setReviewedWorkflows(int reviewedWorkflows) {
    this.reviewedWorkflows = reviewedWorkflows;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
