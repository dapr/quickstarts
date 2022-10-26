package main

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

var CONFIGURATION_ITEMS = []string{"appID1", "appID2"}
var CONFIGURATION_ITEMS_VERSION = map[string]int{
	"appID1": 0,
	"appID2": 0,
}

func main() {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	for i:=0; ; i++ {
		item := CONFIGURATION_ITEMS[i%2]
		CONFIGURATION_ITEMS_VERSION[item]++
		rdb.Set(ctx, item, uuid.New().String(), 0)
		fmt.Printf("update %s value to version %d \n", item, CONFIGURATION_ITEMS_VERSION[item])
		time.Sleep(2 * time.Second)
	}
}
