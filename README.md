# 🏢 Sistema de Chamados de TI e Controle de Ativos

Sistema web moderno para gestão de suporte técnico de informática e controle de cautela de equipamentos (como notebooks e periféricos), projetado para atender aos padrões de segurança, rastreabilidade e eficiência exigidos em ambientes corporativos e institucionais.

O sistema conta com **duas interfaces principais**:
1. **Central do Solicitante (`/`)**: Canal aberto e intuitivo para usuários registrarem chamados e consultarem o andamento de suas solicitações de forma individual e segura.
2. **Painel Administrativo da Seção de TI (`/admin`)**: Área restrita com autenticação para gerenciamento da fila de atendimento (Kanban/Tabela) e controle patrimonial de cautelas.

---

## 🔑 Credenciais de Acesso Padrão

| Função | Usuário / Login | Senha Inicial |
|---|---|---|
| **Painel Administrativo (`/admin`)** | `admin` | `admin123` |
| **Assinatura de Cautela / Descautela** | *Gestor ou Técnico Responsável* | `admin` |

*(Nota: Recomenda-se a alteração das credenciais padrão após o primeiro acesso ao ambiente de produção.)*

---

## 📁 Estrutura de Arquivos

```text
├── index.html                 # Página HTML base e metadados institucionais
├── package.json               # Dependências do projeto (React, Tailwind CSS, Lucide Icons)
├── tsconfig.json              # Configurações do TypeScript
├── vite.config.ts             # Configuração do Vite e Tailwind
└── src/
    ├── main.tsx               # Ponto de entrada da aplicação React
    ├── index.css              # Estilos globais e identidade visual
    ├── App.tsx                # Roteamento por URL (/ vs /admin) e controle de estado global
    ├── types/
    │   └── index.ts           # Tipagens (Chamados, Setores, Técnicos, Cautelas)
    ├── data/
    │   └── mockData.ts        # Dados iniciais pré-cadastrados para homologação
    ├── utils/
    │   └── storage.ts         # Camada de persistência local (LocalStorage)
    └── components/
        ├── Header.tsx         # Cabeçalho institucional responsivo
        ├── EmployeePortal.tsx # Portal do usuário (abertura e rastreio de chamados)
        ├── ITDashboard.tsx    # Gestão de chamados (Quadro Kanban e listagem técnica)
        ├── NotebookLoans.tsx  # Módulo de controle de cautelas e laudos de avarias
        └── AdminLogin.tsx     # Tela de autenticação restrita da equipe técnica
