# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

# Copia package.json e instala dependências
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copia o código fonte
COPY . .

# Runtime stage - Imagem slim do Bun
FROM oven/bun:latest

WORKDIR /app

# Copia node_modules e código da build stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle ./drizzle

# Nota: .env deve ser passado via variáveis de ambiente no Railway, não copiado

# Expõe a porta
EXPOSE 3000

# Executa com bun diretamente
CMD ["bun", "run", "src/index.ts"]
