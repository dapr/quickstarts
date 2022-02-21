const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 8080;
const daprPort = process.env.DAPR_HTTP_PORT || 3500;

const daprUrl = `http://localhost:${daprPort}/v1.0/invoke`;

// The name of the state store is specified in the components yaml file. 
// For this sample, state store name is specified in the file at: https://github.com/dapr/quickstarts/blob/master/hello-kubernetes/deploy/redis.yaml#L4
const stateStoreName = `statestore`;
const stateUrl = `http://localhost:${daprPort}/v1.0/state/${stateStoreName}`;

const debugMode = process.env.DEBUG_MODE || false; // Emit debug level logs for State management

/**
The following routes forward requests (using pipe) from our React client to our dapr-enabled services. Our Dapr sidecar lives on localhost:<daprPort>. We invoke other Dapr enabled services by calling /v1.0/invoke/<DAPR_ID>/method/<SERVICE'S_ROUTE>.
*/

app.post('/calculate/add', async (req, res) => {
  const appUrl = `${daprUrl}/addapp/method/add`;

  // Dapr invoke add app
  const appResponse = await axios.post(appUrl, req.body);

  // Return expected string result to client
  const result = String(appResponse.data);
 
  res.send(result); 
});

app.post('/calculate/subtract', async (req, res) => {
  const appUrl = `${daprUrl}/subtractapp/method/subtract`;
  
  // Dapr invoke subtract app
  const appResponse = await axios.post(appUrl, req.body);

  // Return expected string result to client
  const result = String(appResponse.data);
  res.send(result); 
});

app.post('/calculate/multiply', async (req, res) => {
  const appUrl = `${daprUrl}/multiplyapp/method/multiply`;

  // Dapr invoke multiply app
  const appResponse = await axios.post(appUrl, req.body);

  // Return expected string result to client
  const result = String(appResponse.data);

  res.send(result);
});

app.post('/calculate/divide', async (req, res) => {
  const appUrl = `${daprUrl}/divideapp/method/divide`;

  // Dapr invoke divide app
  const appResponse = await axios.post(appUrl, req.body);

  // Return expected string result to client
  const result = String(Number(appResponse.data));

  res.send(result);
});

// Forward state retrieval to Dapr state endpoint
app.get('/state', async (req, res) => {

  // Getting Dapr state
  const apiResponse = await axios.get(`${stateUrl}/calculatorState`);
  if (debugMode) {console.log('Getting state: ', 'calculatorState')};

  // Return expected decimal result to client
  const result = apiResponse.data;
  if (debugMode) {console.log('Get state result: ', result)};

  res.send(result);
});

// Forward state persistence to Dapr state endpoint
app.post('/persist', async (req, res) => {
  //req.pipe(request(stateUrl)).pipe(res);

  // Saving Dapr state
  const apiResponse = await axios.post(stateUrl, req.body);
  if (debugMode) {console.log('Saving state: ', req.body)};

  // Return expected string result to client
  const result = String(apiResponse.data);
  if (debugMode) {console.log('State save returned: ', result)};

  res.send(result);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));

// For default home request route to React client
app.get('/', function (_req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}!`));
