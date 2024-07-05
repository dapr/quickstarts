# Dapr Jobs (API)

In this quickstart, you'll schedule, get, and delete a job using Dapr's Job API. This API is responsible for scheduling and running jobs at a specific time or interval.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/jobs/) link for more information about Dapr and the Job API.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one service:
 
- Go service `app`

### Run and initialize the server

Open a new terminal, change directories to `/maintenance-scheduler`, and start the server: 

```bash
cd maintenance-scheduler
dapr run --app-id maintenance-scheduler --app-port 5200 --dapr-http-port 5280 -- go run .
```

### Schedule a job using an HTTP request

 Open a new terminal window and run:

```bash
curl -X POST \
  http://localhost:6002/v1.0-alpha1/jobs/r2-d2 \
  -H "Content-Type: application/json" \
  -d '{
        "job": {
            "data": {
                "maintenanceType": "Oil Change"
            },
            "dueTime": "30s"
        }
    }'
```

You should see a `202` response.

### Get a scheduled job using an HTTP request

On the same terminal window yoy used to schedule the job or a new one, run:

```bash
curl -X GET http://localhost:6002/v1.0-alpha1/jobs/r2-d2 -H "Content-Type: application/json" 
```

You should see the following:

```bash
{
  "name":"r2-d2",
  "dueTime":"30s",
  "data": {
     "maintenanceType": "Oil Change"
   }
}   
```

### Delete a scheduled job using an HTTP request

On the same terminal window you used to schedule the job or a new one, run:

```bash
curl -X DELETE http://localhost:6002/v1.0-alpha1/jobs/r2-d2 -H "Content-Type: application/json" 
```

You should see a `202` response.
