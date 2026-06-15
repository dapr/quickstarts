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

public class PrescriptionResult {

  private boolean dispensed;
  private String dispenseId;
  private String patientId;
  private String medication;

  public PrescriptionResult() {
  }

  public PrescriptionResult(boolean dispensed, String dispenseId, String patientId, String medication) {
    this.dispensed = dispensed;
    this.dispenseId = dispenseId;
    this.patientId = patientId;
    this.medication = medication;
  }

  public boolean isDispensed() {
    return dispensed;
  }

  public void setDispensed(boolean dispensed) {
    this.dispensed = dispensed;
  }

  public String getDispenseId() {
    return dispenseId;
  }

  public void setDispenseId(String dispenseId) {
    this.dispenseId = dispenseId;
  }

  public String getPatientId() {
    return patientId;
  }

  public void setPatientId(String patientId) {
    this.patientId = patientId;
  }

  public String getMedication() {
    return medication;
  }

  public void setMedication(String medication) {
    this.medication = medication;
  }
}
