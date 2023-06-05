package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	dapr "github.com/dapr/go-sdk/client"
)

const (
	// Name of the crypto component to use
	CryptoComponentName = "localstorage"
	// Name of the RSA private key to use
	RSAKeyName = "rsa-private-key.pem"
	// Name of the symmetric (AES) key to use
	SymmetricKeyName = "symmetric-key-256"
)

func main() {
	// Create a new Dapr SDK client
	client, err := dapr.NewClient()
	if err != nil {
		log.Fatalf("Failed to initialize the Dapr client: %v", err)
	}
	defer client.Close()

	// Step 1: encrypt a string using the RSA key, then decrypt it and show the output in the terminal
	encryptDecryptString(client)

	// Step 2: encrypt a large file and then decrypt it, using the AES key
	encryptDecryptFile(client)
}

func encryptDecryptString(client dapr.Client) {
	const message = `The secret is "passw0rd"`

	// Encrypt the message
	encStream, err := client.Encrypt(context.Background(),
		strings.NewReader(message),
		dapr.EncryptOptions{
			ComponentName: CryptoComponentName,
			// Name of the key to use
			// Since this is a RSA key, we specify that as key wrapping algorithm
			KeyName:          RSAKeyName,
			KeyWrapAlgorithm: "RSA",
		},
	)
	if err != nil {
		log.Fatalf("Failed to encrypt the message: %v", err)
	}

	// The method returns a readable stream, which we read in full in memory
	encBytes, err := io.ReadAll(encStream)
	if err != nil {
		log.Fatalf("Failed to read the stream for the encrypted message: %v", err)
	}

	fmt.Printf("Encrypted the message, got %d bytes\n", len(encBytes))

	// Now, decrypt the encrypted data
	decStream, err := client.Decrypt(context.Background(),
		bytes.NewReader(encBytes),
		dapr.DecryptOptions{
			// We just need to pass the name of the component
			ComponentName: CryptoComponentName,
			// Passing the name of the key is optional
			KeyName: RSAKeyName,
		},
	)
	if err != nil {
		log.Fatalf("Failed to decrypt the message: %v", err)
	}

	// The method returns a readable stream, which we read in full in memory
	decBytes, err := io.ReadAll(decStream)
	if err != nil {
		log.Fatalf("Failed to read the stream for the decrypted message: %v", err)
	}

	// Print the message on the console
	fmt.Printf("Decrypted the message, got %d bytes\n", len(decBytes))
	fmt.Println(string(decBytes))
}

func encryptDecryptFile(client dapr.Client) {
	const fileName = "liuguangxi-66ouBTTs_x0-unsplash.jpg"

	// Get a readable stream to the input file
	plaintextF, err := os.Open(fileName)
	if err != nil {
		log.Fatalf("Failed to open plaintext file: %v", err)
	}
	defer plaintextF.Close()

	// Encrypt the file
	encStream, err := client.Encrypt(context.Background(),
		plaintextF,
		dapr.EncryptOptions{
			ComponentName: CryptoComponentName,
			// Name of the key to use
			// Since this is a symmetric key, we specify AES as key wrapping algorithm
			KeyName:          SymmetricKeyName,
			KeyWrapAlgorithm: "AES",
		},
	)
	if err != nil {
		log.Fatalf("Failed to encrypt the file: %v", err)
	}

	// Write the encrypted data to a file "encrypted.out"
	encryptedF, err := os.Create("encrypted.out")
	if err != nil {
		log.Fatalf("Failed to open destination file: %v", err)
	}
	_, err = io.Copy(encryptedF, encStream)
	if err != nil {
		log.Fatalf("Failed to write encrypted stream to file: %v", err)
	}
	encryptedF.Close()

	fmt.Println("Wrote decrypted data to encrypted.out")

	// Now, decrypt the encrypted data
	// First, open the file "encrypted.out" again, this time for reading
	encryptedF, err = os.Open("encrypted.out")
	if err != nil {
		log.Fatalf("Failed to open encrypted file: %v", err)
	}
	defer encryptedF.Close()

	// Now, decrypt the encrypted data
	decStream, err := client.Decrypt(context.Background(),
		encryptedF,
		dapr.DecryptOptions{
			// We just need to pass the name of the component
			ComponentName: CryptoComponentName,
			// Passing the name of the key is optional
			KeyName: SymmetricKeyName,
		},
	)
	if err != nil {
		log.Fatalf("Failed to decrypt the file: %v", err)
	}

	// Write the decrypted data to a file "decrypted.out.jpg"
	decryptedF, err := os.Create("decrypted.out.jpg")
	if err != nil {
		log.Fatalf("Failed to open destination file: %v", err)
	}
	_, err = io.Copy(decryptedF, decStream)
	if err != nil {
		log.Fatalf("Failed to write decrypted stream to file: %v", err)
	}
	decryptedF.Close()

	fmt.Println("Wrote decrypted data to decrypted.out.jpg")
}
