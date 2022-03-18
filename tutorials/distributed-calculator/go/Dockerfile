#first stage - builder
FROM golang:1.15-buster as builder
WORKDIR /dir
COPY app.go .
RUN go get -d -v
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
#second stage
FROM debian:buster-slim
WORKDIR /root/
COPY --from=builder /dir/app .
CMD ["./app"]
