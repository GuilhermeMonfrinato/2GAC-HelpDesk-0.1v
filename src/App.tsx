import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopBar } from './components/AdminTopBar';
import { EmployeePortal } from './components/EmployeePortal';
import { ITDashboard } from './components/ITDashboard';
import { NotebookLoans } from './components/NotebookLoans';
import { TechniciansManager } from './components/TechniciansManager';
import { TVDashboard } from './components/TVDashboard';
import { AdminLogin } from './components/AdminLogin';
import { 
  Ticket, 
  Department, 
  Technician, 
  Category, 
  AccessibilitySettings, 
  Priority, 
  TicketStatus,
  NotebookLoan,
  TicketMessage,
  MilitaryUser,
  SystemAuditLog,
  LoanHistoryItem,
  LoanMessage
} from './types';
import { 
  loadTickets, 
  saveTickets, 
  loadDepartments, 
  saveDepartments, 
  loadTechnicians, 
  saveTechnicians, 
  loadCategories, 
  saveCategories, 
  loadNotebookLoans,
  saveNotebookLoans,
  loadMilitaryUsers,
  saveMilitaryUsers,
  loadAuditLogs,
  saveAuditLogs,
  addAuditLog,
  loadCurrentUser,
  saveCurrentUser,
  loadAccessibilitySettings, 
  saveAccessibilitySettings 
} from './utils/storage';
import { Lock, Globe } from 'lucide-react';
import { IntranetModal } from './components/IntranetModal';
import malletBg from './assets/mallet_bg.jpg';

export default function App() {
  // Controle de Rota por URL (/admin vs /)
  const getIsAdminPath = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname.includes('/admin') || 
      window.location.hash.includes('admin') ||
      window.location.search.includes('view=admin')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(getIsAdminPath);
  const [adminTab, setAdminTab] = useState<'it' | 'notebooks' | 'technicians'>('it');
  const [isTvModeOpen, setIsTvModeOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isIntranetModalOpen, setIsIntranetModalOpen] = useState<boolean>(false);
  
  // Usuário militar conectado e autenticação
  const [currentUser, setCurrentUser] = useState<MilitaryUser | null>(() => loadCurrentUser());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('eb_ti_admin_authenticated') === 'true' || !!loadCurrentUser();
    } catch {
      return false;
    }
  });

  // Listener para sincronizar navegação por URL
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminRoute(getIsAdminPath());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToAdmin = () => {
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', '/admin');
    } else {
      window.location.hash = 'admin';
    }
    setIsAdminRoute(true);
  };

  const navigateToClient = () => {
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', '/');
    } else {
      window.location.hash = '';
    }
    setIsAdminRoute(false);
  };

  // Estados de dados
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const [departments, setDepartments] = useState<Department[]>(() => loadDepartments());
  const [technicians, setTechnicians] = useState<Technician[]>(() => loadTechnicians());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [notebookLoans, setNotebookLoans] = useState<NotebookLoan[]>(() => loadNotebookLoans());
  const [militaryUsers, setMilitaryUsers] = useState<MilitaryUser[]>(() => loadMilitaryUsers());
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => loadAuditLogs());
  const [a11y, setA11y] = useState<AccessibilitySettings>(() => loadAccessibilitySettings());

  // Salvar no localStorage quando o estado mudar
  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    saveDepartments(departments);
  }, [departments]);

  useEffect(() => {
    saveTechnicians(technicians);
  }, [technicians]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveNotebookLoans(notebookLoans);
  }, [notebookLoans]);

  useEffect(() => {
    saveMilitaryUsers(militaryUsers);
  }, [militaryUsers]);

  useEffect(() => {
    saveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveAccessibilitySettings(a11y);
  }, [a11y]);

  // Função utilitária para registrar logs de auditoria
  const handleAddAuditLog = (logItem: Omit<SystemAuditLog, 'id' | 'timestamp'>) => {
    const newLog = addAuditLog(logItem);
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAdminLoginSuccess = (user: MilitaryUser) => {
    setCurrentUser(user);
    setIsAdminAuthenticated(true);
    saveCurrentUser(user);

    handleAddAuditLog({
      militaryName: user.name,
      militaryLogin: user.username,
      role: user.role,
      actionType: 'LOGIN_SUCESSO',
      summary: `Militar autenticou-se no painel da TI com perfil ${user.role}.`,
    });

    if (user.role === 'CH-TVINFO') {
      setAdminTab('it');
    }
  };

  const handleAdminLogout = () => {
    if (currentUser) {
      handleAddAuditLog({
        militaryName: currentUser.name,
        militaryLogin: currentUser.username,
        role: currentUser.role,
        actionType: 'LOGIN_SUCESSO',
        summary: `Sessão encerrada (logoff) no painel da TI.`,
      });
    }
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    saveCurrentUser(null);
  };

  // Handler: Criação de novo chamado (Solicitante)
  const handleCreateTicket = (ticketData: {
    title: string;
    description: string;
    category: string;
    departmentId: string;
    requesterName: string;
    priority: Priority;
  }): Ticket => {
    const nextCodeNumber = 1000 + tickets.length + 1;
    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      code: `TICKET-${nextCodeNumber}`,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      departmentId: ticketData.departmentId,
      requesterName: ticketData.requesterName,
      priority: ticketData.priority,
      status: 'aberto',
      technicianId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      slaLimitHours: ticketData.priority === 'critica' ? 1 : ticketData.priority === 'alta' ? 2 : ticketData.priority === 'media' ? 4 : 24,
      history: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString(),
          author: ticketData.requesterName,
          action: 'Chamado Aberto pelo Militar',
          comment: `Prioridade indicada: ${ticketData.priority.toUpperCase()}.`,
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };

  // Handler: Mudar status do chamado (Movimentar de bloco)
  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus, notes?: string) => {
    const ticketTarget = tickets.find(t => t.id === ticketId);
    const author = currentUser?.name || 'Seção de TI';

    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const isResolving = newStatus === 'resolvido' && t.status !== 'resolvido';
      return {
        ...t,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        resolvedAt: isResolving ? new Date().toISOString() : t.resolvedAt,
        resolutionNotes: notes || t.resolutionNotes,
        history: [
          ...t.history,
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            author,
            action: `Bloco alterado para: ${newStatus.replace('_', ' ').toUpperCase()}`,
            comment: notes,
          }
        ]
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || 'Militar da TI',
      militaryLogin: currentUser?.username || 'ti',
      role: currentUser?.role || 'CH-TECNICOINFO',
      actionType: 'STATUS_CHAMADO',
      summary: `Moveu o chamado ${ticketTarget?.code || ticketId} para "${newStatus.replace('_', ' ').toUpperCase()}"`,
      details: notes ? `Despacho: ${notes}` : undefined,
      targetRef: ticketTarget?.code || ticketId,
    });
  };

  // Handler: Mudar prioridade do chamado (Exclusivo Xerife e Chefe)
  const handleUpdateTicketPriority = (ticketId: string, newPriority: Priority) => {
    const ticketTarget = tickets.find(t => t.id === ticketId);
    const newSla = newPriority === 'critica' ? 1 : newPriority === 'alta' ? 2 : newPriority === 'media' ? 4 : 24;
    const author = currentUser?.name || 'Xerife da TI';

    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        priority: newPriority,
        slaLimitHours: newSla,
        updatedAt: new Date().toISOString(),
        history: [
          ...t.history,
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            author,
            action: `Prioridade ajustada para: ${newPriority.toUpperCase()} (SLA: ${newSla}h)`,
          }
        ]
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || 'Xerife da TI',
      militaryLogin: currentUser?.username || 'xerife',
      role: currentUser?.role || 'CH-XERIFEINFO',
      actionType: 'PRIORIDADE_CHAMADO',
      summary: `Alterou a prioridade do chamado ${ticketTarget?.code || ticketId} para "${newPriority.toUpperCase()}"`,
      targetRef: ticketTarget?.code || ticketId,
    });
  };

  // Handler: Editar Nome/Título do Chamado (Exclusivo Xerife e Chefe)
  const handleUpdateTicketTitle = (ticketId: string, newTitle: string) => {
    const ticketTarget = tickets.find(t => t.id === ticketId);
    const oldTitle = ticketTarget?.title || '';
    const author = currentUser?.name || 'Xerife da TI';

    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        title: newTitle.trim(),
        updatedAt: new Date().toISOString(),
        history: [
          ...t.history,
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            author,
            action: `Título do chamado renomeado`,
            comment: `Anterior: "${oldTitle}" → Novo: "${newTitle.trim()}"`,
          }
        ]
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || 'Xerife da TI',
      militaryLogin: currentUser?.username || 'xerife',
      role: currentUser?.role || 'CH-XERIFEINFO',
      actionType: 'EDITAR_TITULO_CHAMADO',
      summary: `Editou o nome/título do chamado ${ticketTarget?.code || ticketId} para "${newTitle.trim()}"`,
      details: `Título anterior: "${oldTitle}"`,
      targetRef: ticketTarget?.code || ticketId,
    });
  };

  // Handler: Excluir chamado (Exclusivo Xerife e Chefe)
  const handleDeleteTicket = (ticketId: string) => {
    const ticketTarget = tickets.find(t => t.id === ticketId);
    setTickets(prev => prev.filter(t => t.id !== ticketId));

    handleAddAuditLog({
      militaryName: currentUser?.name || 'Xerife da TI',
      militaryLogin: currentUser?.username || 'xerife',
      role: currentUser?.role || 'CH-XERIFEINFO',
      actionType: 'EXCLUSAO_CHAMADO',
      summary: `Excluiu definitivamente o chamado ${ticketTarget?.code || ticketId} (${ticketTarget?.title})`,
      targetRef: ticketTarget?.code || ticketId,
    });
  };

  // Handler: Intervenção em Massa (Xerife envia mensagem em todos os chamados abertos)
  const handleMassIntervention = (message: string) => {
    const author = currentUser?.name ? `${currentUser.name} (Xerife)` : 'Xerife da TI';
    const activeTicketsCount = tickets.filter(t => t.status !== 'resolvido' && t.status !== 'cancelado').length;

    setTickets(prev => prev.map(t => {
      if (t.status === 'resolvido' || t.status === 'cancelado') return t;
      const interventionMsg: TicketMessage = {
        id: `msg-interv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sender: 'ti',
        senderName: author,
        content: `[INTERVENÇÃO DA GERÊNCIA TÉCNICA / XERIFE]: ${message}`,
        createdAt: new Date().toISOString(),
        readByTi: true,
      };
      return {
        ...t,
        messages: [...(t.messages || []), interventionMsg],
        updatedAt: new Date().toISOString(),
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || 'Xerife da TI',
      militaryLogin: currentUser?.username || 'xerife',
      role: currentUser?.role || 'CH-XERIFEINFO',
      actionType: 'INTERVENCAO_XERIFE',
      summary: `Realizou intervenção global enviando mensagem para ${activeTicketsCount} chamado(s) em aberto`,
      details: `Mensagem: "${message}"`,
      targetRef: 'TODOS_CHAMADOS',
    });
  };

  // Handler: Enviar mensagem no mini-chat do chamado (solicitante ou TI)
  const handleSendMessage = (ticketId: string, content: string, sender: 'solicitante' | 'ti', senderName: string) => {
    const ticketTarget = tickets.find(t => t.id === ticketId);
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      senderName,
      content,
      createdAt: new Date().toISOString(),
      readByTi: sender === 'ti',
    };

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const currentMessages = t.messages || [];
        return {
          ...t,
          messages: [...currentMessages, newMsg],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    }));

    if (sender === 'ti') {
      handleAddAuditLog({
        militaryName: currentUser?.name || senderName,
        militaryLogin: currentUser?.username || 'ti',
        role: currentUser?.role || 'CH-TECNICOINFO',
        actionType: 'MENSAGEM_CHAMADO',
        summary: `Respondeu no chat do chamado ${ticketTarget?.code || ticketId}: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
        targetRef: ticketTarget?.code || ticketId,
      });
    }
  };

  // Handler: Marcar mensagens do chamado como lidas pela TI
  const handleMarkMessagesAsRead = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId && t.messages) {
        const hasUnread = t.messages.some(m => !m.readByTi);
        if (!hasUnread) return t;
        const updated = t.messages.map(m => m.readByTi ? m : { ...m, readByTi: true });
        return { ...t, messages: updated };
      }
      return t;
    }));
  };

  // Handler: Atribuir militar da TI (Exclusivo Xerife e Chefe)
  const handleAssignTechnician = (ticketId: string, technicianId: string) => {
    const tech = technicians.find(tc => tc.id === technicianId);
    const ticketTarget = tickets.find(t => t.id === ticketId);
    const author = currentUser?.name || 'Xerife da TI';

    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        technicianId: technicianId || null,
        status: t.status === 'aberto' ? 'em_atendimento' : t.status,
        updatedAt: new Date().toISOString(),
        history: [
          ...t.history,
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            author,
            action: tech ? `Atribuído ao técnico: ${tech.name}` : 'Militar desvinculado',
          }
        ]
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || 'Xerife da TI',
      militaryLogin: currentUser?.username || 'xerife',
      role: currentUser?.role || 'CH-XERIFEINFO',
      actionType: 'ATRIBUIR_TECNICO',
      summary: tech 
        ? `Atribuiu o chamado ${ticketTarget?.code || ticketId} para o técnico ${tech.name}` 
        : `Removeu atribuição de técnico do chamado ${ticketTarget?.code || ticketId}`,
      targetRef: ticketTarget?.code || ticketId,
    });
  };

  // Handler: Adicionar despacho técnico
  const handleAddTicketHistory = (ticketId: string, comment: string, author: string) => {
    const ticketTarget = tickets.find(t => t.id === ticketId);
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        updatedAt: new Date().toISOString(),
        history: [
          ...t.history,
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            author,
            action: 'Despacho Técnico',
            comment,
          }
        ]
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || author,
      militaryLogin: currentUser?.username || 'ti',
      role: currentUser?.role || 'CH-TECNICOINFO',
      actionType: 'DESPACHO_TECNICO',
      summary: `Adicionou despacho no chamado ${ticketTarget?.code || ticketId}: "${comment.slice(0, 60)}${comment.length > 60 ? '...' : ''}"`,
      targetRef: ticketTarget?.code || ticketId,
    });
  };

  // Handler: Avaliação de atendimento (estrelas)
  const handleUpdateTicketRating = (ticketId: string, rating: number, comment?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        rating,
        userFeedback: comment || t.userFeedback,
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  // Handler: Cadastrar Nova Cautela de Notebook
  const handleAddNotebookLoan = (loanData: Omit<NotebookLoan, 'id'>) => {
    const newLoan: NotebookLoan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      originalExpectedReturnDate: loanData.expectedReturnDate,
      extensionCount: 0,
      history: [
        {
          id: `lh-${Date.now()}`,
          date: new Date().toISOString(),
          author: loanData.authorizedBy || currentUser?.name || 'Seção de TI',
          action: 'criacao',
          summary: `Cautela autorizada e notebook entregue para ${loanData.borrowerName}. Previsão de devolução: ${new Date(loanData.expectedReturnDate + 'T00:00:00').toLocaleDateString('pt-BR')}.`,
        }
      ],
      messages: [
        {
          id: `lm-${Date.now()}`,
          sender: 'ti',
          senderName: loanData.authorizedBy || currentUser?.name || 'Seção de TI',
          content: `Cautela registrada no sistema. Equipamento retirado na Seção de TI.`,
          createdAt: new Date().toISOString(),
        }
      ]
    };

    setNotebookLoans(prev => [newLoan, ...prev]);

    handleAddAuditLog({
      militaryName: currentUser?.name || loanData.authorizedBy,
      militaryLogin: currentUser?.username || 'ti',
      role: currentUser?.role || 'CH-SECINFO',
      actionType: 'NOVA_CAUTELA',
      summary: `Cadastrou nova cautela do notebook ${newLoan.notebookNumber} para ${newLoan.borrowerName}`,
      targetRef: newLoan.notebookNumber,
    });
  };

  // Handler: Prorrogar Prazo de Devolução do Notebook (Para parar de ficar no status EM ATRASO)
  const handleExtendNotebookLoan = (
    loanId: string,
    newExpectedDate: string,
    justification: string,
    authorizedBy: string
  ) => {
    const targetLoan = notebookLoans.find(l => l.id === loanId);
    const author = authorizedBy || currentUser?.name || 'Seção de TI';
    const oldDateStr = targetLoan ? new Date(targetLoan.expectedReturnDate + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const newDateStr = new Date(newExpectedDate + 'T00:00:00').toLocaleDateString('pt-BR');

    setNotebookLoans(prev => prev.map(l => {
      if (l.id !== loanId) return l;

      const newHistoryItem: LoanHistoryItem = {
        id: `lh-${Date.now()}`,
        date: new Date().toISOString(),
        author,
        action: 'prorrogacao',
        summary: `Prorrogação de entrega autorizada de ${oldDateStr} para ${newDateStr}. Motivo: ${justification}`,
        previousDate: l.expectedReturnDate,
        newDate: newExpectedDate,
        justification,
      };

      const newChatMessage: LoanMessage = {
        id: `lm-${Date.now()}`,
        sender: 'ti',
        senderName: author,
        content: `[PRORROGAÇÃO CONCEDIDA] Devolução prorrogada de ${oldDateStr} até ${newDateStr}.\nJustificativa militar: ${justification}`,
        createdAt: new Date().toISOString(),
      };

      return {
        ...l,
        originalExpectedReturnDate: l.originalExpectedReturnDate || l.expectedReturnDate,
        expectedReturnDate: newExpectedDate,
        extensionCount: (l.extensionCount || 0) + 1,
        lastExtensionReason: justification,
        history: [...(l.history || []), newHistoryItem],
        messages: [...(l.messages || []), newChatMessage],
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || author,
      militaryLogin: currentUser?.username || 'ti',
      role: currentUser?.role || 'CH-SECINFO',
      actionType: 'PRORROGACAO_CAUTELA',
      summary: `Prorrogou a entrega do notebook ${targetLoan?.notebookNumber || loanId} até ${newDateStr}`,
      details: `Justificativa militar: ${justification}`,
      targetRef: targetLoan?.notebookNumber || loanId,
    });
  };

  // Handler: Enviar Mensagem no Chat da Cautela do Notebook
  const handleSendLoanMessage = (
    loanId: string,
    content: string,
    sender: 'militar' | 'ti',
    senderName: string
  ) => {
    const targetLoan = notebookLoans.find(l => l.id === loanId);
    const newMsg: LoanMessage = {
      id: `lm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      senderName,
      content,
      createdAt: new Date().toISOString(),
    };

    setNotebookLoans(prev => prev.map(l => {
      if (l.id !== loanId) return l;
      return {
        ...l,
        messages: [...(l.messages || []), newMsg],
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || senderName,
      militaryLogin: currentUser?.username || (sender === 'ti' ? 'ti' : 'solicitante'),
      role: currentUser?.role || 'CH-SECINFO',
      actionType: 'MENSAGEM_CAUTELA',
      summary: `Mensagem no chat do notebook ${targetLoan?.notebookNumber || loanId}: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
      targetRef: targetLoan?.notebookNumber || loanId,
    });
  };

  // Handler: Realizar Descautela (Devolução)
  const handleReturnNotebookLoan = (
    loanId: string, 
    returnData: {
      returnDate: string;
      hasIssues: boolean;
      issues: string[];
      notes: string;
      authorizedBy: string;
    }
  ) => {
    const targetLoan = notebookLoans.find(l => l.id === loanId);
    const author = returnData.authorizedBy || currentUser?.name || 'Seção de TI';

    setNotebookLoans(prev => prev.map(l => {
      if (l.id !== loanId) return l;

      const returnHistory: LoanHistoryItem = {
        id: `lh-${Date.now()}`,
        date: new Date().toISOString(),
        author,
        action: 'devolucao',
        summary: returnData.hasIssues 
          ? `Descautela com apontamento de avarias: ${returnData.issues.join(', ')}`
          : 'Descautela realizada sem avarias. Equipamento conferido e recolhido ao estoque.',
        justification: returnData.notes,
      };

      const returnMsg: LoanMessage = {
        id: `lm-${Date.now()}`,
        sender: 'ti',
        senderName: author,
        content: `[DESCAUTELA REALIZADA] Equipamento devolvido à TI em ${new Date(returnData.returnDate + 'T00:00:00').toLocaleDateString('pt-BR')}.${returnData.hasIssues ? ` Laudo: ${returnData.notes}` : ''}`,
        createdAt: new Date().toISOString(),
      };

      return {
        ...l,
        actualReturnDate: returnData.returnDate,
        status: 'devolvido',
        hasIssuesOnReturn: returnData.hasIssues,
        returnIssues: returnData.issues,
        returnNotes: returnData.notes,
        returnedAuthorizedBy: returnData.authorizedBy,
        history: [...(l.history || []), returnHistory],
        messages: [...(l.messages || []), returnMsg],
      };
    }));

    handleAddAuditLog({
      militaryName: currentUser?.name || author,
      militaryLogin: currentUser?.username || 'ti',
      role: currentUser?.role || 'CH-SECINFO',
      actionType: 'DEVOLUCAO_CAUTELA',
      summary: `Realizou a descautela do notebook ${targetLoan?.notebookNumber || loanId}`,
      details: returnData.hasIssues ? `Avarias: ${returnData.issues.join(', ')}` : 'Devolvido sem avarias',
      targetRef: targetLoan?.notebookNumber || loanId,
    });
  };

  // Alternar militar na sessão (para testar permissões)
  const handleSwitchUser = (user: MilitaryUser) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    handleAddAuditLog({
      militaryName: user.name,
      militaryLogin: user.username,
      role: user.role,
      actionType: 'LOGIN_SUCESSO',
      summary: `Sessão alternada para o militar ${user.name} (${user.role}).`,
    });
    alert(`Sessão alterada para ${user.name} com perfil [${user.role}].`);
  };

  // Classes de Acessibilidade
  const fontSizeClass = a11y.fontSize === 'extralarge' 
    ? 'font-size-extralarge' 
    : a11y.fontSize === 'large' 
      ? 'font-size-large' 
      : '';

  const contrastClass = a11y.highContrast ? 'high-contrast' : '';

  const openTicketsCount = tickets.filter(t => t.status !== 'resolvido' && t.status !== 'cancelado').length;
  const activeLoansCount = notebookLoans.filter(l => l.status === 'cautelado').length;
  const unreadMessagesCount = tickets.reduce((acc, t) => {
    const unread = t.messages?.filter(m => m.sender === 'solicitante' && !m.readByTi).length || 0;
    return acc + unread;
  }, 0);
  const criticalCount = tickets.filter(t => t.priority === 'critica' && t.status !== 'resolvido' && t.status !== 'cancelado').length;

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${fontSizeClass} ${contrastClass} ${
      a11y.highContrast ? 'bg-black text-white' : 'bg-[#f4f6f2] text-slate-900'
    }`}>
      
      {/* SEÇÃO 1: LAYOUT DASHBOARD COM BARRA LATERAL (ADMIN AUTENTICADO) */}
      {isAdminRoute && isAdminAuthenticated ? (
        <div className="min-h-screen flex w-full">
          {/* Barra Lateral / Sidebar */}
          <AdminSidebar
            adminTab={adminTab}
            onSelectAdminTab={setAdminTab}
            openTicketsCount={openTicketsCount}
            activeLoansCount={activeLoansCount}
            techniciansCount={militaryUsers.length}
            unreadMessagesCount={unreadMessagesCount}
            onOpenTvMode={() => setIsTvModeOpen(true)}
            onLogoutAdmin={handleAdminLogout}
            onNavigateToClient={navigateToClient}
            a11y={a11y}
            onUpdateA11y={setA11y}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            currentUser={currentUser}
          />

          {/* Área Principal Direita do Dashboard */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f4f6f2]">
            <AdminTopBar
              adminTab={adminTab}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
              unreadMessagesCount={unreadMessagesCount}
              onOpenTvMode={() => setIsTvModeOpen(true)}
              onLogoutAdmin={handleAdminLogout}
              criticalCount={criticalCount}
              currentUser={currentUser}
            />

            <main className="flex-1">
              {adminTab === 'it' && (
                <ITDashboard
                  tickets={tickets}
                  departments={departments}
                  technicians={technicians}
                  a11y={a11y}
                  currentUser={currentUser}
                  onUpdateTicketStatus={handleUpdateTicketStatus}
                  onUpdateTicketPriority={handleUpdateTicketPriority}
                  onUpdateTicketTitle={handleUpdateTicketTitle}
                  onAssignTechnician={handleAssignTechnician}
                  onAddTicketHistory={handleAddTicketHistory}
                  onDeleteTicket={handleDeleteTicket}
                  onOpenTvMode={() => setIsTvModeOpen(true)}
                  onSendMessage={handleSendMessage}
                  onMarkMessagesAsRead={handleMarkMessagesAsRead}
                  onMassIntervention={handleMassIntervention}
                />
              )}

              {adminTab === 'notebooks' && (
                <NotebookLoans
                  loans={notebookLoans}
                  departments={departments}
                  a11y={a11y}
                  adminPassword="admin"
                  currentUser={currentUser}
                  onAddLoan={handleAddNotebookLoan}
                  onReturnLoan={handleReturnNotebookLoan}
                  onExtendLoan={handleExtendNotebookLoan}
                  onSendLoanMessage={handleSendLoanMessage}
                />
              )}

              {adminTab === 'technicians' && (
                <TechniciansManager
                  technicians={technicians}
                  militaryUsers={militaryUsers}
                  auditLogs={auditLogs}
                  currentUser={currentUser}
                  a11y={a11y}
                  onUpdateTechnicians={setTechnicians}
                  onUpdateMilitaryUsers={setMilitaryUsers}
                  onAddAuditLog={handleAddAuditLog}
                  onSwitchUser={handleSwitchUser}
                />
              )}
            </main>

            {/* Rodapé Oficial do Dashboard */}
            <footer className={`border-t py-4 px-6 text-xs transition-colors relative z-10 ${
              a11y.highContrast 
                ? 'bg-black border-yellow-400 text-yellow-400' 
                : 'bg-[#192b14] border-[#cba135]/30 text-emerald-100/70'
            }`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="font-bold text-[#dfb642]">
                    2º GAC - REGIMENTO DEODORO
                  </span>
                  <span>·</span>
                  <span>Seção de Informática & Telemática</span>
                  <span>·</span>
                  <span className="font-mono text-emerald-300">BRAÇO FORTE, MÃO AMIGA</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Botão de Abas da Intranet */}
                  <button
                    onClick={() => setIsIntranetModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#27431e] hover:bg-[#345c27] text-[#dfb642] hover:text-white border border-[#3e682e] font-mono text-xs font-bold transition-all shadow-xs cursor-pointer"
                    title="Configurar e abrir abas da Intranet do 2º GAC"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Abas da Intranet</span>
                  </button>

                  <button
                    onClick={navigateToClient}
                    className="hover:text-white flex items-center gap-1 font-mono text-[11px] text-emerald-200/80 hover:text-[#dfb642] transition-colors"
                  >
                    <span>Portal do Solicitante →</span>
                  </button>
                </div>
              </div>

              {/* Linha de Crédito Oficial */}
              <div className="mt-2 pt-2 border-t border-[#27431e]/60 flex items-center justify-center text-[11px] font-mono text-emerald-300/80">
                desenvolvido com &lt;3 por Manfrinato | INFO/26
              </div>
            </footer>
          </div>
        </div>
      ) : (
        /* SEÇÃO 2: LAYOUT INSTITUCIONAL PADRÃO (PORTAL DO SOLICITANTE OU LOGIN TI) */
        <div className="flex-1 flex flex-col relative z-10">
          <Header
            isAdminRoute={isAdminRoute}
            adminTab={adminTab}
            onSelectAdminTab={setAdminTab}
            isAdminAuthenticated={isAdminAuthenticated}
            onLogoutAdmin={handleAdminLogout}
            onNavigateToClient={navigateToClient}
            onNavigateToAdmin={navigateToAdmin}
            onOpenTvMode={() => setIsTvModeOpen(true)}
            a11y={a11y}
            onUpdateA11y={setA11y}
            openTicketsCount={openTicketsCount}
            activeLoansCount={activeLoansCount}
          />

          <main className="flex-1">
            {/* PORTAL DO SOLICITANTE COM CONSULTA E MINI-CHAT */}
            {!isAdminRoute && (
              <EmployeePortal
                tickets={tickets}
                departments={departments}
                categories={categories}
                a11y={a11y}
                onCreateTicket={handleCreateTicket}
                onUpdateTicketRating={handleUpdateTicketRating}
                onSendMessage={handleSendMessage}
              />
            )}

            {/* TELA DE LOGIN PARA A ADMINISTRAÇÃO DA TI */}
            {isAdminRoute && !isAdminAuthenticated && (
              <AdminLogin
                militaryUsers={militaryUsers}
                onLoginSuccess={handleAdminLoginSuccess}
                onGoBackToPortal={navigateToClient}
                a11y={a11y}
              />
            )}
          </main>

          {/* Rodapé Militar Oficial */}
          <footer className={`border-t py-4 px-4 sm:px-8 text-xs transition-colors ${
            a11y.highContrast 
              ? 'bg-black border-yellow-400 text-yellow-400' 
              : 'bg-[#192b14] border-[#cba135]/30 text-emerald-100/70'
          }`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="font-bold text-[#dfb642]">
                  2º GAC - REGIMENTO DEODORO
                </span>
                <span>·</span>
                <span>Seção de Informática & Telemática</span>
                <span>·</span>
                <span className="font-mono text-emerald-300">BRAÇO FORTE, MÃO AMIGA</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Botão de Abas da Intranet */}
                <button
                  onClick={() => setIsIntranetModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#27431e] hover:bg-[#345c27] text-[#dfb642] hover:text-white border border-[#3e682e] font-mono text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Configurar e abrir atalhos da Intranet"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Abas da Intranet</span>
                </button>

                {!isAdminRoute ? (
                  <button
                    onClick={navigateToAdmin}
                    className="hover:text-white flex items-center gap-1 font-mono text-[11px] text-emerald-200/60 hover:text-[#dfb642] transition-colors"
                    title="Acesso exclusivo da Seção de TI via URL /admin"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Acesso TI (/admin)</span>
                  </button>
                ) : (
                  <button
                    onClick={navigateToClient}
                    className="hover:text-white font-mono text-[11px] text-[#dfb642] hover:underline"
                  >
                    ← Voltar para Central do Solicitante
                  </button>
                )}

                <span>·</span>

                <button
                  onClick={() => {
                    setA11y(prev => ({ ...prev, highContrast: !prev.highContrast }));
                  }}
                  className="hover:underline font-semibold cursor-pointer"
                >
                  {a11y.highContrast ? 'Desativar Alto Contraste' : 'Alto Contraste'}
                </button>
              </div>
            </div>

            {/* Linha de Crédito Oficial */}
            <div className="mt-2 pt-2 border-t border-[#27431e]/60 flex items-center justify-center text-[11px] font-mono text-emerald-300/80">
              desenvolvido com &lt;3 por Manfrinato | INFO/26
            </div>
          </footer>
        </div>
      )}

      {/* Fundo Artilharia / General Mallet e Obuseiros */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.045] bg-cover bg-center bg-no-repeat mix-blend-multiply"
        style={{ backgroundImage: `url(${malletBg})` }}
        aria-hidden="true"
      />

      {/* Modal de Abas da Intranet configurável */}
      <IntranetModal
        isOpen={isIntranetModalOpen}
        onClose={() => setIsIntranetModalOpen(false)}
        a11y={a11y}
      />

      {/* Painel Modo TV em Tela Ampla para a Sala de TI */}
      {isTvModeOpen && (
        <TVDashboard
          tickets={tickets}
          departments={departments}
          technicians={technicians}
          onClose={() => setIsTvModeOpen(false)}
        />
      )}

    </div>
  );
}
