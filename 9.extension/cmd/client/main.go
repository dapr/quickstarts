package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"time"

	crypto "github.com/dapr/samples/extension/pkg/crypto"
	"google.golang.org/grpc"
)

func main() {

	daprGrpcPort := flag.Int("daprGrpcPort", 50051, "grpc port")
	daprHost := flag.String("daprHost", "localhost", "dapr host")
	encrypt := flag.Bool("encrypt", false, "encrypt a string")
	decrypt := flag.Bool("decrypt", false, "decrypt a string")
	data := flag.String("data", "", "either encrypted or decrypted value")

	flag.Parse()

	endpoint := fmt.Sprintf("%s:%v", *daprHost, *daprGrpcPort)
	conn, err := grpc.Dial(endpoint, grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}

	defer conn.Close()
	c := crypto.NewCryptoClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	var resp string
	if *encrypt {
		r, err := c.Encrypt(ctx, &crypto.EncryptRequest{Value: string(*data)})
		if err != nil {
			log.Fatalf("could not call: %v", err)
		}
		resp = r.Encrypted
	} else if *decrypt {
		r, err := c.Decrypt(ctx, &crypto.DecryptRequest{Value: *data})
		if err != nil {
			log.Fatalf("could not call: %v", err)
		}
		resp = r.Decrypted
	} else {
		log.Printf("Invalid option")
		return
	}
	fmt.Println(resp)
}
