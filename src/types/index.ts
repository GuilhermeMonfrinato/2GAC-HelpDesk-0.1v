export type Priority = 'baixa' | 'media' | 'alta' | 'critica';

export type TicketStatus = 'aberto' | 'em_atendimento' | 'aguardando' | 'resolvido' | 'cancelado';

export interface TicketHistoryItem {
  id: string;
  date: string;
  author: string;
  action: string;
  comment?: string;
}

export interface TicketMessage {
  id: string;
  sender: 'solicitante' | 'ti';
  senderName: string;
  content: string;
  createdAt: string;
  readByTi?: boolean;
}

export interface Ticket {
  id: string;
  code: string; // ex: TICKET-1001
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: TicketStatus;
  requesterName: string; // Posto/Graduação e Nome de Guerra (ex: 1º Ten Silva, Sgt Mendes)
  departmentId: string; // Seção da OM (1ª Seç, 2ª Seç, SALC, etc)
  technicianId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  slaLimitHours: number;
  resolutionNotes?: string;
  rating?: number; // 1 a 5
  userFeedback?: string;
  history: TicketHistoryItem[];
  messages?: TicketMessage[];
}

export interface Department {
  id: string;
  name: string; // ex: 1ª Seção (SPes), 4ª Seção (SLog), etc.
  code: string;
  color: string;
  iconName: string;
  managerName: string;
  description: string;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  active: boolean;
  specialty: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  defaultPriority: Priority;
  simpleInstructions: string;
}

export type UserRole = 'CH-SECINFO' | 'CH-TVINFO' | 'CH-TECNICOINFO' | 'CH-XERIFEINFO';

export interface MilitaryUser {
  id: string;
  username: string; // Login único (ex: secinfo, xerife, tecnico, carlos.mendes)
  password: string; // Senha do militar
  name: string; // Posto/Graduação e Nome (ex: 1º Ten Carlos Mendes)
  rank: string; // Posto/Graduação (ex: 1º Ten, 2º Sgt, 3º Sgt, Cb)
  warName: string; // Nome de Guerra (ex: Mendes, Silveira)
  role: UserRole;
  active: boolean;
  email?: string;
  specialty?: string;
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string; // ISO
  militaryName: string; // Ex: "1º Ten Carlos Mendes"
  militaryLogin: string; // Ex: "secinfo"
  role: UserRole;
  actionType: 
    | 'PRORROGACAO_CAUTELA'
    | 'DEVOLUCAO_CAUTELA'
    | 'NOVA_CAUTELA'
    | 'MENSAGEM_CAUTELA'
    | 'STATUS_CHAMADO'
    | 'PRIORIDADE_CHAMADO'
    | 'EDITAR_TITULO_CHAMADO'
    | 'ATRIBUIR_TECNICO'
    | 'EXCLUSAO_CHAMADO'
    | 'INTERVENCAO_XERIFE'
    | 'MENSAGEM_CHAMADO'
    | 'DESPACHO_TECNICO'
    | 'USUARIO_CRIADO'
    | 'USUARIO_EDITADO'
    | 'USUARIO_SENHA_ALTERADA'
    | 'LOGIN_SUCESSO';
  summary: string;
  details?: string;
  targetRef?: string; // ex: "TICKET-1002" ou "DEODORO-NTB-014"
}

export interface LoanHistoryItem {
  id: string;
  date: string;
  author: string;
  action: 'criacao' | 'prorrogacao' | 'mensagem' | 'devolucao' | 'inspecao';
  summary: string;
  previousDate?: string;
  newDate?: string;
  justification?: string;
}

export interface LoanMessage {
  id: string;
  sender: 'militar' | 'ti';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface NotebookLoan {
  id: string;
  notebookNumber: string; // Número de Patrimônio / Registro EB
  notebookName: string; // Modelo
  borrowerName: string; // Militar responsável pela cautela
  departmentId: string; // Seção cautelada
  loanDate: string; // Data da cautela
  expectedReturnDate: string; // Data prevista para devolução
  originalExpectedReturnDate?: string; // Data prevista inicial antes de prorrogações
  extensionCount?: number; // Quantidade de vezes prorrogado
  lastExtensionReason?: string; // Motivo da última prorrogação
  actualReturnDate?: string | null;
  status: 'cautelado' | 'devolvido';
  hasIssuesOnReturn?: boolean;
  returnIssues?: string[];
  returnNotes?: string;
  authorizedBy: string;
  returnedAuthorizedBy?: string;
  history?: LoanHistoryItem[];
  messages?: LoanMessage[];
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extralarge';
  highContrast: boolean;
}
