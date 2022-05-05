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
// dapr run --app-id javascript-quickstart-binding-http --app-port 3500 --dapr-http-port 3501 node batch.js --components-path ../../components

import express from "express";
import "isomorphic-fetch";
import fs from 'fs';
import axios from "axios";

const appPort = 3500;
const daprPort = 3501;
const cronBinding = "/batch";
const sqlBinding = "SqlDB";

const app = express();

app.post('/batch', (req, res) => {
    const loc = '../../orders.json';
    fs.readFile(loc, 'utf8', (err, data) => {
        const orders = JSON.parse(data).orders;
        orders.forEach(order => {
            let sqlCmd = `insert into orders (orderid, customer, price) values (${order.orderid}, '${order.customer}', ${order.price});`;
            let payload = `{  "operation": "exec",  "metadata" : { "sql" : "${sqlCmd}" } }`;
            console.log(payload);
            axios.post(`http://localhost:${daprPort}/v1.0/bindings/${sqlBinding}`, payload);
        });
        console.log('Finished processing batch');
      });    
    res.status(200).send();
});

app.listen(appPort, () => console.log(`listening on port ${appPort}!`));