package main

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

var ORDER_IDS = []string{"orderId1", "orderId2"}
var ORDER_IDS_VERSION = map[string]int{
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

	for i := 0; i <30; i++ {
		item := ORDER_IDS[i%2]
		ORDER_IDS_VERSION[item]++
		rdb.Set(ctx, item, uuid.New().String(), 0)
		fmt.Printf("update %s value to version %d \n", item, ORDER_IDS_VERSION[item])
		time.Sleep(2 * time.Second)
	}
}
