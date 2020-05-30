# Dapr with Docker-Compose

This sample demonstrates how to get Dapr running locally with Docker Compose. This uses the same applications as the `1.hello-world` sample, please review those docs for further information on the applicaiton architecture.

## Prerequisites
Clone this repo using `git clone https://github.com/dapr/samples.git` and go to the directory named */10.hello-docker-compose*

- [Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Reviewing the Docker Compose Definition

Review the Docker Compose file *./docker-compose.yml* below:

```yaml
version: '3'
services:
  ############################
  # Node app + Dapr sidecar
  ############################
  nodeapp:
    build: ./node
    ports:
      - "50002:50002"
    depends_on:
      - redis
      - placement
    networks:
      - hello-dapr
  nodeapp-dapr:
    image: "daprio/daprd:edge"
    command: ["./daprd",
     "-app-id", "nodeapp",
     "-app-port", "3000",
     "-placement-address", "placement:50006",
     "-dapr-grpc-port", "50002"]
    volumes:
        - "./components/:/components"
    depends_on:
      - nodeapp
    network_mode: "service:nodeapp"
  ############################
  # Python app + Dapr sidecar
  ############################
  pythonapp:
    build: ./python
    depends_on:
      - redis
      - placement
    networks:
      - hello-dapr
  pythonapp-dapr:
    image: "daprio/daprd:edge"
    command: ["./daprd",
    "-app-id", "pythonapp",
    "-placement-address", "placement:50006"]
    volumes:
      - "./components/:/components"
    depends_on:
      - pythonapp
    network_mode: "service:pythonapp"
  ############################
  # Dapr placement service
  ############################
  placement:
    image: "daprio/dapr"
    command: ["./placement", "-port", "50006"]
    ports:
      - "50006:50006"
    networks:
      - hello-dapr
  ############################
  # Redis state store
  ############################
  redis:
    image: "redis:alpine"
    ports:
      - "6379:6379"
    networks:
      - hello-dapr
networks:
    hello-dapr:
```

### Services
This Docker Compose defintion has the following containerized services:
- `nodeapp`        // The node app
- `nodeapp-dapr`   // The node app dapr sidecar
- `pythonapp`      // The python app
- `pythonapp-dapr` // The python app dapr sidecar
- `placement`      // Dapr's placement service
- `redis`          // Redis

### Networking
Each of these services is deployed to the `hello-dapr` docker network and have their own IP on that network.
The `nodeapp-dapr` and `pythonapp-dapr` services are sharing a network namespace with their associated app service by using [`network_mode`](https://docs.docker.com/compose/compose-file/#network_mode).
This means that the app and the sidecars are able to communicate over their localhost interface.

> Ports still need to be bound on the host machine, therefore, we use alternative ports from the dapr defaults to avoid conflict.

### Volumes
In order to get Dapr to load the redis statestore and pubsub components, you need to mount the 
`./components` directory to the default working directory. These component definitions have been modified
to talk to redis using a DNS name `redis` rather than localhost. This resolves on the docker network to
the IP of the container running redis at runtime.

## Deploy the Docker Compose Definition
To deploy the above `docker-compose.yml` run:
```
make run
```
or natively:
```
docker-compose up
```
> If you want to change the dapr docker image used in the deployment, you can
  set the env var `DAPR_IMAGE` and this image is used instead. This generates
  a `docker-compose.override.yml` file that you need to remove when no longer
  required.

## Clean up

To tear down the Docker Compose deployment, you can run;
```
docker-compose down
```

## Additional Resources:

[Overview of Docker Compose](https://docs.docker.com/compose/)
