# Configuration Updater

> **Note:** Run this app in the background before running any configuration quickstart.

This golang app is used for `configuration` quickstarts to simulate updating value of configuration items in the configuration store.

## Prerequisite

* [Golang](https://go.dev/doc/install)
* Locally running redis instance - a redis instance is automatically created as a docker container when you run `dapr init`

## Running the app

1. Open a new terminal window and ensure you are in the [`config-updater`](./) directory:

```bash
go run .
```

2. Keep the app running in the terminal and use a new terminal for starting quickstart example service.