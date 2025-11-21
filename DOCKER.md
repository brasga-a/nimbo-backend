# Docker - Guia de Uso

## Descrição

Este Dockerfile utiliza **multi-stage build** para:
1. **Build Stage**: Compila o código TypeScript em um binário standalone usando `bun build --compile`
2. **Runtime Stage**: Usa uma imagem distroless mínima que executa apenas o binário compilado

## Vantagens

- ✅ **Imagem final pequena**: ~50MB (vs ~1GB com Node.js completo)
- ✅ **Segurança**: Distroless não contém shell ou pacotes desnecessários
- ✅ **Performance**: Binário compilado é mais rápido que interpretação
- ✅ **Standalone**: Não precisa de runtime externo

## Como Usar

### Build da Imagem

```bash
docker build -t nimbo-backend .
```

### Executar Container

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e FRONTEND_URL=http://localhost:3000 \
  nimbo-backend
```

### Usando Docker Compose

1. Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
# Adicione outras variáveis conforme necessário
```

2. Execute:

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Customização

### Alterar a Porta

Edite a variável `PORT` no `.env` ou no `docker-compose.yml`

### Adicionar PostgreSQL

Descomente a seção do postgres no `docker-compose.yml` e configure as variáveis de conexão.

### Otimizações Adicionais

No Dockerfile, você pode ajustar as flags de build:

```dockerfile
RUN bun build src/index.ts \
    --compile \
    --minify \              # Minifica o código
    --sourcemap \           # Gera sourcemaps (remova em produção se quiser)
    --target=bun \          # Target específico do Bun
    --outfile=server
```

## Troubleshooting

### Container não inicia

Verifique os logs:
```bash
docker logs <container-id>
```

### Variáveis de ambiente não carregam

Certifique-se de que o arquivo `.env` está na mesma pasta do `docker-compose.yml`

### Porta já em uso

Altere a porta no `.env` ou mapeie para outra porta:
```bash
docker run -p 8080:3000 nimbo-backend
```
