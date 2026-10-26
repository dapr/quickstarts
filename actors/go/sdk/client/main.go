package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	dapr "github.com/dapr/go-sdk/client"

	"dapr_actors_example/api"
)

// actorType must match the Type() of the actor implementation hosted by the
// service app.
const actorType = "SmokeDetectorActor"

func main() {
	ctx := context.Background()

	client, err := dapr.NewClient()
	if err != nil {
		log.Fatalf("error creating Dapr client: %v", err)
	}
	defer client.Close()

	fmt.Println("Calling SetData on SmokeDetectorActor:1...")
	resp, err := setDataWithRetry(ctx, client, "1", api.SmartDeviceData{
		Location: "First Floor",
		Status:   "Ready",
	})
	if err != nil {
		log.Fatalf("error calling SetData on device 1: %v", err)
	}
	fmt.Println("Got response:", resp)

	fmt.Println("Calling GetData on SmokeDetectorActor:1...")
	printDeviceState(ctx, client, "1")

	fmt.Println("Calling SetData on SmokeDetectorActor:2...")
	resp, err = setData(ctx, client, "2", api.SmartDeviceData{
		Location: "Second Floor",
		Status:   "Ready",
	})
	if err != nil {
		log.Fatalf("error calling SetData on device 2: %v", err)
	}
	fmt.Println("Got response:", resp)

	fmt.Println("Calling GetData on SmokeDetectorActor:2...")
	printDeviceState(ctx, client, "2")

	fmt.Println("Detecting smoke on Device 1...")
	_, err = client.InvokeActor(ctx, &dapr.InvokeActorRequest{
		ActorType: actorType,
		ActorID:   "1",
		Method:    "DetectSmoke",
	})
	if err != nil {
		log.Fatalf("error detecting smoke on device 1: %v", err)
	}
	printDeviceState(ctx, client, "1")

	fmt.Println("Sleeping for 16 seconds before checking status again to see the reminder fire and clear the alarm")
	time.Sleep(16 * time.Second)

	printDeviceState(ctx, client, "1")
}

// setData invokes the SetData actor method. Actor method payloads and
// responses are plain JSON.
func setData(ctx context.Context, client dapr.Client, actorID string, data api.SmartDeviceData) (string, error) {
	payload, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	resp, err := client.InvokeActor(ctx, &dapr.InvokeActorRequest{
		ActorType: actorType,
		ActorID:   actorID,
		Method:    "SetData",
		Data:      payload,
	})
	if err != nil {
		return "", err
	}
	var result string
	if err := json.Unmarshal(resp.Data, &result); err != nil {
		return "", err
	}
	return result, nil
}

// setDataWithRetry retries the first actor call: right after the service
// starts, the placement service may not have disseminated the actor type to
// the sidecars yet.
func setDataWithRetry(ctx context.Context, client dapr.Client, actorID string, data api.SmartDeviceData) (string, error) {
	var (
		resp string
		err  error
	)
	for i := 0; i < 30; i++ {
		resp, err = setData(ctx, client, actorID, data)
		if err == nil {
			return resp, nil
		}
		time.Sleep(time.Second)
	}
	return resp, err
}

// printDeviceState invokes the GetData actor method and prints the device
// state from the JSON response.
func printDeviceState(ctx context.Context, client dapr.Client, actorID string) {
	resp, err := client.InvokeActor(ctx, &dapr.InvokeActorRequest{
		ActorType: actorType,
		ActorID:   actorID,
		Method:    "GetData",
	})
	if err != nil {
		log.Fatalf("error calling GetData on device %s: %v", actorID, err)
	}
	data := api.SmartDeviceData{}
	if err := json.Unmarshal(resp.Data, &data); err != nil {
		log.Fatalf("error decoding device %s state: %v", actorID, err)
	}
	fmt.Printf("Device %s state: Location: %s, Status: %s\n", actorID, data.Location, data.Status)
}
