import os
import json
import logging
from datetime import timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
from dapr.clients import DaprClient, Job, DropFailurePolicy, ConstantFailurePolicy

# Add protobuf availability check
try:
    from google.protobuf.any_pb2 import Any as GrpcAny
    PROTOBUF_AVAILABLE = True
except ImportError:
    PROTOBUF_AVAILABLE = False
    print('Warning: protobuf not available, jobs with data will be scheduled without data', flush=True)


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Dapr Jobs Service", version="1.0.0")

# Get app port from environment
app_port = int(os.getenv('APP_PORT', '6200'))

# Pydantic models for request/response


class JobData(BaseModel):
    droid: Optional[str] = None
    task: Optional[str] = None


class DroidJob(BaseModel):
    name: Optional[str] = None
    job: Optional[str] = None
    dueTime: int


def create_job_data(data_dict):
    # Create job data from a dictionary
    if not PROTOBUF_AVAILABLE:
        return None

    data = GrpcAny()
    data.value = json.dumps(data_dict).encode('utf-8')
    return data


@app.post("/scheduleJob")
def schedule_job(droid_job: DroidJob, response: Response):

    print(f"Scheduling job: {droid_job.name}", flush=True)

    if not droid_job.name or not droid_job.job:
        raise HTTPException(
            status_code=400, detail="Job must contain a name and a task")

    try:
        # Create job data payload
        job_data = JobData(
            droid=droid_job.name,
            task=droid_job.job
        )

        # Create the job
        job = Job(
            name=droid_job.name,
            due_time=f"{droid_job.dueTime}s",
            data=create_job_data(job_data.model_dump())
        )
        with DaprClient() as d:
            # Schedule the job
            d.schedule_job_alpha1(job=job, overwrite=True)

        print(f"Job scheduled: {droid_job.name}", flush=True)

        # Set 200 status and return the payload
        response.status_code = 200
        return droid_job

    except Exception as e:
        print(f"Error scheduling job: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error scheduling job: {str(e)}")


@app.get("/getJob/{name}")
async def get_job(name: str):

    print(f"Retrieving job: {name}")

    if not name:
        raise HTTPException(status_code=400, detail="Job name required")

    try:
        with DaprClient() as d:
            job = d.get_job_alpha1(name)

        if job is None:
            raise HTTPException(status_code=404, detail="Job not found")

        # Convert protobuf job object to dict for JSON serialization
        job_dict = {
            "name": job.name,
            "due_time": job.due_time,
        }

        # Handle job data if present
        if job.data:
            try:
                payload = json.loads(job.data.value.decode('utf-8'))
                job_dict["data"] = payload
            except Exception:
                job_dict["data"] = f"<binary data, {len(job.data.value)} bytes>"
        else:
            job_dict["data"] = None

        return job_dict

    except Exception as e:
        print(f"Error getting job: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/deleteJob/{name}")
async def delete_job(name: str):
    print(f"Deleting job: {name}")

    if not name:
        raise HTTPException(status_code=400, detail="Job name required")

    try:
        with DaprClient() as d:
            job_details = d.delete_job_alpha1(name)
        print(f"Job deleted: {name}")
        return {"message": "Job deleted"}

    except Exception as e:
        print(f"Error deleting job: {e}")
        raise HTTPException(status_code=400, detail="Error deleting job")


@app.post("/job/{job_name}")
async def handle_job(job_name: str, job_payload: dict):

    try:
        # Extract job data from payload
        # The payload structure depends on how the job was scheduled
        if "droid" in job_payload and "task" in job_payload:
            droid = job_payload["droid"]
            task = job_payload["task"]
        else:
            # Fallback: try to extract from the raw payload
            payload_str = str(job_payload)
            print(f"Raw payload: {payload_str}")

            # Try to parse as JSON if it's a string
            if isinstance(payload_str, str):
                try:
                    parsed = json.loads(payload_str)
                    droid = parsed.get("droid", "Unknown")
                    task = parsed.get("task", "Unknown")
                except json.JSONDecodeError:
                    droid = "Unknown"
                    task = payload_str
            else:
                droid = "Unknown"
                task = str(job_payload)

        # Execute the job
        print(f"Starting droid: {droid}", flush=True)
        print(f"Executing maintenance job: {task}", flush=True)

        return {"status": "success", "droid": droid, "task": task}

    except Exception as ex:
        print(f"Failed to handle job {job_name}")
        print(f"Error handling job: {ex}")
        raise HTTPException(
            status_code=500, detail=f"Error handling job: {str(ex)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=app_port)
