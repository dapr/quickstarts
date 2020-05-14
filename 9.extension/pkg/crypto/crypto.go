package crypto

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"io"
	"strconv"

	"github.com/dapr/components-contrib/custom"
	"github.com/dapr/dapr/pkg/logger"
	"golang.org/x/crypto/pbkdf2"
	"google.golang.org/grpc"
)

type (

	// Crypto encapsulates logic of encrypt/decrypt strings 
	// using AES cipher. 
	Crypto struct {
		logger logger.Logger
		config *config
		block  cipher.Block
	}

	config struct {
		base string
		salt string
		bits int
	}
)

// New create instance of Crypto struct
func New(logger logger.Logger) *Crypto {
	return &Crypto{logger: logger}
}

// Init method initialize the Crypto component. It is called by Dapr runtime 
// with user-defined configuration metadata from YAML manifest files.
func (c *Crypto) Init(metadata custom.Metadata) error {

	// Get configuration from metadata. This is set in `crypto.yaml` file
	c.config = &config{
		base: metadata.Properties["base"],
		salt: metadata.Properties["salt"],
		bits: getIntOrDefault(metadata.Properties["pwd"], 256),
	}

	// create a secret passphrase
	secret := pbkdf2.Key([]byte(c.config.base), []byte(c.config.salt), 65536, c.config.bits/8, sha1.New)

	// create AES cipher block with secret
	block, err := aes.NewCipher(secret)
	if err != nil {
		return err
	}
	c.block = block

	c.logger.Infof("custom gRPC crypto initialized")

	return nil
}

// RegisterServer registers auto-generated Crypto RPC proto stub in provided gRPC server. It recives 
// internal `grpc.Server` instance from Dapr runtime to register new gRPC endpoints. 
func (c *Crypto) RegisterServer(s *grpc.Server) error {

	RegisterCryptoServer(s, c)

	c.logger.Infof("custom gRPC crypto endpoint registered")

	return nil
}

// Encrypt method encrypts normal string to base64 encrypted strings using AES cipher.
func (c *Crypto) Encrypt(ctx context.Context, req *EncryptRequest) (*EncryptResponse, error) {

	plaintext := []byte(req.Value)

	ciphertext := make([]byte, aes.BlockSize+len(plaintext))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		panic(err)
	}
	stream := cipher.NewCFBEncrypter(c.block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

	encryptText := base64.URLEncoding.EncodeToString(ciphertext)

	c.logger.Infof("Encryption %s to %s", plaintext, string(encryptText))

	return &EncryptResponse{
		Encrypted: string(encryptText),
	}, nil
}

// Decrypt method decrypts encrypted strings back to normal strings using AES cipher.
func (c *Crypto) Decrypt(ctx context.Context, req *DecryptRequest) (*DecryptResponse, error) {

	encrypted, _ := base64.URLEncoding.DecodeString(req.Value)
	if byteLen := len(encrypted); byteLen < aes.BlockSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	iv := encrypted[:aes.BlockSize]
	ciphertext := encrypted[aes.BlockSize:]

	cipher.NewCFBDecrypter(c.block, iv).XORKeyStream(ciphertext, ciphertext)

	c.logger.Infof("Decryption %s to %s", req.Value, string(ciphertext))

	return &DecryptResponse{
		Decrypted: string(ciphertext),
	}, nil
}

func getIntOrDefault(val string, fallback int) int {
	if val != "" {
		i, err := strconv.Atoi(val)
		if err != nil {
			return fallback
		}
		return i
	}
	return fallback
}
