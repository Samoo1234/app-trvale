# TRVALE DO BOI - README

Sistema completo de transporte de gado com controle de KM por GPS.

## Estrutura do Projeto

```
app trvale/
├── supabase/
│   └── supabase_schema.sql    # Script SQL para criar o banco
├── mobile/                     # App React Native/Expo
│   ├── App.tsx
│   ├── package.json
│   └── src/
│       ├── components/        # Componentes reutilizáveis
│       ├── screens/           # Telas do app
│       ├── services/          # SQLite, GPS, Sync
│       ├── contexts/          # Contexto de autenticação
│       ├── utils/             # Haversine, formatters
│       ├── types/             # Definições TypeScript
│       └── theme/             # Cores e estilos
└── web/                        # Painel Next.js
    ├── package.json
    └── src/
        ├── app/               # Páginas (App Router)
        ├── components/        # Componentes reutilizáveis
        ├── lib/               # Supabase client, utils
        └── styles/            # CSS global
```

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o script `supabase/supabase_schema.sql` no SQL Editor
3. Copie a URL e Anon Key do projeto

### 2. App Mobile

```bash
cd mobile
npm install
```

Edite `src/services/supabaseClient.ts`:
```typescript
const SUPABASE_URL = 'sua-url-aqui';
const SUPABASE_ANON_KEY = 'sua-chave-aqui';
```

Executar:
```bash
npx expo start
```

### 3. Painel Web

```bash
cd web
npm install
```

Crie `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

Executar:
```bash
npm run dev
```

## Funcionalidades

### App Mobile (Motorista)
- ✅ Login por CPF + senha
- ✅ Dashboard com estatísticas
- ✅ Cadastro de viagem (placa, origem, destino, qtd gado)
- ✅ Rastreamento GPS a cada 5 segundos
- ✅ Cálculo de distância por Haversine
- ✅ Filtro de ruído (< 10m ignorado)
- ✅ Armazenamento offline em SQLite
- ✅ Sincronização automática quando online

### Painel Web (Gerência)
- ✅ Login administrativo
- ✅ Dashboard com cards de métricas
- ✅ Tabela de viagens com filtros
- ✅ Exportação para Excel

## Paleta de Cores

| Cor | Hex |
|-----|-----|
| Vermelho Principal | #B71C1C |
| Vermelho Secundário | #D32F2F |
| Branco | #FFFFFF |
| Cinza | #F2F2F2 |
| Preto | #1C1C1C |

## Notas Importantes

- O app funciona 100% offline
- Dados são sincronizados automaticamente ao detectar internet
- GPS de alta precisão para cálculos confiáveis
- Não usa Google Maps (apenas GPS nativo)
