# Extending Dapr
 
This sample demonstrates the extensibility of Dapr. Your organization may have a requirement to add custom functionality to Dapr, such as integration with propriety or legacy systems. Custom Components is a point of extension that allows third-party functionality to run alongside the existing building blocks that ship with Dapr.

For example, you have an existing library for encryption and decryption that you would like to expose as a building block to your applications. In this sample you'll be creating a custom component called Crypto and adding it to the daprd binary. Applications will connect to this component via a gRPC endpoint which is the same mechanism the Dapr SDKs uses.
 
In this sample you will be:
 
- Creating a custom Daprd binary.
- Use [Dapr](https://github.com/dapr/dapr) and [Component-Contrib](https://github.com/dapr/components-contrib) as libraries instead of binary.
- Plugin custom gRPC endpoint to Dapr internal gRPC server.
- Project structure and setup.
 
Dapr can be extended by using it as a library from your own project. Simply create a new Go project and copy the original [main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go) from Dapr Github source code to this new project(using Dapr as library here), next stitch together all the Components(Dapr runtime) in the same way as it was present in the original `main.go`, next register Custom component `Crypto` in runtime(we will explain this further). The new binary created after compilation is a custom `Daprd` binary with `Crypto` gRPC endpoint as a custom component.
 
## Prerequisites
 
For running this sample you should have the followings
 
1. Knowledge of [Protocol-buffers](https://developers.google.com/protocol-buffers) 
2. Knowledge of [gRPC](https://grpc.io/docs/tutorials/basic/go/)
 
## Step 1 - Setup Dapr
 
Follow [instructions](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#environment-setup) to download and install the Dapr CLI and initialize Dapr.
 
## Step 2 - Understand the Code
 
You'll be exposing a custom `Encryption/Decryption` logic as a gRPC endpoint. The proto interface looks like following
 
```grpc
 service Crypto {
   rpc Encrypt (EncryptRequest) returns (EncryptResponse) {} 
   rpc Decrypt (DecryptRequest) returns (DecryptResponse) {} 
 }
```
 
Now that we've set up Dapr locally and understand the `Crypto` proto interface, lets navigate to custom [main.go](./cmd/daprd/main.go). This file is copied from the Dapr Github source code [actual main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go). Here, we are using Dapr as a library, we can choose(Ala-carte style) features by adding or removing components from the Dapr runtime. Let's look more closely in [Main.go](./cmd/daprd/main.go) to find custom `Crypto` component registration code block
 
```go
runtime.WithCustomComponents(
   customs_loader.New("mycrypto", func() customs_loader.CustomComponent {
           return custom_crypto.New(logContrib)
   }),
),
```
 
Above, we are registering a `mycrypto` component in Dapr runtime. Dapr will expose this functionality as a gRPC endpoint along with other API functionality.
 
Next, let's take a look at the `EncryptionDecryption` implementation logic. Navigate to [Crypto.go](./pkg/crypto/crypto.go), you'll find a custom `Crypto` GO struct implementing Dapr's [CustomComponent](TBD) interface.
 
```go
type CustomComponent interface  {
   Init(metadata Metadata) error
   RegisterServer(s *grpc.Server) error
}
```
 
The `Init` method is called by the Dapr runtime to initialize the custom components. Properties set in YAML manifests are passed to Init method as a key value map (Metadata).Here, we are getting configuration values from the [YAML manifest](./components/crypto.yaml) in declarative way
```go
func (c *Crypto) Init(metadata custom.Metadata) error {
   c.config = &config{
      base: metadata.Properties["base"],
      salt: metadata.Properties["salt"],
      bits: getIntOrDefault(metadata.Properties["pwd"], 256),
   }
return nil
}
```
 
In the `RegisterServer` method, Dapr runtime passes an instance of an internal `grpc.Server` to register new gRPC endpoints. Implementation can register a new gRPC server by calling the `RegisterServer` method on auto-generated proto stubs [crypto.pb.go](./pkg/crypto/crypto.pb.go). 
 
```go
func (c *Crypto) RegisterServer(s *grpc.Server) error {
   RegisterCryptoServer(s, c)
   return nil
}
```
 
 
## Step 3 understand Dapr custom component manifest
 
This custom component is configured declaratively using [YAML manifest](./components/crypto.yaml)
 
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
 name: cryptoextension
spec:
 type: custom.mycrypto
 metadata:
   - name: base
     value: randompassphrase
   - name: salt
     value: s3cret
   - name: bits
     value: 256
```     
 
Above, `custom` is a prefix which will identify this manifest as a user-defined custom component. The name `mycrypto` should match the name provided in [main.go](./cmd/daprd/main.go) component registration.
```go
runtime.WithCustomComponents(
   customs_loader.New("mycrypto", func() customs_loader.CustomComponent {
           return custom_crypto.New(logContrib)
   }),
),
```
 
## Step 4 understand client invocation code
 
Let's look at how to invoke this custom component.
```go
conn, err := grpc.Dial(endpoint, grpc.WithInsecure(), grpc.WithBlock())
c := crypto.NewCryptoClient(conn)
r, err := c.Encrypt(ctx, &crypto.EncryptRequest{Value: string(*data)})
```
 
Here we are using an auto-generated gRPC protobuf client to make a call to the custom component. You can find the auto-generated code [crypto.pb.go](./pkg/crypto/crypto.pb.go) and [client](./cmd/client/main.go) in the code base.
 
## Step 5 compiling custom Daprd binary
 
Let's compile and generate a custom Daprd binary at `$(pwd)/dist/daprd`
```bash
make build
```
 
Next, we will add the newly created binary to our execution path. Use below command
```bash
PATH="$(pwd)/dist:$PATH"
```
 
Now, let's start the custom Daprd binary using Dapr CLI
```bash
dapr run --grpc-port=50051
```
Here we are binding the gRPC API server to port `50051`. In the startup logs, you can see custom components getting registered and initialized. Search for below text
```text
- found component cryptoextension (custom.mycrypto)
- custom gRPC crypto endpoint registered
- successful init and registration of custom component cryptoextension (custom.mycrypto)
```
 
## Step 5 Calling the custom endpoint using gRPC client.
 
We have a custom gRPC Go [client](./cmd/client/main.go), which calls the Crypto gRPC endpoint
 
For encrypting a message use below command
```bash
./dist/client --encrypt --data NotASecret
```
Sample output would be `aXkEYkiZcLyf7q7x_DFn6jSWGiVGvSckd-U=`
 
For decrypting a message use below command
```bash
./dist/client --decrypt --data aXkEYkiZcLyf7q7x_DFn6jSWGiVGvSckd-U=
```
Sample output would be `NotASecret`
 

