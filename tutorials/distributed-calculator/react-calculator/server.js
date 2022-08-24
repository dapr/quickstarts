const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(express.json());

const port = 8080;
const daprPort = process.env.DAPR_HTTP_PORT ?? 3500;

const daprUrl = `http://localhost:${daprPort}/v1.0/invoke`;

// The name of the state store is specified in the components yaml file. 
// For this sample, state store name is specified in the file at: https://github.com/dapr/quickstarts/blob/master/hello-kubernetes/deploy/redis.yaml#L4
const stateStoreName = `statestore`;
const stateUrl = `http://localhost:${daprPort}/v1.0/state/${stateStoreName}`;

/**
The following routes forward requests (using pipe) from our React client to our dapr-enabled services. Our Dapr sidecar lives on localhost:<daprPort>. We invoke other Dapr enabled services by calling /v1.0/invoke/<DAPR_ID>/method/<SERVICE'S_ROUTE>.
*/

app.post('/calculate/add', async (req, res) => {
  try {
      // Invoke Dapr add app
      const appResponse = await axios.post(`${daprUrl}/addapp/method/add`, req.body);

      // Return expected string result to client
      return res.send(`${appResponse.data}`); 
  } catch (err) {
      console.log(err);
  }
});

app.post('/calculate/subtract', async (req, res) => {
  try {
      // Invoke Dapr subtract app
      console.log("subtract app** 1")
      const appResponse = await axios.post(`${daprUrl}/subtractapp/method/subtract`, req.body);
      console.log("subtract app** 2")
      // Return expected string result to client
      return res.send(`${appResponse.data}`); 
  } catch (err) {
      console.log(err);
  }
});

app.post('/calculate/multiply', async (req, res) => {
  try {
      // Dapr invoke multiply app
      const appResponse = await axios.post(`${daprUrl}/multiplyapp/method/multiply`, req.body);

      // Return expected string result to client
      return res.send(`${appResponse.data}`); 
  } catch (err) {
      console.log(err);
  }
});

app.post('/calculate/divide', async (req, res) => {
  try {
      // Dapr invoke divide app
      const appResponse = await axios.post(`${daprUrl}/divideapp/method/divide`, req.body);

      // Return expected string result to client
      return res.send(`${appResponse.data}`); 
  } catch (err) {
      console.log(err);
  }
});

// Forward state retrieval to Dapr state endpoint
app.get('/state', async (req, res) => {
  try {
    // Getting Dapr state
    const apiResponse = await axios.get(`${stateUrl}/calculatorState`);

    return res.send(apiResponse.data);
  } catch (err) {
    console.log(err);
  }
});

// Forward state persistence to Dapr state endpoint
app.post('/persist', async (req, res) => {
  try {
     // Saving Dapr state
    const apiResponse = await axios.post(stateUrl, req.body);
    return res.send(apiResponse.data);  
  } catch (err) {
    console.log(err);
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));

// For default home request route to React client
app.get('/', async function (_req, res) {
  try {
    return await res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } catch (err) {
    console.log(err);
  }
});

app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}!`));
