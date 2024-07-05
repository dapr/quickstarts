# Dapr Job (SDK))

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
dapr run --app-id maintenance-scheduler --app-port 5200 --dapr-http-port 5280 --dapr-grpc-port 5281 -- go run .
```

<!-- END_STEP -->
