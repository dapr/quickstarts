import os
import json
import time
from typing import Optional
from dataclasses import dataclass
import requests


@dataclass
class DroidJob:
    name: Optional[str] = None
    job: Optional[str] = None
    due_time: int = 1


# Job details
r2d2_job = DroidJob(name="R2-D2", job="Oil Change", due_time=15)
c3po_job = DroidJob(name="C-3PO", job="Limb Calibration", due_time=20)

dapr_host = os.getenv('DAPR_HOST', 'http://localhost')
dapr_port = os.getenv('DAPR_HTTP_PORT', '3500')


def schedule_job(job: DroidJob) -> None:

    print(f"Sending request to schedule job: {job.name}", flush=True)

    try:
        # Convert the job to a dictionary for JSON serialization
        job_data = {
            "name": job.name,
            "job": job.job,
            "dueTime": job.due_time
        }

        # Use HTTP client to call the job-service-sdk via Dapr
        req_url = f"{dapr_host}:{dapr_port}/v1.0/invoke/job-service-sdk/method/scheduleJob"

        response = requests.post(
            req_url,
            json=job_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )

        # Accept both 200 and 204 as success codes
        if response.status_code not in [200, 204]:
            raise Exception(
                f"Failed to schedule job. Status code: {response.status_code}, Response: {response.text}", flush=True)

        if response.text:
            print(f"Response: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Error scheduling job {job.name}: {str(e)}", flush=True)
        raise


def get_job_details(job: DroidJob) -> None:

    print(f"Sending request to retrieve job: {job.name}", flush=True)

    try:
        # Use HTTP client to call the job-service-sdk via Dapr
        req_url = f"{dapr_host}:{dapr_port}/v1.0/invoke/job-service-sdk/method/getJob/{job.name}"

        response = requests.get(req_url)

        if response.status_code in [200, 204]:
            print(f"Job details for {job.name}: {response.text}", flush=True)
        else:
            print(
                f"Failed to get job details. Status code: {response.status_code}, Response: {response.text}")

    except requests.exceptions.RequestException as e:
        print(
            f"Error getting job details for {job.name}: {str(e)}", flush=True)
        raise


def main():
    # Allow time for the job-service-sdk to start
    time.sleep(5)

    try:
        # Schedule R2-D2 job
        schedule_job(r2d2_job)
        time.sleep(5)

        # Get R2-D2 job details
        get_job_details(r2d2_job)
        time.sleep(5)

        # Schedule C-3PO job
        schedule_job(c3po_job)
        time.sleep(5)

        # Get C-3PO job details
        get_job_details(c3po_job)
        time.sleep(30)  # Allow time for jobs to complete

    except Exception as e:
        print(f"Error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
