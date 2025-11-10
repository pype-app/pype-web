# Pype UI - Frontend Application

Frontend moderno em Next.js 14 para o Pype (pype.ia.br), um orquestrador de pipelines multi-tenant.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Zustand** - Gerenciamento de estado
- **React Hook Form + Zod** - Formulários e validação
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificações
- **Headless UI** - Componentes acessíveis
- **Monaco Editor** - Editor de código para YAML

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── forgot-password/   # Recuperação de senha
│   └── dashboard/         # Dashboard principal
├── components/            # Componentes reutilizáveis
│   ├── auth/             # Componentes de autenticação
│   ├── dashboard/        # Componentes do dashboard
│   └── ui/               # Componentes base da UI
├── lib/                  # Utilitários e configurações
│   ├── api-client.ts     # Cliente HTTP configurado
│   └── utils.ts          # Funções utilitárias
├── store/                # Estado global (Zustand)
│   ├── auth.ts           # Estado de autenticação
│   └── pipelines.ts      # Estado dos pipelines
├── types/                # Definições TypeScript
│   └── index.ts          # Tipos principais
└── hooks/                # Custom hooks
    └── use-auth.ts       # Hook de autenticação
```

## 🔐 Sistema de Autenticação

### Páginas Implementadas

- **Login** (`/login`) - Autenticação com email/senha e contexto de tenant
- **Registro** (`/register`) - Criação de conta e tenant
- **Esqueci Senha** (`/forgot-password`) - Recuperação de senha por email
- **Convite de Usuário** - Modal para convidar novos usuários

### Funcionalidades

- ✅ JWT Authentication com refresh tokens
- ✅ Multi-tenant por subdomain
- ✅ Controle de sessão
- ✅ Validação de formulários com Zod
- ✅ Tratamento de erros e loading states
- ✅ Notificações toast
- ✅ Persistência de estado no localStorage

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- NPM ou Yarn

### Instalação

```bash
cd src/Pype.UI
npm install
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🎨 Estilização

### Tailwind CSS

O projeto usa Tailwind CSS com classes customizadas:

```css
/* Botões */
.btn-primary    # Botão primário azul
.btn-secondary  # Botão secundário com borda
.btn-ghost      # Botão transparente

/* Inputs */
.input          # Input padrão com focus states

/* Cards */
.card           # Container com sombra
.card-header    # Cabeçalho do card
.card-body      # Corpo do card
.card-footer    # Rodapé do card
```

### Paleta de Cores

- **Primary**: Azul (primary-50 a primary-950)
- **Gray**: Cinza neutro (gray-50 a gray-950)
- **Estados**: Verde (success), Vermelho (error), Amarelo (warning)

## 🔌 Integração com Backend

### API Client

O cliente HTTP está configurado com:

- Interceptors para tokens JWT
- Refresh automático de tokens
- Headers de tenant automáticos
- Tratamento de erros global

```typescript
// Exemplo de uso
import apiClient from '@/lib/api-client';

const users = await apiClient.get('/api/users');
const newUser = await apiClient.post('/api/users', userData);
```

### Store de Autenticação

```typescript
import { useAuthStore } from '@/store/auth';

const { 
  user, 
  tenant, 
  isAuthenticated, 
  login, 
  logout 
} = useAuthStore();
```

## 📱 Responsividade

O design é completamente responsivo usando:

- Grid CSS e Flexbox
- Breakpoints Tailwind (sm, md, lg, xl)
- Componentes móveis otimizados
- Touch-friendly interfaces

## 🔒 Segurança

### Medidas Implementadas

- ✅ Validação client-side com Zod
- ✅ Sanitização de inputs
- ✅ HTTPS only em produção
- ✅ Tokens JWT com expiração
- ✅ Logout automático em 401
- ✅ Headers de segurança Next.js

## 🚦 Estado Atual

### ✅ Completo

- [x] Setup inicial do projeto
- [x] Sistema de autenticação completo
- [x] Páginas de login/registro/recuperação
- [x] Store de estado global
- [x] Cliente API configurado
- [x] Componentes base da UI

### 🚧 Em Progresso

- [ ] Dashboard principal
- [ ] Layout de navegação
- [ ] Listagem de pipelines
- [ ] Criação de pipelines
- [ ] Monitoring em tempo real

### 📋 Próximas Tarefas

1. **Dashboard Layout** - Sidebar, header, navegação
2. **Pipeline List** - Tabela com filtros e ações
3. **Pipeline Editor** - Upload YAML e editor Monaco
4. **Real-time Updates** - WebSockets para logs
5. **User Management** - CRUD de usuários
6. **Settings** - Configurações do tenant

## 🤝 Contribuição

1. Clone o repositório
2. Instale as dependências
3. Faça suas modificações
4. Execute os testes
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.