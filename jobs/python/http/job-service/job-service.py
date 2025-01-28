import os
from flask import Flask, request, jsonify
import json
import traceback

app = Flask(__name__)

class DroidJob:
    def __init__(self, droid: str, task: str):
        self.droid = droid
        self.task = task

def set_droid_job(decoded_value: str) -> DroidJob:
    # Remove newlines from decoded value and split into droid and task
    droid_str = decoded_value.replace('\n', '')
    droid_array = droid_str.split(':')
    return DroidJob(droid_array[0], droid_array[1])

@app.route('/job/<job>', methods=['POST'])
def handle_job(job):
    print(f"Received job request...")
    
    try:
        print("Raw request data:", request.get_data().decode('utf-8'))
        job_data = request.get_json()
        print("Parsed job data:", json.dumps(job_data, indent=2))
        
        if not job_data:
            return "Error reading request body", 400
        
        # In Dapr, the job data comes in a special "data" field within the request
        value = job_data.get('data', {}).get('value', '')
        print(f"Extracted value: {value}")
            
        # Create DroidJob from value
        droid_job = set_droid_job(value)
        
        print(f"Starting droid: {droid_job.droid}")
        print(f"Executing maintenance job: {droid_job.task}")
        
        return "", 200
        
    except Exception as e:
        print(f"Error processing job request:")
        print(traceback.format_exc())
        return f"Error processing job: {str(e)}", 400

if __name__ == '__main__':
    app_port = os.getenv('APP_PORT', '6200')
    print(f"Server started on port {app_port}")
    app.run(host='0.0.0.0', port=int(app_port))