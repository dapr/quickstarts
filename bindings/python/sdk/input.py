#
# Copyright 2021 The Dapr Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# dapr run --app-id python-input-binding-sdk --app-protocol grpc --app-port 50051 --components-path ../../components python3 input.py
# pip3 install dapr dapr-ext-grpc

from dapr.ext.grpc import App, BindingRequest

app = App()
bindingName = "sample-topic"

@app.binding(bindingName)
def binding(request: BindingRequest):
    print('Python - Kafka SDK input binding: {}'.format(request.text()), flush=True)

app.run(50051)