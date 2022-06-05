//
// Copyright 2021 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.APP_PORT ?? '3000' ;


require('isomorphic-fetch');

const app = express();
app.use(bodyParser.json());

app.post('/sample-topic', (req, res) => {
    console.log("Hello from Kafka!");
    console.log(req.body);
    res.status(200).send();
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));