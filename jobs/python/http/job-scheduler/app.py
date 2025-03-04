import os
import time
import requests
import json

C3PO_JOB_BODY = {
    "data": {"@type": "type.googleapis.com/google.protobuf.StringValue", "value": "C-3PO:Limb Calibration"},
    "dueTime": "10s",
}

R2D2_JOB_BODY = {
    "data": {"@type": "type.googleapis.com/google.protobuf.StringValue", "value": "R2-D2:Oil Change"},
    "dueTime": "2s"
}

def schedule_job(host: str, port: str, job_name: str, job_body: dict) -> None:
    req_url = f"{host}:{port}/v1.0-alpha1/jobs/{job_name}"
    
    try:
        response = requests.post(
            req_url,
            json=job_body,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        # Accept both 200 and 204 as success codes
        if response.status_code not in [200, 204]:
            raise Exception(f"Failed to schedule job. Status code: {response.status_code}, Response: {response.text}")
        
        print(f"Job Scheduled: {job_name}")
        if response.text:
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error scheduling job {job_name}: {str(e)}")
        raise

def get_job_details(host: str, port: str, job_name: str) -> None:
    req_url = f"{host}:{port}/v1.0-alpha1/jobs/{job_name}"
    
    try:
        response = requests.get(req_url, timeout=15)
        if response.status_code in [200, 204]:
            print(f"Job details for {job_name}: {response.text}")
        else:
            print(f"Failed to get job details. Status code: {response.status_code}, Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error getting job details for {job_name}: {str(e)}")
        raise

def main():
    # Wait for services to be ready
    time.sleep(5)
    
    dapr_host = os.getenv('DAPR_HOST', 'http://localhost')
    job_service_dapr_http_port = os.getenv('JOB_SERVICE_DAPR_HTTP_PORT', '6280')
    
    # Schedule R2-D2 job
    schedule_job(dapr_host, job_service_dapr_http_port, "R2-D2", R2D2_JOB_BODY)
    time.sleep(5)
    
    # Schedule C-3PO job
    schedule_job(dapr_host, job_service_dapr_http_port, "C-3PO", C3PO_JOB_BODY)
    time.sleep(5)
    
    # Get C-3PO job details
    get_job_details(dapr_host, job_service_dapr_http_port, "C-3PO")
    time.sleep(5)

if __name__ == "__main__":
    main()