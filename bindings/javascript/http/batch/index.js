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

/*
dapr run --app-id batch-http --app-port 5001 --dapr-http-port 3500 --resources-path ../../../components -- node index.js
*/

import express from "express";
import fs from 'fs';
import axios from "axios";

const cronBinding = 'cron';
const sqlBinding = 'sqldb';

const DAPR_HOST = process.env.DAPR_HOST || 'http://localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const SERVER_PORT = process.env.APP_PORT || '5001';
const daprUrl = `${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/bindings/${sqlBinding}`;


const app = express();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
app.post('/' + cronBinding, (req, res) => {
    const loc = '../../../orders.json';
    fs.readFile(loc, 'utf8', async (err, data) => {
        console.log(`Dapr URL is: ${daprUrl}`);
        const orders = JSON.parse(data).orders;
        orders.forEach(order => {
            let sqlCmd = `insert into orders (orderid, customer, price) values (${order.orderid}, '${order.customer}', ${order.price});`;
            let payload = `{"operation": "exec", "metadata": {"sql": "${sqlCmd}"}}`;
            console.log(sqlCmd);
            try {
                let resp = axios.post(daprUrl, payload);                
            } catch (error) {
                console.error("SQL binding failed with: " + error.response.data);
                throw error
            }

        });
        console.log('Finished processing batch');
      });    
    res.status(200).send();
});

app.listen(SERVER_PORT, () => console.log(`listening on port ${SERVER_PORT}!`));
