// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const Client = new require('node-rest-client').Client;
const client = new Client();

const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const port = 3000;

app.get('/users', (req, res) => {
    var displayName = req.query.displayName;    

    // Calling Microsoft Graph API

    // request headers
    var args = {
        parameters: { $filter: `displayName eq '${displayName}'` },
        headers: { "Authorization": req.headers["msgraph-token"] } 
    };
     
    // calling API
    client.get("https://graph.microsoft.com/v1.0/users", args,
        function (data) {
            // parsed response body as js object
            res.send(data);  
        });

});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));