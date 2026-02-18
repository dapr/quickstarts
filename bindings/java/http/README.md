# Dapr Bindings (HTTP)

In this quickstart, you'll create a microservice to demonstrate Dapr's bindings API to work with external systems as inputs and outputs. The service listens to input binding events from a system CRON and then outputs the contents of local data to a PostreSql output binding.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/bindings/) link for more information about Dapr and Bindings.

> **Note:** This example leverages only HTTP REST. If you are looking for the example using the Dapr SDK [click here](../sdk).

This quickstart includes one service:

- Java service `batch`

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- Java 17+
- Maven 3.x+
- Initialize Dapr: `dapr init`

### Run and initialize PostgreSQL container

1. Open a new terminal, change directories to `../../db`, and run the container with [Docker Compose](https://docs.docker.com/compose/):

<!-- STEP
name: Run and initialize PostgreSQL container
expected_return_code:
background: true
sleep: 60
timeout_seconds: 120
-->

```bash
cd ../../db
docker compose up -d
```

<!-- END_STEP -->

### Run Java service with Dapr

2. From the quickstart directory `bindings/java/http`, run:

<!-- STEP
name: Run batch-http service
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

This command starts the Spring Boot service and the Dapr sidecar automatically using the configuration in `dapr.yaml`.

The cron input binding triggers the service every 10 seconds, and the service writes records to PostgreSQL using the output binding.

### Verify Data Persistence

3. To verify that the data is being persisted, run the following command to check the rows in the database:

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
