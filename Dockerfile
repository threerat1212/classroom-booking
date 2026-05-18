# Multi-stage build for Render
# Stage 1: Build Go API + migration tool
FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git
WORKDIR /build

# Copy and cache Go modules
COPY common-api/go.mod common-api/go.sum ./
RUN go mod download

# Copy source code
COPY common-api/ .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/api cmd/api/main.go

# Install golang-migrate CLI
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.17.1

# Stage 2: Runtime image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app

COPY --from=builder /build/bin/api ./api
COPY --from=builder /go/bin/migrate /usr/local/bin/migrate
COPY migrations /app/migrations
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh
RUN mkdir -p /app/uploads

EXPOSE 8080

CMD ["/app/start.sh"]
