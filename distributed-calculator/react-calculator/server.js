const express = require('express');
const path = require('path');
const request = require('request');

const app = express();

const port = 8080;
const daprPort = process.env.DAPR_HTTP_PORT || 3500;

const daprUrl = `http://localhost:${daprPort}/v1.0/invoke`;

// The name of the state store is specified in the components yaml file. 
// For this sample, state store name is specified in the file at: https://github.com/dapr/quickstarts/blob/master/hello-kubernetes/deploy/redis.yaml#L4
const stateStoreName = `statestore`;
const stateUrl = `http://localhost:${daprPort}/v1.0/state/${stateStoreName}`;

/**
The following routes forward requests (using pipe) from our React client to our dapr-enabled services. Our Dapr sidecar lives on localhost:<daprPort>. We invoke other Dapr enabled services by calling /v1.0/invoke/<DAPR_ID>/method/<SERVICE'S_ROUTE>.
*/

app.post('/calculate/add', async (req, res) => {
  const addUrl = `${daprUrl}/addapp/method/add`;
  req.pipe(request(addUrl)).pipe(res);
});

app.post('/calculate/subtract', async (req, res) => {
  const subtractUrl = `${daprUrl}/subtractapp/method/subtract`;
  req.pipe(request(subtractUrl)).pipe(res);
});

app.post('/calculate/multiply', async (req, res) => {
  const multiplyUrl = `${daprUrl}/multiplyapp/method/multiply`;
  req.pipe(request(multiplyUrl)).pipe(res);
});

app.post('/calculate/divide', async (req, res) => {
  const divideUrl = `${daprUrl}/divideapp/method/divide`;
  req.pipe(request(divideUrl)).pipe(res);
});

// Forward state retrieval to Dapr state endpoint
app.get('/state', async (req, res) => req.pipe(request(`${stateUrl}/calculatorState`)).pipe(res));

// Forward state persistence to Dapr state endpoint
app.post('/persist', async (req, res) => req.pipe(request(stateUrl)).pipe(res));

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));

// For all other requests, route to React client
app.get('*', function (_req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}!`));
