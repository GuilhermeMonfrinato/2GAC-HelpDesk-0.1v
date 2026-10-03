import React, { useState } from 'react';
import { 
  Laptop, 
  Plus, 
  Search, 
  RotateCcw, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Lock, 
  X,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Shield,
  MessageSquare,
  CalendarPlus,
  Send,
  History,
  User,
  Info,
  FileText,
  LayoutGrid,
  List
} from 'lucide-react';
import { NotebookLoan, Department, AccessibilitySettings, MilitaryUser, LoanHistoryItem, LoanMessage } from '../types';

interface NotebookLoansProps {
  loans: NotebookLoan[];
  departments: Department[];
  a11y: AccessibilitySettings;
  adminPassword: string;
  currentUser?: MilitaryUser | null;
  onAddLoan: (loan: Omit<NotebookLoan, 'id'>) => void;
  onReturnLoan: (
    loanId: string, 
    returnData: {
      returnDate: string;
      hasIssues: boolean;
      issues: string[];
      notes: string;
      authorizedBy: string;
    }
  ) => void;
  onExtendLoan?: (
    loanId: string,
    newExpectedDate: string,
    justification: string,
    authorizedBy: string
  ) => void;
  onSendLoanMessage?: (
    loanId: string,
    content: string,
    sender: 'militar' | 'ti',
    senderName: string
  ) => void;
}

const COMMON_ISSUES = [
  'LED queimado ou indicador apagado',
  'Teclado com defeito ou teclas falhando',
  'Tela danificada / trincada ou com listras',
  'Fonte / carregador com mau contato ou ausente',
  'Bateria viciada ou não segura carga',
  'Carcaça / dobradiça quebrada ou solta',
  'Lentidão extrema ou travamento contínuo',
  'Outro defeito físico ou operacional',
];

export const NotebookLoans: React.FC<NotebookLoansProps> = ({
  loans,
  departments,
  a11y,
  adminPassword,
  currentUser,
  onAddLoan,
  onReturnLoan,
  onExtendLoan,
  onSendLoanMessage,
}) => {
  // Filtros
  const [filterStatus, setFilterStatus] = useState<'all' | 'cautelado' | 'devolvido' | 'atrasado'>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Modal Nova Cautela
  const [showNewModal, setShowNewModal] = useState(false);
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerDept, setBorrowerDept] = useState(departments[0]?.id || '');
  const [notebookNumber, setNotebookNumber] = useState('');
  const [notebookName, setNotebookName] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [authorizedRole, setAuthorizedRole] = useState(currentUser?.name || '1º Ten Carlos Mendes (Ch Seç Info)');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Modal Devolução (Descautela)
  const [activeLoanForReturn, setActiveLoanForReturn] = useState<NotebookLoan | null>(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasIssues, setHasIssues] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnAuthorizedRole, setReturnAuthorizedRole] = useState(currentUser?.name || '1º Ten Carlos Mendes (Ch Seç Info)');
  const [returnPassword, setReturnPassword] = useState('');
  const [returnAuthError, setReturnAuthError] = useState('');

  // Modal Prorrogação da Entrega
  const [activeLoanForExtension, setActiveLoanForExtension] = useState<NotebookLoan | null>(null);
  const [newExtensionDate, setNewExtensionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [extensionJustification, setExtensionJustification] = useState('');
  const [extensionAuthorizedBy, setExtensionAuthorizedBy] = useState(currentUser?.name || '1º Ten Carlos Mendes');
  const [extensionError, setExtensionError] = useState('');

  // Modal Chat & Histórico da Cautela
  const [activeLoanForChat, setActiveLoanForChat] = useState<NotebookLoan | null>(null);
  const [loanChatInput, setLoanChatInput] = useState('');
  const [loanChatSender, setLoanChatSender] = useState<'ti' | 'militar'>('ti');

  const isTV = currentUser?.role === 'CH-TVINFO';

  // Verificação de atrasos
  const todayStr = new Date().toISOString().split('T')[0];
  const isLoanOverdue = (loan: NotebookLoan) => {
    return loan.status === 'cautelado' && loan.expectedReturnDate < todayStr;
  };

  // Contadores
  const totalCount = loans.length;
  const activeCount = loans.filter(l => l.status === 'cautelado').length;
  const returnedCount = loans.filter(l => l.status === 'devolvido').length;
  const overdueCount = loans.filter(l => isLoanOverdue(l)).length;

  // Filtragem
  const filteredLoans = loans.filter(l => {
    if (filterStatus === 'cautelado' && l.status !== 'cautelado') return false;
    if (filterStatus === 'devolvido' && l.status !== 'devolvido') return false;
    if (filterStatus === 'atrasado' && !isLoanOverdue(l)) return false;
    if (filterDept !== 'all' && l.departmentId !== filterDept) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const dept = departments.find(d => d.id === l.departmentId);
      const match = (
        l.notebookNumber.toLowerCase().includes(q) ||
        l.notebookName.toLowerCase().includes(q) ||
        l.borrowerName.toLowerCase().includes(q) ||
        (dept && dept.name.toLowerCase().includes(q))
      );
      if (!match) return false;
    }
    return true;
  });

  // Submissão de Nova Cautela
  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!borrowerName.trim() || !notebookNumber.trim() || !notebookName.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (authPassword !== adminPassword) {
      setAuthError('Senha de autorização incorreta! Apenas o Chefe ou o Auxiliar da Seção de TI possuem a senha de cautela.');
      return;
    }

    onAddLoan({
      notebookNumber: notebookNumber.trim().toUpperCase(),
      notebookName: notebookName.trim(),
      borrowerName: borrowerName.trim(),
      departmentId: borrowerDept,
      loanDate,
      expectedReturnDate,
      status: 'cautelado',
      authorizedBy: authorizedRole,
    });

    setShowNewModal(false);
    setBorrowerName('');
    setNotebookNumber('');
    setNotebookName('');
    setAuthPassword('');
    setAuthError('');
  };

  // Submissão de Devolução (Descautela)
  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnAuthError('');

    if (!activeLoanForReturn) return;

    if (returnPassword !== adminPassword) {
      setReturnAuthError('Senha de autorização incorreta! Apenas o Chefe ou o Auxiliar da Seção de TI possuem a senha de descautela.');
      return;
    }

    onReturnLoan(activeLoanForReturn.id, {
      returnDate,
      hasIssues,
      issues: hasIssues ? selectedIssues : [],
      notes: returnNotes.trim(),
      authorizedBy: returnAuthorizedRole,
    });

    setActiveLoanForReturn(null);
    setHasIssues(false);
    setSelectedIssues([]);
    setReturnNotes('');
    setReturnPassword('');
    setReturnAuthError('');
  };

  // Submissão de Prorrogação da Entrega (para parar de ficar no status EM ATRASO)
  const handleConfirmExtension = (e: React.FormEvent) => {
    e.preventDefault();
    setExtensionError('');

    if (!activeLoanForExtension) return;

    if (newExtensionDate < todayStr) {
      setExtensionError('A nova data prevista deve ser hoje ou uma data futura.');
      return;
    }

    if (!extensionJustification.trim()) {
      setExtensionError('A justificativa da prorrogação é obrigatória para o histórico militar.');
      return;
    }

    if (onExtendLoan) {
      onExtendLoan(
        activeLoanForExtension.id,
        newExtensionDate,
        extensionJustification.trim(),
        extensionAuthorizedBy.trim() || currentUser?.name || 'Seção de TI'
      );
    }

    // Se o modal de chat estiver aberto com este notebook, atualiza a referência
    if (activeLoanForChat && activeLoanForChat.id === activeLoanForExtension.id) {
      setActiveLoanForChat(prev => prev ? {
        ...prev,
        expectedReturnDate: newExtensionDate,
        extensionCount: (prev.extensionCount || 0) + 1,
        lastExtensionReason: extensionJustification.trim(),
        history: [
          ...(prev.history || []),
          {
            id: `lh-${Date.now()}`,
            date: new Date().toISOString(),
            author: extensionAuthorizedBy.trim() || currentUser?.name || 'Seção de TI',
            action: 'prorrogacao',
            summary: `Prorrogação de entrega autorizada até ${new Date(newExtensionDate + 'T00:00:00').toLocaleDateString('pt-BR')}. Motivo: ${extensionJustification.trim()}`,
            previousDate: activeLoanForExtension.expectedReturnDate,
            newDate: newExtensionDate,
            justification: extensionJustification.trim(),
          }
        ],
        messages: [
          ...(prev.messages || []),
          {
            id: `lm-${Date.now()}`,
            sender: 'ti',
            senderName: extensionAuthorizedBy.trim() || currentUser?.name || 'Seção de TI',
            content: `[PRORROGAÇÃO REGISTRADA] Devolução prorrogada de ${new Date(activeLoanForExtension.expectedReturnDate + 'T00:00:00').toLocaleDateString('pt-BR')} para ${new Date(newExtensionDate + 'T00:00:00').toLocaleDateString('pt-BR')}. Justificativa: ${extensionJustification.trim()}`,
            createdAt: new Date().toISOString(),
          }
        ]
      } : null);
    }

    setActiveLoanForExtension(null);
    setExtensionJustification('');
    setExtensionError('');
  };

  // Enviar mensagem no Chat da Cautela
  const handleSendLoanChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoanForChat || !loanChatInput.trim()) return;

    const senderName = loanChatSender === 'ti' 
      ? (currentUser?.name ? `${currentUser.name} (TI)` : 'Seção de Informática')
      : activeLoanForChat.borrowerName;

    if (onSendLoanMessage) {
      onSendLoanMessage(activeLoanForChat.id, loanChatInput.trim(), loanChatSender, senderName);
    }

    // Atualiza localmente
    setActiveLoanForChat(prev => prev ? {
      ...prev,
      messages: [
        ...(prev.messages || []),
        {
          id: `lm-${Date.now()}`,
          sender: loanChatSender,
          senderName,
          content: loanChatInput.trim(),
          createdAt: new Date().toISOString(),
        }
      ]
    } : null);

    setLoanChatInput('');
  };

  const toggleIssue = (issue: string) => {
    setSelectedIssues(prev => 
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    );
  };

  const renderKanbanCard = (loan: NotebookLoan) => {
    const dept = departments.find(d => d.id === loan.departmentId);
    const isOverdue = isLoanOverdue(loan);
    const isReturned = loan.status === 'devolvido';
    const isProrrogado = Boolean(loan.extensionCount && loan.extensionCount > 0);

    return (
      <div
        key={loan.id}
        className={`p-3.5 rounded-xl border bg-white shadow-xs hover:shadow-md transition-all space-y-2.5 ${
          isOverdue 
            ? 'border-red-400 ring-1 ring-red-400 bg-red-50/20' 
            : isReturned
              ? 'border-slate-200 opacity-80 bg-slate-50/50'
              : isProrrogado
                ? 'border-amber-300 ring-1 ring-amber-200'
                : 'border-slate-200'
        }`}
      >
        {/* Topo do Card com Patrimônio e Badges */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={`p-1.5 rounded-lg shrink-0 ${
              isReturned ? 'bg-slate-100 text-slate-500' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <Laptop className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs font-black text-slate-900 truncate">
              {loan.notebookNumber}
            </span>
          </div>

          <div className="shrink-0">
            {isReturned ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Devolvido
              </span>
            ) : isOverdue ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase animate-pulse">
                Atrasado
              </span>
            ) : isProrrogado ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase font-mono">
                Prorrogado {loan.extensionCount}x
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                No Prazo
              </span>
            )}
          </div>
        </div>

        {/* Modelo do Notebook */}
        <div className="text-xs font-bold text-slate-800 line-clamp-1">
          {loan.notebookName}
        </div>

        {/* Seção e Militar */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: dept?.color || '#27431e' }} 
            />
            <span className="font-bold truncate">{dept?.name || 'Seção da OM'}</span>
          </div>
          <div className="text-[11px] text-slate-600 truncate pl-3.5">
            Militar: <strong>{loan.borrowerName}</strong>
          </div>
        </div>

        {/* Datas da Cautela */}
        <div className={`p-2 rounded-lg text-[11px] ${
          isOverdue ? 'bg-red-100/80 text-red-900 border border-red-200' : 'bg-slate-50 text-slate-600 border border-slate-100'
        }`}>
          <div className="flex items-center justify-between">
            <span>Devolução:</span>
            <span className="font-mono font-bold">
              {new Date(loan.expectedReturnDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>
          {isProrrogado && loan.lastExtensionReason && (
            <div className="text-[10px] text-amber-800 font-medium truncate mt-0.5">
              Justificativa: "{loan.lastExtensionReason}"
            </div>
          )}
        </div>

        {/* Ações Rápidas do Card */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 text-xs">
          {/* Botão de Histórico e Chat */}
          <button
            onClick={() => {
              setActiveLoanForChat(loan);
              setLoanChatInput('');
            }}
            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Abrir histórico e chat da cautela"
          >
            <MessageSquare className="w-3 h-3 text-emerald-700" />
            <span>Chat {loan.messages && loan.messages.length > 0 ? `(${loan.messages.length})` : ''}</span>
          </button>

          {/* Se ativo: Botão Prorrogar */}
          {!isReturned && (
            <button
              onClick={() => {
                setActiveLoanForExtension(loan);
                const currExp = new Date(loan.expectedReturnDate + 'T00:00:00');
                currExp.setDate(currExp.getDate() + 7);
                setNewExtensionDate(currExp.toISOString().split('T')[0]);
                setExtensionJustification('');
                setExtensionError('');
              }}
              className="py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-bold text-[10px] flex items-center gap-1 border border-amber-300 transition-colors cursor-pointer"
              title="Prorrogar prazo de devolução"
            >
              <CalendarPlus className="w-3 h-3 text-amber-700" />
              <span>Prorrogar</span>
            </button>
          )}

          {/* Se ativo: Botão Descautelar */}
          {!isReturned && (
            <button
              onClick={() => {
                setActiveLoanForReturn(loan);
                setReturnDate(new Date().toISOString().split('T')[0]);
                setHasIssues(false);
                setSelectedIssues([]);
                setReturnNotes('');
                setReturnPassword('');
                setReturnAuthError('');
              }}
              className="py-1.5 px-2 rounded-lg bg-[#27431e] hover:bg-[#1e3316] text-[#dfb642] font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Receber devolução do notebook"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Devolver</span>
            </button>
          )}

          {/* Se devolvido: laudo de avarias */}
          {isReturned && (
            <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              {loan.hasIssuesOnReturn ? (
                <span className="text-red-600">⚠️ Com avarias</span>
              ) : (
                <span className="text-emerald-700">✅ Íntegro</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Cabeçalho da Seção com Identidade Militar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#1e3316] text-[#dfb642] uppercase">
              2º GAC - REGIMENTO DEODORO · CTI
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Assinatura restrita ao Chefe e Auxiliar da Seção de Informática
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Controle de Cautela de Notebooks por Seção
          </h1>
          <p className="text-sm text-slate-600">
            Registro de cautelas e descautelas com laudo de conferência de material e avarias.
          </p>
        </div>

        {/* Botão para Nova Cautela */}
        <button
          onClick={() => {
            setShowNewModal(true);
            setAuthError('');
            setAuthPassword('');
          }}
          className="px-5 py-3 rounded-2xl bg-[#1e3316] text-[#dfb642] font-black text-sm flex items-center gap-2 hover:bg-[#27431e] shadow-md transition-all active:scale-[0.99] border border-[#cba135]/50"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Nova Cautela</span>
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Cadastrados</span>
            <Laptop className="w-4 h-4 text-[#27431e]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {totalCount}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Atualmente Cautelados</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 tabular-nums">
            {activeCount}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Disponíveis / Devolvidos</span>
            <CheckCircle2 className="w-4 h-4 text-[#27431e]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#27431e] tabular-nums">
            {returnedCount}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Devoluções em Atraso</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${overdueCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Busca textual */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por patrimônio (ex: EB-NTB-014), modelo, militar que cautelou ou seção..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#27431e] bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filtro por Status */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('cautelado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'cautelado' ? 'bg-[#1e3316] text-[#dfb642] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cautelados ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('atrasado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'atrasado' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Em Atraso ({overdueCount})
            </button>
            <button
              onClick={() => setFilterStatus('devolvido')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'devolvido' ? 'bg-[#27431e] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Descautelados ({returnedCount})
            </button>
          </div>

          {/* Alternador de Modo de Visualização: Quadro Kanban vs Lista */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban' 
                  ? 'bg-[#1e3316] text-[#dfb642] shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Quadro Kanban por status"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Quadro Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-[#1e3316] text-[#dfb642] shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Tabela detalhada"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista / Tabela</span>
            </button>
          </div>
        </div>

        {/* Filtro por Seção */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Seção da OM:</span>
          <button
            onClick={() => setFilterDept('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              filterDept === 'all' ? 'bg-[#27431e] text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas as Seções
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setFilterDept(d.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 ${
                filterDept === d.id ? 'bg-[#27431e] text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span>{d.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MODO 1: QUADRO KANBAN DE CAUTELAS DE NOTEBOOKS */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          
          {/* Coluna 1: Em Uso / No Prazo */}
          <div className="p-3.5 rounded-2xl border bg-slate-100/70 border-slate-200 space-y-3 min-h-[450px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                1. Em Uso (No Prazo)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-slate-200">
                {filteredLoans.filter(l => l.status === 'cautelado' && !isLoanOverdue(l) && (!l.extensionCount || l.extensionCount === 0)).length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredLoans
                .filter(l => l.status === 'cautelado' && !isLoanOverdue(l) && (!l.extensionCount || l.extensionCount === 0))
                .map((loan) => renderKanbanCard(loan))}
              {filteredLoans.filter(l => l.status === 'cautelado' && !isLoanOverdue(l) && (!l.extensionCount || l.extensionCount === 0)).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-200">
                  Nenhum notebook nesta etapa.
                </div>
              )}
            </div>
          </div>

          {/* Coluna 2: Prazo Prorrogado */}
          <div className="p-3.5 rounded-2xl border bg-amber-50/40 border-amber-200/80 space-y-3 min-h-[450px]">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                2. Prazo Prorrogado
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white text-amber-800 border border-amber-200">
                {filteredLoans.filter(l => l.status === 'cautelado' && !isLoanOverdue(l) && (l.extensionCount && l.extensionCount > 0)).length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredLoans
                .filter(l => l.status === 'cautelado' && !isLoanOverdue(l) && (l.extensionCount && l.extensionCount > 0))
                .map((loan) => renderKanbanCard(loan))}
              {filteredLoans.filter(l => l.status === 'cautelado' && !isLoanOverdue(l) && (l.extensionCount && l.extensionCount > 0)).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-200">
                  Nenhuma prorrogação ativa.
                </div>
              )}
            </div>
          </div>

          {/* Coluna 3: Em Atraso (Vencidos) */}
          <div className="p-3.5 rounded-2xl border bg-red-50/50 border-red-200 space-y-3 min-h-[450px]">
            <div className="flex items-center justify-between pb-2 border-b border-red-200">
              <span className="font-bold text-xs uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                3. Em Atraso / Vencidos
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-red-600 text-white shadow-xs">
                {filteredLoans.filter(l => l.status === 'cautelado' && isLoanOverdue(l)).length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredLoans
                .filter(l => l.status === 'cautelado' && isLoanOverdue(l))
                .map((loan) => renderKanbanCard(loan))}
              {filteredLoans.filter(l => l.status === 'cautelado' && isLoanOverdue(l)).length === 0 && (
                <div className="p-6 text-center text-xs text-emerald-600 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200 font-medium">
                  Excelente! Nenhuma devolução em atraso.
                </div>
              )}
            </div>
          </div>

          {/* Coluna 4: Devolvidos / No Depósito */}
          <div className="p-3.5 rounded-2xl border bg-slate-100/70 border-slate-200 space-y-3 min-h-[450px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                4. Devolvidos / Depósito
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                {filteredLoans.filter(l => l.status === 'devolvido').length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredLoans
                .filter(l => l.status === 'devolvido')
                .map((loan) => renderKanbanCard(loan))}
              {filteredLoans.filter(l => l.status === 'devolvido').length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-200">
                  Nenhum registro devolvido no filtro.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* MODO 2: LISTA / TABELA DETALHADA DE CAUTELAS */}
      {viewMode === 'table' && (
      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 space-y-2">
            <Laptop className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-base">Nenhum registro de cautela encontrado.</p>
            <p className="text-xs">Clique no botão "Cadastrar Nova Cautela" acima para registrar um empréstimo de material.</p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const dept = departments.find(d => d.id === loan.departmentId);
            const isOverdue = isLoanOverdue(loan);
            const isReturned = loan.status === 'devolvido';

            return (
              <div
                key={loan.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isOverdue
                    ? 'bg-red-50/50 border-red-300'
                    : isReturned
                      ? 'bg-slate-50 border-slate-200 opacity-90'
                      : 'bg-white border-slate-200 shadow-xs hover:border-[#27431e]'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  
                  {/* Identificação do Equipamento */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      isReturned
                        ? 'bg-slate-200 text-slate-600'
                        : isOverdue
                          ? 'bg-red-600 text-white animate-bounce'
                          : 'bg-[#1e3316] text-[#dfb642]'
                    }`}>
                      <Laptop className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-lg text-[#1e3316]">
                          {loan.notebookNumber}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-sm font-bold text-slate-800">
                          {loan.notebookName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">Cautelado para:</span>
                        <span className="font-bold text-sm text-slate-900">{loan.borrowerName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: dept?.color || '#27431e' }}>
                          {dept?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Botões de Ação */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                    {isReturned ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>DESCAUTELADO</span>
                      </span>
                    ) : isOverdue ? (
                      <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                        <span>EM ATRASO</span>
                      </span>
                    ) : (loan.extensionCount && loan.extensionCount > 0) ? (
                      <span className="px-3 py-1.5 rounded-xl bg-[#dfb642] text-[#192b14] font-black text-xs flex items-center gap-1.5 border border-[#cba135] shadow-xs">
                        <CalendarPlus className="w-4 h-4" />
                        <span>PRAZO PRORROGADO ({loan.extensionCount}x)</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 border border-amber-200">
                        <Clock className="w-4 h-4" />
                        <span>CAUTELADO (EM DIA)</span>
                      </span>
                    )}

                    {/* Botão de Histórico e Chat do Notebook */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLoanForChat(loan);
                        setLoanChatInput('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-300"
                      title="Ver histórico de ocorrências e mensagens desta cautela"
                    >
                      <MessageSquare className="w-4 h-4 text-[#27431e]" />
                      <span>Chat & Histórico</span>
                      {((loan.messages?.length || 0) + (loan.history?.length || 0)) > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#1e3316] text-[#dfb642] font-mono text-[10px]">
                          {(loan.messages?.length || 0) + (loan.history?.length || 0)}
                        </span>
                      )}
                    </button>

                    {/* Botão Prorrogar Devolução */}
                    {!isReturned && !isTV && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLoanForExtension(loan);
                          // Default nova data: data prevista atual + 7 dias (ou hoje + 7 dias se atrasado)
                          const baseDate = isOverdue ? new Date() : new Date(loan.expectedReturnDate + 'T00:00:00');
                          baseDate.setDate(baseDate.getDate() + 7);
                          setNewExtensionDate(baseDate.toISOString().split('T')[0]);
                          setExtensionJustification('');
                          setExtensionAuthorizedBy(currentUser?.name || '1º Ten Carlos Mendes');
                          setExtensionError('');
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs ${
                          isOverdue 
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black ring-2 ring-amber-400' 
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                        title="Prorrogar o prazo de devolução e justificar no histórico"
                      >
                        <CalendarPlus className="w-4 h-4 text-amber-900" />
                        <span>Prorrogar Devolução</span>
                      </button>
                    )}

                    {/* Botão Descautela */}
                    {!isReturned && !isTV && (
                      <button
                        onClick={() => {
                          setActiveLoanForReturn(loan);
                          setReturnDate(new Date().toISOString().split('T')[0]);
                          setHasIssues(false);
                          setSelectedIssues([]);
                          setReturnNotes('');
                          setReturnPassword('');
                          setReturnAuthError('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#27431e] text-[#dfb642] font-bold text-xs flex items-center gap-1.5 hover:bg-[#1e3316] shadow-xs transition-colors border border-[#cba135]/40"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Descautelar</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* Datas e Assinaturas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 font-bold block mb-0.5">Data da Cautela:</span>
                    <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#27431e]" />
                      {new Date(loan.loanDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Autorizado por: <strong>{loan.authorizedBy}</strong>
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    isOverdue 
                      ? 'bg-red-50 border-red-300 ring-1 ring-red-400' 
                      : (loan.extensionCount && loan.extensionCount > 0)
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-slate-500 font-bold block">Previsão de Devolução:</span>
                      {loan.extensionCount && loan.extensionCount > 0 ? (
                        <span className="px-1.5 py-0.2 rounded bg-[#dfb642] text-[#192b14] font-mono text-[9px] font-black uppercase">
                          Prorrogado {loan.extensionCount}x
                        </span>
                      ) : null}
                    </div>
                    <span className={`font-semibold text-sm flex items-center gap-1.5 ${isOverdue ? 'text-red-700 font-bold' : 'text-slate-800'}`}>
                      <Calendar className="w-4 h-4 text-amber-600" />
                      {new Date(loan.expectedReturnDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {isReturned 
                        ? `Descautelado em ${new Date(loan.actualReturnDate + 'T00:00:00').toLocaleDateString('pt-BR')}`
                        : isOverdue 
                          ? 'Atrasado! Regularize solicitando prorrogação com justificativa ou descautela imediata.' 
                          : loan.lastExtensionReason 
                            ? `Motivo prorrogação: "${loan.lastExtensionReason}"`
                            : 'Dentro do prazo regulamentar.'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 font-bold block mb-0.5">Estado do Equipamento:</span>
                    {isReturned ? (
                      loan.hasIssuesOnReturn ? (
                        <div className="text-red-700 font-bold text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Devolvido com Avarias / Danos</span>
                        </div>
                      ) : (
                        <div className="text-[#27431e] font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Em perfeitas condições</span>
                        </div>
                      )
                    ) : (
                      <span className="text-slate-600 font-medium">Equipamento em carga com o militar</span>
                    )}

                    {loan.returnedAuthorizedBy && (
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Recebido por: <strong>{loan.returnedAuthorizedBy}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Exibição de Avarias */}
                {loan.hasIssuesOnReturn && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                    <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Alterações / Avarias registradas na descautela:</span>
                    </div>

                    {loan.returnIssues && loan.returnIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {loan.returnIssues.map((issue, idx) => (
                          <span 
                            key={idx} 
                            className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-300"
                          >
                            ⚠️ {issue}
                          </span>
                        ))}
                      </div>
                    )}

                    {loan.returnNotes && (
                      <p className="text-xs text-red-800 mt-2 bg-white/70 p-2.5 rounded-lg border border-red-200">
                        <strong>Parecer da Seção de Informática:</strong> {loan.returnNotes}
                      </p>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
      )}

      {/* MODAL: CADASTRAR NOVA CAUTELA */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#27431e]/30">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#1e3316] text-[#dfb642]">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Termo de Cautela de Notebook
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Seção de Informática · Exército Brasileiro</span>
                </div>
              </div>

              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
              
              {/* Militar e Seção */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Militar Responsável (Posto/Graduação e Nome):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cap Mendes, 2º Ten Silva, Sgt Oliveira"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Seção Solicitante da OM:
                  </label>
                  <select
                    value={borrowerDept}
                    onChange={(e) => setBorrowerDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Número do Patrimônio e Modelo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Número do Patrimônio / Registro EB:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: EB-NTB-018 ou 054"
                    value={notebookNumber}
                    onChange={(e) => setNotebookNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome / Modelo do Notebook:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dell Latitude 3420 Militar Rugged"
                    value={notebookName}
                    onChange={(e) => setNotebookName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data da Cautela:
                  </label>
                  <input
                    type="date"
                    required
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data Prevista de Devolução:
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Assinatura com Senha */}
              <div className="p-4 rounded-2xl bg-[#eef3eb] border border-[#27431e]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#192b14] font-black text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#27431e]" />
                  <span>Assinatura Digital da Seção de Informática</span>
                </div>
                <p className="text-slate-600 text-xs">
                  Apenas o <strong>Chefe da Seção de TI</strong> ou o <strong>Auxiliar</strong> possuem a senha regulamentar de cautela.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-[#192b14] mb-1">
                      Militar Autorizador:
                    </label>
                    <select
                      value={authorizedRole}
                      onChange={(e) => setAuthorizedRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#385e2b] text-xs bg-white font-medium"
                    >
                      <option value="1º Ten Carlos Mendes (Ch Seç Info)">1º Ten Carlos Mendes (Ch Seç Info)</option>
                      <option value="2º Sgt Beatriz Silveira (Aux Seç Info)">2º Sgt Beatriz Silveira (Aux Seç Info)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#192b14] mb-1">
                      Senha de Assinatura:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Senha do Chefe/Aux (padrão: admin)"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#385e2b] text-xs bg-white"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold border border-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-100 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1e3316] text-[#dfb642] font-black hover:bg-[#27431e] shadow-md border border-[#cba135]/40"
                >
                  Assinar e Homologar Cautela
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: REALIZAR DESCAUTELA (DEVOLUÇÃO) */}
      {activeLoanForReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#27431e]/30">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#27431e] text-[#dfb642]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Termo de Descautela (Devolução)
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Conferência física de material de TI</span>
                </div>
              </div>

              <button
                onClick={() => setActiveLoanForReturn(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Resumo */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Notebook / Patrimônio:</span>
                <span className="font-mono font-black text-[#1e3316]">{activeLoanForReturn.notebookNumber} - {activeLoanForReturn.notebookName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Militar que Devolve:</span>
                <span className="font-bold text-slate-900">{activeLoanForReturn.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Seção:</span>
                <span className="font-semibold text-slate-700">
                  {departments.find(d => d.id === activeLoanForReturn.departmentId)?.name}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Data Efetiva da Descautela:
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Pergunta de Avarias */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">
                      Houve alteração ou avaria no equipamento durante a missão/uso?
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Ex: LED apagado, teclado falhando, tela danificada, etc.
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasIssues}
                      onChange={(e) => setHasIssues(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {/* Seleção de Avarias */}
                {hasIssues && (
                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <span className="font-bold text-xs text-red-900 block">
                      Assinale as alterações verificadas no equipamento:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {COMMON_ISSUES.map((issue, idx) => {
                        const isChecked = selectedIssues.includes(issue);
                        return (
                          <label
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-red-100 border-red-300 text-red-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleIssue(issue)}
                              className="rounded text-red-600"
                            />
                            <span className="text-xs leading-snug">{issue}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        Detalhamento do laudo da avaria:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: O LED de energia lateral não acende e o conector da fonte está solto."
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Assinatura da Descautela */}
              <div className="p-4 rounded-2xl bg-[#eef3eb] border border-[#27431e]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#192b14] font-black text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#27431e]" />
                  <span>Assinatura da Descautela (Recebimento na TI)</span>
                </div>
                <p className="text-slate-600 text-xs">
                  Insira a senha de autorização para assinar a entrada do material de volta ao estoque da TI.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-[#192b14] mb-1">
                      Militar Receptor:
                    </label>
                    <select
                      value={returnAuthorizedRole}
                      onChange={(e) => setReturnAuthorizedRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#385e2b] text-xs bg-white font-medium"
                    >
                      <option value="1º Ten Carlos Mendes (Ch Seç Info)">1º Ten Carlos Mendes (Ch Seç Info)</option>
                      <option value="2º Sgt Beatriz Silveira (Aux Seç Info)">2º Sgt Beatriz Silveira (Aux Seç Info)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#192b14] mb-1">
                      Senha de Assinatura:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Senha (padrão: admin)"
                      value={returnPassword}
                      onChange={(e) => setReturnPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#385e2b] text-xs bg-white"
                    />
                  </div>
                </div>

                {returnAuthError && (
                  <div className="p-2.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold border border-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{returnAuthError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveLoanForReturn(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-100 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#27431e] text-[#dfb642] font-black hover:bg-[#1e3316] shadow-md border border-[#cba135]/40"
                >
                  Confirmar Descautela
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRORROGAR PRAZO DE DEVOLUÇÃO (PARA PARAR DE FICAR EM ATRASO) */}
      {activeLoanForExtension && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-amber-500/40">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Prorrogar Devolução de Notebook
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {activeLoanForExtension.notebookNumber} · {activeLoanForExtension.notebookName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveLoanForExtension(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmExtension} className="space-y-4 text-xs">
              
              {/* Informações Atuais */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Militar Cautelante:</span>
                  <strong className="text-slate-900">{activeLoanForExtension.borrowerName}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>Previsão Atual:</span>
                  <strong className="text-red-700 font-mono">
                    {new Date(activeLoanForExtension.expectedReturnDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {isLoanOverdue(activeLoanForExtension) && ' (EM ATRASO)'}
                  </strong>
                </div>
                {activeLoanForExtension.extensionCount && activeLoanForExtension.extensionCount > 0 ? (
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Total de Prorrogações Anteriores:</span>
                    <span className="font-mono font-bold text-amber-700">{activeLoanForExtension.extensionCount} vez(es)</span>
                  </div>
                ) : null}
              </div>

              {/* Nova Data Prevista */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#27431e]" />
                  <span>Nova Data Prevista para Entrega:</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={newExtensionDate}
                  onChange={(e) => setNewExtensionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-[#27431e]"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Ao selecionar uma data igual ou posterior a hoje, o status sairá imediatamente de <strong>"EM ATRASO"</strong>.
                </span>
              </div>

              {/* Justificativa Obrigatória */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#27431e]" />
                  <span>Motivo / Justificativa da Prorrogação:</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Prorrogação autorizada pelo Cmt para apoio ao exercício de tiro da 2ª Bia O no campo de instrução."
                  value={extensionJustification}
                  onChange={(e) => setExtensionJustification(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#27431e]"
                />
              </div>

              {/* Militar Autorizador */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#27431e]" />
                  <span>Militar Autorizador (TI / Chefia):</span>
                </label>
                <input
                  type="text"
                  required
                  value={extensionAuthorizedBy}
                  onChange={(e) => setExtensionAuthorizedBy(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              {extensionError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-800 font-bold border border-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{extensionError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Esta prorrogação será registrada no <strong>Chat Histórico</strong> do notebook e nos <strong>Logs de Auditoria</strong> da Seção de TI.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveLoanForExtension(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-100 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1e3316] hover:bg-[#27431e] text-[#dfb642] font-black shadow-md border border-[#cba135]/50 flex items-center gap-1.5"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Confirmar Prorrogação</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHAT HISTÓRICO DA CAUTELA */}
      {activeLoanForChat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-[#27431e]/30 max-h-[92vh] flex flex-col">
            
            {/* Cabeçalho do Chat */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#1e3316] text-[#dfb642]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      Chat & Histórico da Cautela
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border">
                      {activeLoanForChat.notebookNumber}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium block">
                    {activeLoanForChat.notebookName} · Responsável: <strong>{activeLoanForChat.borrowerName}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Botão Atalho Prorrogar dentro do Chat */}
                {activeLoanForChat.status !== 'devolvido' && !isTV && (
                  <button
                    type="button"
                    onClick={() => {
                      const loanToExtend = activeLoanForChat;
                      setActiveLoanForExtension(loanToExtend);
                      const baseDate = isLoanOverdue(loanToExtend) ? new Date() : new Date(loanToExtend.expectedReturnDate + 'T00:00:00');
                      baseDate.setDate(baseDate.getDate() + 7);
                      setNewExtensionDate(baseDate.toISOString().split('T')[0]);
                      setExtensionJustification('');
                      setExtensionAuthorizedBy(currentUser?.name || '1º Ten Carlos Mendes');
                      setExtensionError('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#dfb642] text-[#192b14] font-black text-xs flex items-center gap-1.5 hover:bg-[#cba135] shadow-xs"
                    title="Prorrogar data prevista de entrega deste notebook"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>Prorrogar Prazo</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveLoanForChat(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Faixa de Status Atual */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-500">Prazo de Entrega:</span>
                <span className="font-mono font-bold text-slate-900">
                  {new Date(activeLoanForChat.expectedReturnDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
                {isLoanOverdue(activeLoanForChat) ? (
                  <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-bold text-[10px] animate-pulse">
                    EM ATRASO
                  </span>
                ) : (activeLoanForChat.extensionCount && activeLoanForChat.extensionCount > 0) ? (
                  <span className="px-2 py-0.5 rounded-md bg-[#dfb642] text-[#192b14] font-bold text-[10px]">
                    PRORROGADO ({activeLoanForChat.extensionCount}x)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    EM DIA
                  </span>
                )}
              </div>

              {activeLoanForChat.status === 'devolvido' && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Descautelado
                </span>
              )}
            </div>

            {/* Container de Mensagens e Linha do Tempo */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-200 min-h-[260px] max-h-[380px]">
              
              {/* Evento Inicial de Cautela */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-[#1e3316]">
                    <Shield className="w-3.5 h-3.5 text-[#dfb642]" />
                    <span>Cautela Inicial Realizada</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(activeLoanForChat.loanDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-600">
                  Notebook retirado da TI por <strong>{activeLoanForChat.borrowerName}</strong>. Autorizado por: <strong>{activeLoanForChat.authorizedBy}</strong>.
                </p>
              </div>

              {/* Histórico Registrado */}
              {activeLoanForChat.history?.map((h) => (
                <div 
                  key={h.id} 
                  className={`p-3 rounded-xl border text-xs shadow-2xs ${
                    h.action === 'prorrogacao' 
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950' 
                      : h.action === 'devolucao'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      {h.action === 'prorrogacao' && <CalendarPlus className="w-3.5 h-3.5 text-amber-700" />}
                      {h.action === 'devolucao' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                      {h.action !== 'prorrogacao' && h.action !== 'devolucao' && <History className="w-3.5 h-3.5 text-slate-500" />}
                      <span className="uppercase text-[11px] font-black">{h.author} · {h.action}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(h.date).toLocaleDateString('pt-BR')} {new Date(h.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="leading-relaxed font-medium">{h.summary}</p>
                  {h.justification && (
                    <div className="mt-1 pt-1 border-t border-amber-200/60 text-[11px] text-amber-900">
                      <strong>Justificativa Militar:</strong> {h.justification}
                    </div>
                  )}
                </div>
              ))}

              {/* Mensagens de Chat */}
              {activeLoanForChat.messages?.map((m) => {
                const isTi = m.sender === 'ti';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isTi ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        {m.senderName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-2xs ${
                      isTi 
                        ? 'bg-[#1e3316] text-[#dfb642] rounded-tr-xs border border-[#cba135]/40' 
                        : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Formulário para Enviar Nova Mensagem / Observação */}
            {activeLoanForChat.status !== 'devolvido' && !isTV ? (
              <form onSubmit={handleSendLoanChatMessage} className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">Registrar como:</span>
                    <button
                      type="button"
                      onClick={() => setLoanChatSender('ti')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        loanChatSender === 'ti' 
                          ? 'bg-[#1e3316] text-[#dfb642]' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Seção de TI
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoanChatSender('militar')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        loanChatSender === 'militar' 
                          ? 'bg-[#27431e] text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Militar Cautelante
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Adicionar recado, orientação ou informe militar sobre o notebook..."
                    value={loanChatInput}
                    onChange={(e) => setLoanChatInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-[#27431e]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#1e3316] text-[#dfb642] font-black text-xs flex items-center gap-1.5 hover:bg-[#27431e] transition-colors border border-[#cba135]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 text-center text-xs text-slate-500 italic bg-slate-100 rounded-xl">
                {isTV ? 'Modo Visualizador CH-TVINFO: Sem permissão de interação.' : 'Equipamento descautelado e arquivado.'}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

