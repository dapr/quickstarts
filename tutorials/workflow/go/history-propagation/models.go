package main

// PatientRecord represents a patient intake submitted by the front desk.
// In a real deployment, the Name, DOB, and MRN fields are protected health
// information (PHI). They would be candidates for redaction when the record is
// propagated downstream — a future addition for history propagation.
type PatientRecord struct {
	PatientID  string  `json:"patientId"`
	Name       string  `json:"name"`
	DOB        string  `json:"dob"`
	MRN        string  `json:"mrn"`
	Condition  string  `json:"condition"`
	Medication string  `json:"medication"`
	Dosage     float64 `json:"dosage"`
	// ForwardLineage controls whether PrescribeMedication propagates its own
	// history to the DispenseMedication activity. When true (happy path) the
	// pharmacy can verify the upstream screening and dispenses. When false
	// (negative scenario) the pharmacy receives no lineage and refuses.
	ForwardLineage bool `json:"forwardLineage"`
}

// ComplianceResult is the output of the ComplianceAudit child workflow.
type ComplianceResult struct {
	Compliant  bool    `json:"compliant"`
	RiskScore  float64 `json:"riskScore"`
	Reason     string  `json:"reason"`
	EventCount int     `json:"eventCount"`
}

// DispenseResult is the output of the DispenseMedication activity.
// Status is "dispensed" when the pharmacy filled the prescription, or
// "refused" when it could not verify the prescribing pipeline in the
// propagated history (Reason explains what was missing).
type DispenseResult struct {
	DispenseID string `json:"dispenseId"`
	Status     string `json:"status"`
	Reason     string `json:"reason,omitempty"`
	EventCount int    `json:"eventCount"`
}
