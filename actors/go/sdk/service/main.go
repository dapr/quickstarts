package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/dapr/go-sdk/actor"
	"github.com/dapr/go-sdk/actor/runtime"
	dapr "github.com/dapr/go-sdk/client"
	daprd "github.com/dapr/go-sdk/service/grpc"

	"dapr_actors_example/api"
)

const (
	alarmClearReminder = "AlarmClear"
	stateKey           = "smartdevicedata"
)

// SmokeDetectorActor is a smart smoke detector device. Each device is an
// actor instance with its own state, addressed by its actor ID.
type SmokeDetectorActor struct {
	actor.ServerImplBaseCtx
	daprClient dapr.Client
}

// smokeDetectorActorFactory returns a factory that shares a single Dapr
// client across all actor instances instead of opening a new connection per
// activation.
func smokeDetectorActorFactory(client dapr.Client) actor.FactoryContext {
	return func() actor.ServerContext {
		return &SmokeDetectorActor{daprClient: client}
	}
}

func (a *SmokeDetectorActor) Type() string {
	return "SmokeDetectorActor"
}

// SetData stores the device data as actor state.
func (a *SmokeDetectorActor) SetData(ctx context.Context, data *api.SmartDeviceData) (string, error) {
	if err := a.GetStateManager().Set(ctx, stateKey, data); err != nil {
		return "", err
	}
	return "Success", nil
}

// GetData returns the device data stored as actor state.
func (a *SmokeDetectorActor) GetData(ctx context.Context) (*api.SmartDeviceData, error) {
	data := api.SmartDeviceData{}
	exists, err := a.GetStateManager().Contains(ctx, stateKey)
	if err != nil {
		return nil, err
	}
	if exists {
		if err := a.GetStateManager().Get(ctx, stateKey, &data); err != nil {
			return nil, err
		}
	}
	return &data, nil
}

// DetectSmoke raises the alarm on this device and registers a one-shot
// reminder that clears it after 15 seconds.
func (a *SmokeDetectorActor) DetectSmoke(ctx context.Context) error {
	data, err := a.GetData(ctx)
	if err != nil {
		return err
	}
	data.Status = "Alarm"
	if err := a.GetStateManager().Set(ctx, stateKey, data); err != nil {
		return err
	}
	fmt.Printf("Smoke detected on device %s! Status set to Alarm\n", a.ID())

	// An empty Period makes the reminder fire only once. The reminder
	// callback is delivered over the actor event stream like every other
	// actor callback.
	return a.daprClient.RegisterActorReminder(ctx, &dapr.RegisterActorReminderRequest{
		ActorType: a.Type(),
		ActorID:   a.ID(),
		Name:      alarmClearReminder,
		DueTime:   "15s",
	})
}

// ReminderCall is invoked when a reminder fires. AlarmClear resets an alarmed
// device back to Ready.
func (a *SmokeDetectorActor) ReminderCall(reminderName string, state []byte, dueTime string, period string) {
	if reminderName != alarmClearReminder {
		return
	}
	ctx := context.Background()
	data, err := a.GetData(ctx)
	if err != nil {
		log.Printf("error reading state on reminder %s: %v", reminderName, err)
		return
	}
	data.Status = "Ready"
	if err := a.GetStateManager().Set(ctx, stateKey, data); err != nil {
		log.Printf("error updating state on reminder %s: %v", reminderName, err)
		return
	}
	// Method invocations flush actor state automatically, but reminder
	// callbacks do not - save explicitly so the cleared alarm is persisted.
	if err := a.SaveState(ctx); err != nil {
		log.Printf("error saving state on reminder %s: %v", reminderName, err)
		return
	}
	fmt.Printf("Reminder %s fired on device %s: alarm cleared, status reset to Ready\n", reminderName, a.ID())
}

func main() {
	// The sidecar accepts the actor event stream only when its app channel is
	// gRPC (--app-protocol grpc), so a gRPC app callback service must be
	// listening on the app port. Actor callbacks are NOT delivered to this
	// server: they all arrive over the actor event stream opened below.
	service, err := daprd.NewService(":50051")
	if err != nil {
		log.Fatalf("error creating gRPC service: %v", err)
	}
	go func() {
		if err := service.Start(); err != nil {
			log.Fatalf("error starting gRPC service: %v", err)
		}
	}()
	defer service.GracefulStop() //nolint:errcheck

	client, err := dapr.NewClient()
	if err != nil {
		log.Fatalf("error creating Dapr client: %v", err)
	}
	defer client.Close()

	// Register the hosted actor types on the actor runtime, exactly as when
	// hosting actors over HTTP.
	rt := runtime.GetActorRuntimeInstanceContext()
	rt.RegisterActorFactory(smokeDetectorActorFactory(client))

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Host the registered actor types over the actor event stream (Alpha).
	// Once established, the stream reconnects and re-registers the actor
	// types automatically if the sidecar restarts or the stream drops.
	stop, err := subscribeWithRetry(ctx, client, rt)
	if err != nil {
		log.Fatalf("error subscribing to actor events: %v", err)
	}
	defer stop() //nolint:errcheck

	fmt.Println("Actor event subscription started. Hosting SmokeDetectorActor over the actor event stream.")

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	<-sigCh
}

// subscribeWithRetry subscribes to actor events, retrying while the sidecar
// is still initializing its app channel.
func subscribeWithRetry(ctx context.Context, client dapr.Client, rt *runtime.ActorRunTimeContext) (func() error, error) {
	var err error
	for i := 0; i < 30; i++ {
		var stop func() error
		stop, err = client.SubscribeActorEvents(ctx, rt, dapr.ActorEventSubscriptionOptions{
			ActorIdleTimeout: time.Hour,
		})
		if err == nil {
			return stop, nil
		}
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(time.Second):
		}
	}
	return nil, err
}
