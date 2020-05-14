ARG GO_VERSION=1.14
FROM golang:1.14.0-stretch as builder

# STEP 1 compile code
ENV GO111MODULE=on CGO_ENABLED=0 GOOS=linux GOARCH=amd64 
ARG APPNAME
WORKDIR /src
COPY ./ ./
RUN ls -l && \
    go build -a -installsuffix cgo -ldflags="-w -s" -o /app ./cmd/${APPNAME}/main.go

# STEP 2 build a small image
FROM scratch AS final
COPY --from=builder /app /app
ENTRYPOINT ["/app"]