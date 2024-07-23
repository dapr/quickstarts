#first stage - builder
FROM golang:1.19-buster as builder
WORKDIR /dir
COPY app.go go.mod go.sum ./
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
#second stage
FROM debian:buster-slim
WORKDIR /root/
COPY --from=builder /dir/app .
CMD ["./app"]
