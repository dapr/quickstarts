module dapr_job_example

go 1.22.4

require (
	github.com/dapr/go-sdk v0.0.0-00010101000000-000000000000
	google.golang.org/protobuf v1.34.2
)

require (
	github.com/dapr/dapr v1.14.0-rc.2 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/kr/pretty v0.3.1 // indirect
	go.opentelemetry.io/otel v1.27.0 // indirect
	golang.org/x/net v0.26.0 // indirect
	golang.org/x/sys v0.21.0 // indirect
	golang.org/x/text v0.16.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240624140628-dc46fd24d27d // indirect
	google.golang.org/grpc v1.64.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

//replace github.com/dapr/go-sdk => github.com/mikeee/dapr_go-sdk v0.0.0-9008fd7e91b1562678ec84f3383950dbda4b7449
replace github.com/dapr/go-sdk => /Users/rocha/Developer/go-sdk
