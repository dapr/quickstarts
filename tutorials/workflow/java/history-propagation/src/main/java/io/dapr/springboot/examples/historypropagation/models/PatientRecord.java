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

public class PatientRecord {

  private String patientId;
  private String name;
  private String condition;
  private String medication;
  private int dosage;
  /**
   * When true (default), PatientIntake forwards its execution history to the
   * child PrescribeMedication workflow via {@code propagateLineage()}. When
   * false, no propagation options are passed - downstream consumers cannot
   * verify the upstream pipeline and the prescription is blocked.
   */
  private boolean propagateHistory = true;

  public PatientRecord() {
  }

  public PatientRecord(String patientId, String name, String condition, String medication, int dosage) {
    this(patientId, name, condition, medication, dosage, true);
  }

  public PatientRecord(String patientId, String name, String condition, String medication,
                       int dosage, boolean propagateHistory) {
    this.patientId = patientId;
    this.name = name;
    this.condition = condition;
    this.medication = medication;
    this.dosage = dosage;
    this.propagateHistory = propagateHistory;
  }

  public String getPatientId() {
    return patientId;
  }

  public void setPatientId(String patientId) {
    this.patientId = patientId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getCondition() {
    return condition;
  }

  public void setCondition(String condition) {
    this.condition = condition;
  }

  public String getMedication() {
    return medication;
  }

  public void setMedication(String medication) {
    this.medication = medication;
  }

  public int getDosage() {
    return dosage;
  }

  public void setDosage(int dosage) {
    this.dosage = dosage;
  }

  public boolean isPropagateHistory() {
    return propagateHistory;
  }

  public void setPropagateHistory(boolean propagateHistory) {
    this.propagateHistory = propagateHistory;
  }

  @Override
  public String toString() {
    return "PatientRecord [patientId=" + patientId + ", name=" + name
        + ", condition=" + condition + ", medication=" + medication
        + ", dosage=" + dosage + "mg, propagateHistory=" + propagateHistory + "]";
  }
}
