# MS-REPORTS-BAR - Microservicio de Reportes
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar go.mod primero
COPY go.mod ./

# Descargar dependencias
RUN go mod download

# Copiar el resto del código
COPY . .

# Generar go.sum completo y construir la aplicación
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]

