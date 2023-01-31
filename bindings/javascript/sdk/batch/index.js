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
dapr run --app-id batch-sdk --app-port 5002 --dapr-http-port 3500 --resources-path ../../../components -- node index.js
*/

import { DaprClient, DaprServer } from "@dapr/dapr";
import fs from 'fs';

const cronBindingName = "cron";
const postgresBindingName = "sqldb";

const daprHost = process.env.DAPR_HOST || 'http://localhost';
const daprPort = process.env.DAPR_HTTP_PORT || '3500';
const serverHost = "127.0.0.1";
const serverPort = process.env.APP_PORT || '5002';

const client = new DaprClient(daprHost, daprPort);

const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);

async function start() {
    await server.binding.receive(cronBindingName,processBatch);
    await server.start();
}

start().catch((e) => {
    console.error(e);
    process.exit(1);
});


async function processBatch(){
    const loc = '../../../orders.json';
    fs.readFile(loc, 'utf8', (err, data) => {
        const orders = JSON.parse(data).orders;
        orders.forEach(order => {
            let sqlCmd = `insert into orders (orderid, customer, price) values (${order.orderid}, '${order.customer}', ${order.price});`;
            let payload = `{"sql": "${sqlCmd}"} `;
            console.log(payload);
            client.binding.send(postgresBindingName, "exec", "", JSON.parse(payload));
        });
        console.log('Finished processing batch');
    });
    return 0;
}

