module github.com/dapr/samples/extension

go 1.14

require (
	github.com/Azure/go-autorest/autorest/to v0.3.0 // indirect
	github.com/Azure/go-autorest/autorest/validation v0.2.0 // indirect
	github.com/coreos/pkg v0.0.0-20180928190104-399ea9e2e55f // indirect
	github.com/dapr/components-contrib v0.0.0-20200429150257-0e731f96aa8d // indirect
	github.com/dapr/dapr v0.4.1-0.20200228055659-71892bc0111e
	github.com/golang/protobuf v1.3.5
	github.com/patrickmn/go-cache v2.1.0+incompatible // indirect
	github.com/pquerna/cachecontrol v0.0.0-20180517163645-1555304b9b35 // indirect
	github.com/yuin/gopher-lua v0.0.0-20191220021717-ab39c6098bdb // indirect
	golang.org/x/crypto v0.0.0-20200206161412-a0c6ece9d31a
	google.golang.org/grpc v1.26.0
	gopkg.in/couchbaselabs/gocbconnstr.v1 v1.0.4 // indirect
	gopkg.in/couchbaselabs/jsonx.v1 v1.0.0 // indirect
)

replace (
	github.com/Azure/go-autorest => github.com/Azure/go-autorest v13.3.0+incompatible
	k8s.io/client => github.com/kubernetes-client/go v0.0.0-20190928040339-c757968c4c36
)

replace github.com/dapr/dapr => /Users/hnr543/go/src/github.com/dapr/dapr
