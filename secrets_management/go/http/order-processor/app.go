package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	var DAPR_HOST, DAPR_HTTP_PORT string
	var okHost, okPort bool
	if DAPR_HOST, okHost = os.LookupEnv("DAPR_HOST"); !okHost {
		DAPR_HOST = "http://localhost"
	}
	if DAPR_HTTP_PORT, okPort = os.LookupEnv("DAPR_HTTP_PORT"); !okPort {
		DAPR_HTTP_PORT = "3500"
	}

	const DAPR_SECRET_STORE = "localsecretstore"
	const SECRET_NAME = "secret"
	// Get secret from a local secret store
	getResponse, err := http.Get(DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0/secrets/" + DAPR_SECRET_STORE + "/" + SECRET_NAME)
	if err != nil {
		fmt.Print(err.Error())
		os.Exit(1)
	}
	result, _ := ioutil.ReadAll(getResponse.Body)
	fmt.Println("Fetched Secret: ", string(result))
}
