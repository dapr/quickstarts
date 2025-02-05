import os
import json
import traceback
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class DroidJob:
    def __init__(self, droid: str, task: str):
        self.droid = droid
        self.task = task

def set_droid_job(decoded_value: str) -> DroidJob:
    # Remove newlines from decoded value and split into droid and task
    droid_str = decoded_value.replace('\n', '')
    droid_array = droid_str.split(':')
    return DroidJob(droid_array[0], droid_array[1])

class JobHandler(BaseHTTPRequestHandler):
    def _send_response(self, status_code: int, message: str = ""):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        if message:
            self.wfile.write(json.dumps({"message": message}).encode('utf-8'))

    def do_POST(self):
        print('Received job request...', flush=True)
        
        try:
            # Check if path starts with /job/
            if not self.path.startswith('/job/'):
                self._send_response(404, "Not Found")
                return

            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            raw_data = self.rfile.read(content_length).decode('utf-8')

            # Parse outer JSON data
            outer_data = json.loads(raw_data)

            # The payload might be double-encoded, so try parsing again if it's a string
            if isinstance(outer_data, str):
                job_data = json.loads(outer_data)
            else:
                job_data = outer_data

            # Extract value directly from the job data
            value = job_data.get('value', '')

            # Create DroidJob from value
            droid_job = set_droid_job(value)

            print("Starting droid: " + droid_job.droid, flush=True)
            print("Executing maintenance job: " + droid_job.task, flush=True)

            self._send_response(200)

        except Exception as e:
            print("Error processing job request:", flush= True)
            print(traceback.format_exc())
            self._send_response(400, f"Error processing job: {str(e)}")

def run_server(port: int):
    server_address = ('', port)
    httpd = HTTPServer(server_address, JobHandler)
    print("Server started on port " + str(port), flush=True)
    httpd.serve_forever()

if __name__ == '__main__':
    app_port = int(os.getenv('APP_PORT', '6200'))
    run_server(app_port)