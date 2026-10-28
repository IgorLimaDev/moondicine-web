# Moondicine Web

Aplicação web para simulados de residência médica, convertida do app Android para versão web compatível com Cloudflare Pages.

## Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **Roteamento:** React Router DOM
- **Backend/Banco:** Supabase (Postgres + Auth)
- **Hospedagem:** Cloudflare Pages
- **Estilização:** CSS puro

## Funcionalidades

### Para Usuários
- Login com autenticação via Supabase
- Simulados com questões aleatórias
- Visualização imediata de acertos/erros
- Histórico de respostas na tela de Revisão
- Resultado com estatísticas

### Para Administradores
- Painel administrativo completo
- Gerenciamento de usuários (visualizar, ativar/desativar, tornar admin)
- Gerenciamento de questões (criar, editar, excluir)
- Cadastro de questões com 5 alternativas (A-E), marcando resposta correta
- Dashboard com estatísticas

## Configuração

### 1. Instalar dependências
```bash
cd web-app
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e preencha:
```env
VITE_SUPABASE_URL=https://cyczozmaszmymagrozic.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 3. Configurar banco Supabase
Siga as instruções em `../supabase/migrations_web/SETUP_INSTRUCTIONS.md`

### 4. Rodar em desenvolvimento
```bash
npm run dev
```

### 5. Build para produção
```bash
npm run build
```

## Deploy no Cloudflare Pages

1. Faça push do código para GitHub
2. No Cloudflare Pages, conecte o repositório
3. Configure build settings:
   - Build command: `cd web-app && npm run build`
   - Build output directory: `web-app/dist`
4. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

## Estrutura

```
web-app/
├── src/
│   ├── admin/        # Painel administrativo
│   ├── components/   # Componentes reutilizáveis
│   ├── lib/          # Configurações (auth, supabase)
│   ├── pages/        # Páginas principais
│   ├── styles/       # Estilos globais
│   └── App.tsx       # Rotas
└── public/
```

## Diferenças em relação ao app Android

- **Removido:** Processamento de PDF, integração com Cohere AI, extração automática de questões
- **Adicionado:** Sistema de login, painel administrativo para gerenciar questões manualmente
- **Mantido:** Funcionalidade core de quiz, revisão e banco de questões do Supabase
- **Foco:** Questões já cadastradas no banco Supabase, gerenciadas pelo painel admin
