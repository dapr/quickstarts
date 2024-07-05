# Dapr Job (Dapr SDK)

In this quickstart, you'll create a job using Dapr's Job API. This API is responsible for scheduling and running jobs at a specific time or interval.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/jobs/) link for more information about Dapr and the Job API.

> **Note:** This example leverages the Dapr SDK.  If you are looking for the example using HTTP REST only [click here](../http).

This quickstart includes one service:
 
- Go service `app`

### Run the Go service app with Dapr

This example will schedule 6 different droid manintenance jobs:

```go

droids := []Droid{
  {Name: "R2-D2", Jobs: []string{"Oil Change", "Circuitry Check"}},
  {Name: "C-3PO", Jobs: []string{"Memory Wipe", "Limb Calibration"}},
  {Name: "BB-8", Jobs: []string{"Internal Gyroscope Check", "Map Data Update"}},
}
```

Open a terminal window and run, navigate to the `/maintenance-scheduler` folder and run:

```bash
cd maintenance-scheduler
dapr run --app-id job-sdk --app-port 6004 --dapr-http-port 3502 --dapr-grpc-port 60002 -- go run .
```

<!-- END_STEP -->
