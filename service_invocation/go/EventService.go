package main

import (
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
)

func main() {
	for true {
		time.Sleep(5000)
		orderId := rand.Intn(1000-1) + 1
		uri := "http://localhost:6001/order/" + strconv.Itoa(orderId)
		response, err := http.Get(uri)

		if err != nil {
			os.Exit(1)
		}

		result, err := ioutil.ReadAll(response.Body)
		if err != nil {
			log.Fatal(err)
		}

		log.Println("Order processed for order id " + strconv.Itoa(orderId))
		log.Println(result)
	}
}
