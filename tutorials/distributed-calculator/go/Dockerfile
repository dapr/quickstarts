#first stage - builder
FROM golang:1.22-bookworm as builder
WORKDIR /dir
COPY app.go go.mod go.sum ./
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
#second stage
FROM debian:bookworm-slim
WORKDIR /root/
COPY --from=builder /dir/app .
CMD ["./app"]
