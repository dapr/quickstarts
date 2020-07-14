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
     "-dapr-grpc-port", "50002",
     "-components-path", "/components"]
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
    "-placement-address", "placement:50006",
    "-components-path", "/components"]
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
      - "6380:6379"
    networks:
      - hello-dapr
networks:
    hello-dapr:
```

### Services
This Docker Compose defintion has the following containerized services:
- `nodeapp`        // The node app
- `nodeapp-dapr`   // The node app Dapr sidecar
- `pythonapp`      // The python app
- `pythonapp-dapr` // The python app Dapr sidecar
- `placement`      // Dapr's placement service
- `redis`          // Redis

### Networking
Each of these services is deployed to the `hello-dapr` Docker network and have their own IP on that network.
The `nodeapp-dapr` and `pythonapp-dapr` services are sharing a network namespace with their associated app service by using [`network_mode`](https://docs.docker.com/compose/compose-file/#network_mode).
This means that the app and the sidecars are able to communicate over their localhost interface.

> Ports are still bound on the host machine, therefore, we need to ensure we avoid port conflicts.

### Volumes
In order to get Dapr to load the redis statestore and pubsub components, you need to mount the 
`./components` directory to the default working directory. These component definitions have been modified
to talk to redis using a DNS name `redis` rather than localhost. This resolves on the Docker network to
the IP of the container running redis.

## Deploy the Docker Compose Definition
To deploy the above `docker-compose.yml` you can run:
```
make run
```
> If you want to change the Dapr Docker image used in the deployment, you can
  set the env var `DAPR_IMAGE` and run `make run`. This generates
  a `docker-compose.override.yml` file using your custom image. If you want
  to revert to the default Dapr Docker image, you'll need to remove this file.

altentiavely, you can just use Docker Compose directly:
```
docker-compose up
```

If everything went well logs from nodeapp about successful persistence of orders shoulod appear:

```bash
nodeapp_1         | Got a new order! Order ID: 1
nodeapp_1         | Successfully persisted state.
nodeapp_1         | Got a new order! Order ID: 2
nodeapp_1         | Successfully persisted state.
nodeapp_1         | Got a new order! Order ID: 3
```

## Clean up

To tear down the Docker Compose deployment, you can run:
```
docker-compose down
```

## Additional Resources:

[Overview of Docker Compose](https://docs.docker.com/compose/)
