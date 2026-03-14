# Dapr Bindings (Dapr SDK)

In this quickstart, you'll create a microservice to demonstrate Dapr's bindings API to work with external systems as inputs and outputs. The service listens to input binding events from a system CRON and then outputs the contents of local data to a PostgreSQL output binding.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/bindings/) link for more information about Dapr and Bindings.

> **Note:** This example leverages the Dapr SDK. If you are looking for the example using HTTP REST only [click here](../http).

This quickstart includes one service:

- Python service `batch-sdk`

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- Python 3.x
- Initialize Dapr: `dapr init`

---

## Run and initialize PostgreSQL container

1. Open a new terminal, change directories to `../../db`, and run the container with [Docker Compose](https://docs.docker.com/compose/):

<!-- STEP
name: Run and initialize PostgreSQL container
expected_return_code:
sleep: 60
timeout_seconds: 120
-->

```bash
cd ../../db
docker compose up -d
```

<!-- END_STEP -->

---

## Run Python service with Dapr

2. Open a new terminal window, change directories to `./batch` in the quickstart directory and run:

<!-- STEP
name: Install python dependencies
-->

```bash
cd ./batch
pip3 install -r requirements.txt
cd ..
```

<!-- END_STEP -->

---

3. From the quickstart directory `bindings/python/sdk`, run the Python service app with Dapr:

<!-- STEP
name: Run batch-sdk service
expected_stdout_lines:
  - 'insert into orders (orderid, customer, price) values (1, ''John Smith'', 100.32)'
  - 'insert into orders (orderid, customer, price) values (2, ''Jane Bond'', 15.4)'
  - 'insert into orders (orderid, customer, price) values (3, ''Tony James'', 35.56)'
  - 'Finished processing batch'
expected_stderr_lines:
output_match_mode: substring
sleep: 11
timeout_seconds: 60
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The `-f` flag runs the application using the **Multi-App Run configuration** defined in `dapr.yaml`, automatically starting both the application and its Dapr sidecar.

The cron input binding triggers the service every 10 seconds, and the service writes records to PostgreSQL using the output binding.

---

## Verify Data Persistence

4. Open a new terminal window and run the following command to check the rows in the database:

<!-- STEP
name: Verify Data Persistence
expected_stdout_lines:
  - 'orderid |  customer  | price'
  - '---------+------------+--------'
expected_stderr_lines:
output_match_mode: substring
-->

```bash
docker exec postgres psql -U postgres -d orders -c "SELECT * FROM orders;"
```

<!-- END_STEP -->
