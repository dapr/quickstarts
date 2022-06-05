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
const app = express();
app.use(bodyParser.json());
const cors = require('cors');
const port = process.env.APP_PORT ?? '4000';

app.use(cors());

app.post('/divide', (req, res) => {
  let args = req.body;
  const [operandOne, operandTwo] = [Number(args['operandOne']), Number(args['operandTwo'])];
  
  console.log(`Dividing ${operandOne} by ${operandTwo}`);
  
  let result = operandOne / operandTwo;
  res.send(result.toString());
});

app.listen(port, () => console.log(`Listening on port ${port}!`));