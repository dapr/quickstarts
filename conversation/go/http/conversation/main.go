package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const stateStoreComponentName = "statestore"

func main() {
	daprHost := os.Getenv("DAPR_HOST")
	if daprHost == "" {
		daprHost = "http://localhost"
	}
	daprHttpPort := os.Getenv("DAPR_HTTP_PORT")
	if daprHttpPort == "" {
		daprHttpPort = "3500"
	}

	client := http.Client{
		Timeout: 15 * time.Second,
	}

	input, _ := json.Marshal([]map[string]string{
		{
			"inputs": "what is Dapr",
		},
	})

	res, err := client.Post(daprHost+":"+daprHttpPort+"/v1.0-alpha1/conversation/"+stateStoreComponentName+"/converse", "application/json", bytes.NewReader(input))
	if err != nil {
		panic(err)
	}

	output, err := io.ReadAll(res.Request.Response.Body)
	if err != nil {
		panic(err)
	}
	fmt.Println("Retrieved response:", string(output))

	res.Body.Close()
	fmt.Println("Input sent sent:", input)
}
