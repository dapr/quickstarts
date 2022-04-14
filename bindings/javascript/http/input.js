/*
Copyright 2021 The Dapr Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// dapr run --app-id javascript-input-binding-http --app-port 3500 node input.js --components-path ../../components

import express from "express";
import bodyParser from "body-parser";
import "isomorphic-fetch";

const app = express();
app.use(bodyParser.json());

const port = 3500;

app.post('/sample-topic', (req, res) => {
    console.log("Javascript - Kafka HTTP input binding: " + JSON.stringify(req.body));
    res.status(200).send();
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));