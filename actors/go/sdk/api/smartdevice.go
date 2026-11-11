package api

// SmartDeviceData is the state persisted for each smoke detector device.
type SmartDeviceData struct {
	Location string `json:"location"`
	Status   string `json:"status"`
}
