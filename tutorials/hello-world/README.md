# Hello World

This tutorial will demonstrate how to get Dapr running locally on your machine. You'll be deploying a Node.js app that subscribes to order messages and persists them. The following architecture diagram illustrates the components that make up the first part sample:

![Architecture Diagram](./img/Architecture_Diagram.png)

Later on, you'll deploy a Python app to act as the publisher. The architecture diagram below shows the addition of the new component:

![Architecture Diagram Final](./img/Architecture_Diagram_B.png)

## Prerequisites
This quickstart requires you to have the following installed on your machine:
- [Docker](https://docs.docker.com/)
- [Node.js version 14 or greater](https://nodejs.org/en/)
- [Python 3.x](https://www.python.org/downloads/): Note: When running this quickstart on Windows, it best to install Python from python.org rather than from the Windows store.
- [Postman](https://www.getpostman.com/) [Optional]

## Step 1 - Setup Dapr

Follow [instructions](https://docs.dapr.io/getting-started/install-dapr-cli/) to download and install the Dapr CLI and initialize Dapr.

## Step 2 - Understand the code

Now that Dapr is set up locally, clone the repo, then navigate to the Node.js version of the Hello World quickstart:

```sh
git clone [-b <dapr_version_tag>] https://github.com/dapr/quickstarts.git
cd quickstarts/tutorials/hello-world/node
```

> **Note**: See https://github.com/dapr/quickstarts#supported-dapr-runtime-version for supported tags. Use `git clone https://github.com/dapr/quickstarts.git` when using the edge version of dapr runtime.


In the `app.js` you'll find a simple `express` application, which exposes a few routes and handlers. First, take a look at the top of the file:

```js
const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const stateStoreName = `statestore`;
const stateUrl = `http://localhost:${daprPort}/v1.0/state/${stateStoreName}`;
```

Dapr CLI creates an environment variable for the Dapr port, which defaults to 3500. You'll be using this in step 3 when sending POST messages to the system. The `stateStoreName` is the name given to the state store. You'll come back to that later on to see how that name is configured.

Next, take a look at the ```neworder``` handler:

```js
app.post('/neworder', async (req, res) => {
    const data = req.body.data;
    const orderId = data.orderId;
    console.log("Got a new order! Order ID: " + orderId);

    const state = [{
        key: "order",
        value: data
    }];

    try {
        const response = await fetch(stateUrl, {
            method: "POST",
            body: JSON.stringify(state),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!response.ok) {
            throw "Failed to persist state.";
        }
        console.log("Successfully persisted state.");
        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send({message: error});
    }
});
```

Here the app is exposing an endpoint that will receive and handle `neworder` messages. It first logs the incoming message, and then persist the order ID to the Redis store by posting a state array to the `/state/<state-store-name>` endpoint.

Alternatively, you could have persisted the state by simply returning it with the response object:

```js
res.json({
        state: [{
            key: "order",
            value: order
        }]
    })
```

This approach, however, doesn't allow you to verify if the message successfully persisted.

The app also exposes a GET endpoint, `/order`:

```js
app.get('/order', async (_req, res) => {
    try {
        const response = await fetch(`${stateUrl}/order`)
        if (!response.ok) {
            throw "Could not get state.";
        }
        const orders = await response.text();
        res.send(orders);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({message: error});
    }
});
```

This calls out to the Redis cache to retrieve the latest value of the "order" key, which effectively allows the Node.js app to be _stateless_.

## Step 3 - Run the Node.js app with Dapr

Open a new terminal and navigate to the `./hello-world/node` directory and follow the steps below:

<!-- STEP
expected_stdout_lines:
expected_stderr_lines:
name: "npm install"
working_dir: node
-->

1. Install dependencies:

   ```bash
   npm install
   ```

<!-- END_STEP -->

This will install `express` and `body-parser`, dependencies that are shown in the `package.json`.

<!-- STEP
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - "== APP == Got a new order! Order ID: 42"
  - "== APP == Successfully persisted state."
  - "== APP == Got a new order! Order ID: 42"
  - "== APP == Successfully persisted state."
  - "== APP == Got a new order! Order ID: 1"
  - "== APP == Successfully persisted state."
  - "== APP == Got a new order! Order ID: 2"
  - "== APP == Successfully persisted state."
  - "== APP == Got a new order! Order ID: 3"
  - "== APP == Successfully persisted state."
  - "== APP == Got a new order! Order ID: 4"
  - "== APP == Successfully persisted state."
  - "== APP == Got a new order! Order ID: 5"
  - "== APP == Successfully persisted state."
  - "Exited Dapr successfully"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
name: "run npm app"
background: true
working_dir: node
sleep: 5
-->

2. Run Node.js app with Dapr:
   ```bash
   dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 node app.js
   ```

<!-- END_STEP -->

The command should output text that looks like the following, along with logs:

```
Starting Dapr with id nodeapp. HTTP Port: 3500. gRPC Port: 9165
You're up and running! Both Dapr and your app logs will appear here.
...
```
> **Note**: the `--app-port` (the port the app runs on) is configurable. The Node app happens to run on port 3000, but you could configure it to run on any other port. Also note that the Dapr `--app-port` parameter is optional, and if not supplied, a random available port is used.

The `dapr run` command looks for the default components directory which for Linux/MacOS is `$HOME/.dapr/components` and for Windows is `%USERPROFILE%\.dapr\components` which holds yaml definition files for components Dapr will be using at runtime. When running locally, the yaml files which provide default definitions for a local development environment are placed in this default components directory. Review the `statestore.yaml` file in the `components` directory:

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
...
```

You can see the yaml file defined the state store to be Redis and is naming it `statestore`. This is the name which was used in `app.js` to make the call to the state store in the application:

```js
const stateStoreName = `statestore`;
const stateUrl = `http://localhost:${daprPort}/v1.0/state/${stateStoreName}`;
```

While in this tutorial the default yaml files were used, usually a developer would modify them or create custom yaml definitions depending on the application and scenario.

> **Optional**: Now it would be a good time to get acquainted with the [Dapr dashboard](https://docs.dapr.io/reference/cli/dapr-dashboard/). Which is a convenient interface to check status and information of applications running on Dapr. The following command will make it available on http://localhost:9999/.

```bash
dapr dashboard -p 9999
```

## Step 4 - Post messages to the service

Now that Dapr and the Node.js app are running, you can send POST messages against it, using different tools. **Note**: here the POST message is sent to port 3500 - if you used a different port, be sure to update your URL accordingly.

First, POST the message by using Dapr cli in a new terminal:

<!-- STEP
expected_stdout_lines:
  - "App invoked successfully"
expected_stderr_lines:
output_match_mode: substring
name: dapr invoke
working_dir: node
-->

```bash
dapr invoke --app-id nodeapp --method neworder --data-file sample.json
```

<!-- END_STEP -->

Alternatively, using `curl`:

<!-- STEP
expected_stdout_lines:
expected_stderr_lines:
name: curl test
working_dir: node
-->

```bash
curl -XPOST -d @sample.json -H Content-Type:application/json http://localhost:3500/v1.0/invoke/nodeapp/method/neworder
```

<!-- END_STEP -->

Or, using the Visual Studio Code [Rest Client Plugin](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

[sample.http](sample.http)
```http
POST http://localhost:3500/v1.0/invoke/nodeapp/method/neworder

{
  "data": {
    "orderId": "42"
  }
}
```

Last but not least, you can use the Postman GUI.

Open Postman and create a POST request against `http://localhost:3500/v1.0/invoke/nodeapp/method/neworder`
![Postman Screenshot](./img/postman1.jpg)
In your terminal, you should see logs indicating that the message was received and state was updated:
```bash
== APP == Got a new order! Order ID: 42
== APP == Successfully persisted state.
```

## Step 5 - Confirm successful persistence

Now, to verify the order was successfully persisted to the state store, create a GET request against: `http://localhost:3500/v1.0/invoke/nodeapp/method/order`. **Note**: Again, be sure to reflect the right port if you chose a port other than 3500.

<!-- STEP
expected_stdout_lines:
  - '{"orderId":"42"}'
expected_stderr_lines:
name: Persistence test curl
-->

```bash
curl http://localhost:3500/v1.0/invoke/nodeapp/method/order
```

<!-- END_STEP -->

or use Dapr CLI

<!-- STEP
expected_stdout_lines:
  - '{"orderId":"42"}'
  - "App invoked successfully"
expected_stderr_lines:
output_match_mode: substring
name: Persistence test dapr invoke
-->

```bash
dapr invoke --app-id nodeapp --method order --verb GET
```

<!-- END_STEP -->

or use the Visual Studio Code [Rest Client Plugin](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

[sample.http](sample.http)
```http
GET http://localhost:3500/v1.0/invoke/nodeapp/method/order
```

or use the Postman GUI

![Postman Screenshot 2](./img/postman2.jpg)

This invokes the `/order` route, which calls out to the Redis store for the latest data. Observe the expected result!

## Step 6 - Run the Python app with Dapr

Take a look at the Python App in the `./hello-world/python` directory to see how another application can invoke the Node App via Dapr without being aware of the destination's hostname or port. In the `app.py` file you can find the endpoint definition to call the Node App via Dapr.

```python
dapr_port = os.getenv("DAPR_HTTP_PORT", 3500)
dapr_url = "http://localhost:{}/v1.0/invoke/nodeapp/method/neworder".format(dapr_port)
```
It is important to notice the Node App's name (`nodeapp`) in the URL, it will allow Dapr to redirect the request to the right API endpoint. This name needs to match the name used to run the Node App earlier in this exercise.

The code block below shows how the Python App will incrementally post a new orderId every second, or print an exception if the post call fails.

```python
n = 0
while True:
    n += 1
    message = {"data": {"orderId": n}}

    try:
        response = requests.post(dapr_url, json=message)
    except Exception as e:
        print(e)

    time.sleep(1)
```

Now open a **new** terminal and go to the `./hello-world/python` directory.

<!-- STEP
name: "Install python requirements"
-->

1. Install dependencies:

   ```bash
   pip3 install requests
   ```

<!-- END_STEP -->

<!-- STEP
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - "Exited Dapr successfully"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
name: "run python app"
background: true
working_dir: python
sleep: 30
-->

2. Start the Python App with Dapr:

   ```bash
   dapr run --app-id pythonapp python3 app.py
   ```

<!-- END_STEP -->

3. If all went well, the **other** terminal, running the Node App, should log entries like these:

    ```
    Got a new order! Order ID: 1
    Successfully persisted state
    Got a new order! Order ID: 2
    Successfully persisted state
    Got a new order! Order ID: 3
    Successfully persisted state
    ```

> **Known Issue**: If you are running python3 on Windows from the Microsoft Store, and you get the following error message:

    exec: "python3": executable file not found in %!P(MISSING)ATH%!(NOVERB)

> This is due to golang being unable to properly execute Microsoft Store aliases. You can use the following command instead of the above:

    dapr run --app-id pythonapp cmd /c "python3 app.py"

> For more info please see [this](https://github.com/dapr/quickstarts/issues/240) issue.

4. Now, perform a GET request a few times and see how the orderId changes every second (enter it into the web browser, use Postman, or curl):

    ```http
    GET http://localhost:3500/v1.0/invoke/nodeapp/method/order
    ```
    ```json
    {
        "orderId": 3
    }
    ```

> **Note**: It is not required to run `dapr init` in the **second** terminal because dapr was already setup on your local machine initially, running this command again would fail.

## Step 7 - Cleanup

To stop your services from running, simply stop the "dapr run" process. Alternatively, you can spin down each of your services with the Dapr CLI "stop" command. For example, to spin down both services, run these commands in a new terminal:

<!-- STEP
expected_stdout_lines:
  - 'app stopped successfully: nodeapp'
  - 'app stopped successfully: pythonapp'
expected_stderr_lines:
output_match_mode: substring
name: Shutdown dapr
-->

```bash
dapr stop --app-id nodeapp
```

```bash
dapr stop --app-id pythonapp
```

<!-- END_STEP -->

To see that services have stopped running, run `dapr list`, noting that your services no longer appears!

## [Optional Steps] VS Code Debugging

If you are using Visual Studio Code, you can debug this application using the preconfigured launch.json and task.json files in the .vscode folder.
The .vscode folder has already been modified in the project to allow users to launch a compound configuration called "Node/Python Dapr" which will run both applications and allow you to debug in VS Code.

For more information on how to configure the files visit [How-To: Debug multiple Dapr applications](https://docs.dapr.io/developing-applications/ides/vscode/vscode-how-to-debug-multiple-dapr-apps/)

**Note**: Dapr offers a preview [Dapr Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr) for local development which enables users a variety of features related to better managing their Dapr applications and debugging of your Dapr applications for all supported Dapr languages which are .NET, Go, PHP, Python and Java.

## Next steps

Now that you've gotten Dapr running locally on your machine, consider these next steps:
- Explore additional quickstarts such as [pub-sub](../pub-sub), [bindings](../bindings) or the [distributed calculator app](../distributed-calculator).
- Run this hello world application in Kubernetes via the [Hello Kubernetes](../hello-kubernetes) quickstart.
- Learn more about Dapr in the [Dapr overview](https://docs.dapr.io/concepts/overview/) documentation.
- Explore [Dapr concepts](https://docs.dapr.io/concepts/) such as building blocks and components in the Dapr documentation.
