/*
Copyright 2021 The Dapr Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

/*
dapr run --app-id job-http --app-port 3500 --dapr-http-port 60021 --log-level debug --scheduler-host-address=127.0.0.1:50006 -- go run .
*/

import (
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "6002"
	}

	r := mux.NewRouter()

	// Start the server; this is a blocking call
	err := http.ListenAndServe(":"+appPort, r)
	if !errors.Is(err, http.ErrServerClosed) {
		log.Panic(err)
	}
}
