import os
import time
import requests
import json

C3PO_JOB_BODY = {
    "data": {
        "@type": "type.googleapis.com/google.protobuf.StringValue",
        "value": "C-3PO:Limb Calibration"
    },
    "dueTime": "30s"
}

R2D2_JOB_BODY = {
    "data": {
        "@type": "type.googleapis.com/google.protobuf.StringValue",
        "value": "R2-D2:Oil Change"
    },
    "dueTime": "2s"
}

def main():
    # Sleep for 5 seconds to wait for job-service to start
    time.sleep(5)
    
    dapr_host = os.getenv('DAPR_HOST', 'http://localhost')
    scheduler_dapr_http_port = "6280"
    
    # Schedule R2-D2 job
    job_name = "R2-D2"
    req_url = f"{dapr_host}:{scheduler_dapr_http_port}/v1.0-alpha1/jobs/{job_name}"
    
    response = requests.post(
        req_url,
        json=R2D2_JOB_BODY,
        headers={"Content-Type": "application/json"},
        timeout=15
    )
    
    if response.status_code != 204:
        raise Exception(f"Failed to register job event handler. Status code: {response.status_code}")
    
    print(f"Job Scheduled: {job_name}")
    
    time.sleep(5)
    
    # Schedule C-3PO job
    job_name = "C-3PO"
    req_url = f"{dapr_host}:{scheduler_dapr_http_port}/v1.0-alpha1/jobs/{job_name}"
    
    response = requests.post(
        req_url,
        json=C3PO_JOB_BODY,
        headers={"Content-Type": "application/json"},
        timeout=15
    )
    
    if response.status_code != 204:
        raise Exception(f"Failed to register job event handler. Status code: {response.status_code}")
    
    print(f"Job Scheduled: {job_name}")
    
    time.sleep(5)
    
    # Get C-3PO job details
    job_name = "C-3PO"
    req_url = f"{dapr_host}:{scheduler_dapr_http_port}/v1.0-alpha1/jobs/{job_name}"
    
    response = requests.get(req_url)
    if response.status_code == 200:
        print(f"Job details: {response.text}")
    else:
        print(f"Failed to get job details. Status code: {response.status_code}")
    
    time.sleep(5)

if __name__ == "__main__":
    main()