# Docker - Guia de Uso

## Descrição

Este Dockerfile utiliza **multi-stage build** para:
1. **Build Stage**: Instala dependências com Bun
2. **Runtime Stage**: Usa imagem slim do Bun para executar a aplicação

## Vantagens

- ✅ **Imagem otimizada**: Usa `bun:latest-slim` para menor tamanho
- ✅ **Build cache**: Dependências são instaladas separadamente do código
- ✅ **Performance**: Execução direta com Bun runtime
- ✅ **Compatível com Railway**: Funciona perfeitamente em ambientes de deploy

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

1. Certifique-se de ter um arquivo `.env` na raiz do projeto:

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
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

### Deploy no Railway

No Railway, **não use arquivo .env**. Configure as variáveis de ambiente direto no painel:

1. Acesse as configurações do projeto no Railway
2. Vá em **Variables**
3. Adicione cada variável:
   - `PORT` (Railway define automaticamente)
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://seu-frontend.com`
   - `DATABASE_URL` (se usar PostgreSQL do Railway, ele auto-configura)
   - Outras variáveis do seu projeto

O Railway detecta automaticamente o Dockerfile e faz o build.

## Customização

### Alterar a Porta

Edite a variável `PORT` no `.env` ou no `docker-compose.yml`

### Adicionar PostgreSQL

Descomente a seção do postgres no `docker-compose.yml` e configure as variáveis de conexão.

### Variáveis de Ambiente

O Docker Compose carrega automaticamente o arquivo `.env`. Para Docker run, passe via `-e`:

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://... \
  nimbo-backend
```

## Troubleshooting

### Erro "Cannot find module '@/lib/auth'"

Este erro ocorre quando o `tsconfig.json` não está sendo copiado para o container. O Dockerfile já está configurado para copiar:
- `tsconfig.json` (necessário para resolver path aliases como `@/lib/auth`)
- `drizzle/` (schemas e migrations do banco)
- `src/` (código fonte)

### Container não inicia

Verifique os logs:
```bash
docker logs <container-id>
# ou com docker-compose
docker-compose logs -f
```

### Variáveis de ambiente não carregam

Certifique-se de que o arquivo `.env` está na mesma pasta do `docker-compose.yml`

No Railway, configure as variáveis diretamente no painel, não use `.env`

### Porta já em uso

Altere a porta no `.env` ou mapeie para outra porta:
```bash
docker run -p 8080:3000 nimbo-backend
```
