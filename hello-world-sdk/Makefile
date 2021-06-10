.PHONY: bin go-mod go-check clean

bin: go-mod
	go build -o order order.go

go-mod: go-check
	go mod tidy
	go mod vendor

go-check:
	@which go > /dev/null

clean:
	rm -f ./order
