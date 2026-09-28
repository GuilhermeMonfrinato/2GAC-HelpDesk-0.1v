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
  TicketMessage
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
  loadAccessibilitySettings, 
  saveAccessibilitySettings 
} from './utils/storage';
import { Lock } from 'lucide-react';

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
  
  // Autenticação da Seção de TI (login: info, senha: R3gD300d0r0!)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('eb_ti_admin_authenticated') === 'true';
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

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('eb_ti_admin_authenticated', 'true');
    } catch {}
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('eb_ti_admin_authenticated');
    } catch {}
  };

  // Estados de dados
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const [departments, setDepartments] = useState<Department[]>(() => loadDepartments());
  const [technicians, setTechnicians] = useState<Technician[]>(() => loadTechnicians());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [notebookLoans, setNotebookLoans] = useState<NotebookLoan[]>(() => loadNotebookLoans());
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
    saveAccessibilitySettings(a11y);
  }, [a11y]);

  // Handler: Criação de novo chamado
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
      code: `CH-${nextCodeNumber}`,
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

  // Handler: Mudar status do chamado
  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus, notes?: string) => {
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
            author: 'Seção de TI',
            action: `Status alterado para: ${newStatus.replace('_', ' ').toUpperCase()}`,
            comment: notes,
          }
        ]
      };
    }));
  };

  // Handler: Mudar prioridade do chamado
  const handleUpdateTicketPriority = (ticketId: string, newPriority: Priority) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const newSla = newPriority === 'critica' ? 1 : newPriority === 'alta' ? 2 : newPriority === 'media' ? 4 : 24;
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
            author: 'Seção de TI',
            action: `Prioridade ajustada para: ${newPriority.toUpperCase()} (SLA: ${newSla}h)`,
          }
        ]
      };
    }));
  };

  // Handler: Excluir chamado
  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
  };

  // Handler: Enviar mensagem no mini-chat do chamado (solicitante ou TI)
  const handleSendMessage = (ticketId: string, content: string, sender: 'solicitante' | 'ti', senderName: string) => {
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

  // Handler: Atribuir militar da TI
  const handleAssignTechnician = (ticketId: string, technicianId: string) => {
    const tech = technicians.find(tc => tc.id === technicianId);
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
            author: 'Ch Seç Info',
            action: tech ? `Atribuído para: ${tech.name}` : 'Militar desvinculado',
          }
        ]
      };
    }));
  };

  // Handler: Adicionar despacho técnico
  const handleAddTicketHistory = (ticketId: string, comment: string, author: string) => {
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
    };
    setNotebookLoans(prev => [newLoan, ...prev]);
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
    setNotebookLoans(prev => prev.map(l => {
      if (l.id !== loanId) return l;
      return {
        ...l,
        actualReturnDate: returnData.returnDate,
        status: 'devolvido',
        hasIssuesOnReturn: returnData.hasIssues,
        returnIssues: returnData.issues,
        returnNotes: returnData.notes,
        returnedAuthorizedBy: returnData.authorizedBy,
      };
    }));
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
            techniciansCount={technicians.length}
            unreadMessagesCount={unreadMessagesCount}
            onOpenTvMode={() => setIsTvModeOpen(true)}
            onLogoutAdmin={handleAdminLogout}
            onNavigateToClient={navigateToClient}
            a11y={a11y}
            onUpdateA11y={setA11y}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
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
            />

            <main className="flex-1">
              {adminTab === 'it' && (
                <ITDashboard
                  tickets={tickets}
                  departments={departments}
                  technicians={technicians}
                  a11y={a11y}
                  onUpdateTicketStatus={handleUpdateTicketStatus}
                  onUpdateTicketPriority={handleUpdateTicketPriority}
                  onAssignTechnician={handleAssignTechnician}
                  onAddTicketHistory={handleAddTicketHistory}
                  onDeleteTicket={handleDeleteTicket}
                  onOpenTvMode={() => setIsTvModeOpen(true)}
                  onSendMessage={handleSendMessage}
                  onMarkMessagesAsRead={handleMarkMessagesAsRead}
                />
              )}

              {adminTab === 'notebooks' && (
                <NotebookLoans
                  loans={notebookLoans}
                  departments={departments}
                  a11y={a11y}
                  adminPassword="admin"
                  onAddLoan={handleAddNotebookLoan}
                  onReturnLoan={handleReturnNotebookLoan}
                />
              )}

              {adminTab === 'technicians' && (
                <TechniciansManager
                  technicians={technicians}
                  a11y={a11y}
                  onUpdateTechnicians={setTechnicians}
                />
              )}
            </main>

            {/* Rodapé Oficial do Dashboard */}
            <footer className={`border-t py-4 px-6 text-xs transition-colors ${
              a11y.highContrast 
                ? 'bg-black border-yellow-400 text-yellow-400' 
                : 'bg-[#192b14] border-[#cba135]/30 text-emerald-100/70'
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#dfb642]">
                    2º GAC L - REGIMENTO DEODORO
                  </span>
                  <span>·</span>
                  <span>Seção de Informática & Telemática</span>
                  <span>·</span>
                  <span className="font-mono text-emerald-300">BRAÇO FORTE, MÃO AMIGA</span>
                </div>
                <button
                  onClick={navigateToClient}
                  className="hover:text-white flex items-center gap-1 font-mono text-[11px] text-emerald-200/80 hover:text-[#dfb642] transition-colors"
                >
                  <span>Portal do Solicitante →</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        /* SEÇÃO 2: LAYOUT INSTITUCIONAL PADRÃO (PORTAL DO SOLICITANTE OU LOGIN TI) */
        <div className="flex-1 flex flex-col">
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
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#dfb642]">
                  2º GAC L - REGIMENTO DEODORO
                </span>
                <span>·</span>
                <span>Seção de Informática & Telemática</span>
                <span>·</span>
                <span className="font-mono text-emerald-300">BRAÇO FORTE, MÃO AMIGA</span>
              </div>

              <div className="flex items-center gap-4">
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
                  className="hover:underline font-semibold"
                >
                  {a11y.highContrast ? 'Desativar Alto Contraste' : 'Alto Contraste'}
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}

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
