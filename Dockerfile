# Build stage - Gera o binário
FROM oven/bun:latest AS builder

WORKDIR /app

# Copia package.json e instala dependências
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Copia o código fonte
COPY . .

# Gera o binário standalone
RUN bun build src/index.ts \
    --compile \
    --minify \
    --sourcemap \
    --target=bun \
    --outfile=server

# Runtime stage - Executa o binário
FROM gcr.io/distroless/base-debian12

WORKDIR /app

# Copia apenas o binário do stage anterior
COPY --from=builder /app/server /app/server

# Expõe a porta (ajuste conforme necessário)
EXPOSE 3000

# Executa o binário
CMD ["/app/server"]
