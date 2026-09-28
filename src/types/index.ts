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
  code: string; // ex: CH-1001
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

export interface NotebookLoan {
  id: string;
  notebookNumber: string; // Número de Patrimônio / Registro EB
  notebookName: string; // Modelo
  borrowerName: string; // Militar responsável pela cautela
  departmentId: string; // Seção cautelada
  loanDate: string; // Data da cautela
  expectedReturnDate: string; // Data prevista para devolução
  actualReturnDate?: string | null;
  status: 'cautelado' | 'devolvido';
  hasIssuesOnReturn?: boolean;
  returnIssues?: string[];
  returnNotes?: string;
  authorizedBy: string;
  returnedAuthorizedBy?: string;
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extralarge';
  highContrast: boolean;
}
