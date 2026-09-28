import React, { useState } from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  UserCheck, 
  Search, 
  Layers, 
  List, 
  Building2, 
  AlertTriangle, 
  Send, 
  X,
  ShieldAlert,
  Wrench,
  Tv
} from 'lucide-react';
import { Ticket, Department, Technician, Priority, TicketStatus, AccessibilitySettings } from '../types';

interface ITDashboardProps {
  tickets: Ticket[];
  departments: Department[];
  technicians: Technician[];
  a11y: AccessibilitySettings;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus, notes?: string) => void;
  onUpdateTicketPriority: (ticketId: string, newPriority: Priority) => void;
  onAssignTechnician: (ticketId: string, technicianId: string) => void;
  onAddTicketHistory: (ticketId: string, comment: string, author: string) => void;
  onOpenTvMode: () => void;
}

export const ITDashboard: React.FC<ITDashboardProps> = ({
  tickets,
  departments,
  technicians,
  a11y,
  onUpdateTicketStatus,
  onUpdateTicketPriority,
  onAssignTechnician,
  onAddTicketHistory,
  onOpenTvMode,
}) => {
  // Filtros
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Visualização: 'kanban' ou 'table'
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Modal de Detalhes
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('Seção de TI');
  const [resolutionText, setResolutionText] = useState<string>('');

  // Métricas rápidas
  const openCount = tickets.filter(t => t.status === 'aberto').length;
  const inProgressCount = tickets.filter(t => t.status === 'em_atendimento').length;
  const waitingCount = tickets.filter(t => t.status === 'aguardando').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolvido').length;
  const criticalCount = tickets.filter(t => t.priority === 'critica' && t.status !== 'resolvido' && t.status !== 'cancelado').length;

  // Filtragem dos chamados
  const filteredTickets = tickets.filter(t => {
    if (selectedDeptId !== 'all' && t.departmentId !== selectedDeptId) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedTechnicianId !== 'all') {
      if (selectedTechnicianId === 'unassigned' && t.technicianId !== null) return false;
      if (selectedTechnicianId !== 'unassigned' && t.technicianId !== selectedTechnicianId) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const dept = departments.find(d => d.id === t.departmentId);
      const tech = technicians.find(tech => tech.id === t.technicianId);
      const match = (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (dept && dept.name.toLowerCase().includes(q)) ||
        (tech && tech.name.toLowerCase().includes(q))
      );
      if (!match) return false;
    }
    return true;
  });

  // Helper para cor da prioridade
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'critica':
        return {
          bg: 'bg-red-600 text-white',
          label: 'CRÍTICA',
        };
      case 'alta':
        return {
          bg: 'bg-orange-500 text-white',
          label: 'ALTA',
        };
      case 'media':
        return {
          bg: 'bg-[#27431e] text-[#dfb642]',
          label: 'MÉDIA',
        };
      case 'baixa':
        return {
          bg: 'bg-slate-600 text-white',
          label: 'BAIXA',
        };
    }
  };

  const handleSaveNote = () => {
    if (!activeTicket || !newNote.trim()) return;
    onAddTicketHistory(activeTicket.id, newNote.trim(), authorName);
    
    // Atualiza modal ativo
    setActiveTicket(prev => {
      if (!prev) return null;
      return {
        ...prev,
        history: [
          ...prev.history,
          {
            id: `h-${Date.now()}`,
            date: new Date().toISOString(),
            author: authorName,
            action: 'Despacho Técnico',
            comment: newNote.trim(),
          }
        ]
      };
    });
    setNewNote('');
  };

  const handleResolveFromModal = () => {
    if (!activeTicket) return;
    onUpdateTicketStatus(activeTicket.id, 'resolvido', resolutionText.trim() || 'Atendimento concluído pela Seção de TI.');
    setActiveTicket(null);
    setResolutionText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Alerta de Chamado Crítico */}
      {criticalCount > 0 && (
        <div className="p-4 rounded-2xl bg-red-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <div>
              <span className="font-bold text-base block">
                ATENÇÃO: Existem {criticalCount} chamado(s) com prioridade CRÍTICA na fila da OM!
              </span>
              <span className="text-xs text-red-100 block">
                Atendimento urgente requerido pelo militar solicitante.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedPriority('critica');
              setSelectedStatus('all');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white text-red-700 font-bold text-xs uppercase tracking-wider hover:bg-red-50"
          >
            Filtrar Críticos
          </button>
        </div>
      )}

      {/* Cards de Resumo & Botão Modo TV */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Contadores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Fila (Triagem)</span>
              <AlertCircle className="w-4 h-4 text-[#27431e]" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {openCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Em Atendimento</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-600 tabular-nums">
              {inProgressCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Aguardando Peça</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black font-mono text-purple-600 tabular-nums">
              {waitingCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Resolvidos</span>
              <CheckCircle className="w-4 h-4 text-[#27431e]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#27431e] tabular-nums">
              {resolvedCount}
            </div>
          </div>
        </div>

        {/* Botão de Exibição Ampla na TV da Sala */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={onOpenTvMode}
            className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-[#1e3316] text-[#dfb642] font-black text-sm flex items-center justify-center gap-2.5 hover:bg-[#27431e] transition-all shadow-md border-2 border-[#cba135] active:scale-[0.99]"
            title="Abrir painel ampliado para televisão da Seção de TI"
          >
            <Tv className="w-5 h-5 text-[#dfb642]" />
            <div className="text-left">
              <span className="block leading-none">Painel TV da Sala</span>
              <span className="text-[10px] text-emerald-200/80 font-normal font-mono block mt-0.5">Visão Ampla para Televisão</span>
            </div>
          </button>
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
              placeholder="Buscar por código (#CH-1001), militar solicitante, seção da OM ou técnico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#27431e] bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Alternador de Modo de Visualização */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Quadro Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Tabela Detalhada</span>
            </button>
          </div>
        </div>

        {/* Linha de Seletores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* Filtro Setor */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#27431e]" />
              <span>Seção da OM:</span>
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">Todas as Seções ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Prioridade */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
              <span>Prioridade:</span>
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="critica">Crítica (Emergência)</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          {/* Filtro Status */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Status da Ordem:</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">Todos os Status</option>
              <option value="aberto">Aberto (Não iniciado)</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="aguardando">Aguardando Peça</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>

          {/* Filtro Técnico */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#27431e]" />
              <span>Militar Responsável:</span>
            </label>
            <select
              value={selectedTechnicianId}
              onChange={(e) => setSelectedTechnicianId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="all">Todos os Militares da TI</option>
              <option value="unassigned">Sem Militar Atribuído</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MODO 1: QUADRO KANBAN */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Coluna 1: Abertos */}
          <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1e3316]"></span>
                1. Abertos / Triagem
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                {filteredTickets.filter(t => t.status === 'aberto').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredTickets.filter(t => t.status === 'aberto').map(ticket => (
                <KanbanTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  departments={departments}
                  technicians={technicians}
                  onClick={() => setActiveTicket(ticket)}
                  onQuickAssign={(techId) => onAssignTechnician(ticket.id, techId)}
                  onQuickAdvance={() => onUpdateTicketStatus(ticket.id, 'em_atendimento')}
                />
              ))}
            </div>
          </div>

          {/* Coluna 2: Em Atendimento */}
          <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                2. Em Atendimento
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                {filteredTickets.filter(t => t.status === 'em_atendimento').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredTickets.filter(t => t.status === 'em_atendimento').map(ticket => (
                <KanbanTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  departments={departments}
                  technicians={technicians}
                  onClick={() => setActiveTicket(ticket)}
                  onQuickAssign={(techId) => onAssignTechnician(ticket.id, techId)}
                  onQuickAdvance={() => onUpdateTicketStatus(ticket.id, 'resolvido', 'Resolvido pela Seção de TI.')}
                />
              ))}
            </div>
          </div>

          {/* Coluna 3: Aguardando Peça */}
          <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                3. Aguardando Peça
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                {filteredTickets.filter(t => t.status === 'aguardando').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredTickets.filter(t => t.status === 'aguardando').map(ticket => (
                <KanbanTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  departments={departments}
                  technicians={technicians}
                  onClick={() => setActiveTicket(ticket)}
                  onQuickAssign={(techId) => onAssignTechnician(ticket.id, techId)}
                  onQuickAdvance={() => onUpdateTicketStatus(ticket.id, 'em_atendimento')}
                />
              ))}
            </div>
          </div>

          {/* Coluna 4: Resolvidos */}
          <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#27431e]"></span>
                4. Resolvidos
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                {filteredTickets.filter(t => t.status === 'resolvido').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {filteredTickets.filter(t => t.status === 'resolvido').map(ticket => (
                <KanbanTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  departments={departments}
                  technicians={technicians}
                  onClick={() => setActiveTicket(ticket)}
                  onQuickAssign={(techId) => onAssignTechnician(ticket.id, techId)}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* MODO 2: TABELA DETALHADA */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Seção da OM</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Militar Solicitante</th>
                  <th className="py-3 px-4">Ocorrência</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Atribuir Militar da TI</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Nenhum chamado encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const dept = departments.find(d => d.id === t.departmentId);
                    const tech = technicians.find(tc => tc.id === t.technicianId);
                    const pStyle = getPriorityStyle(t.priority);

                    return (
                      <tr 
                        key={t.id} 
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => setActiveTicket(t)}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1e3316]">
                          {t.code}
                        </td>
                        <td className="py-3.5 px-4 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: dept?.color || '#27431e' }}
                            />
                            <span>{dept?.name}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono ${pStyle.bg}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{t.requesterName}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-slate-900 truncate">{t.title}</div>
                          <div className="text-slate-500 truncate text-[11px]">{t.description}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            t.status === 'resolvido' ? 'bg-emerald-100 text-emerald-800' :
                            t.status === 'em_atendimento' ? 'bg-[#27431e]/15 text-[#1e3316]' :
                            t.status === 'aguardando' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={t.technicianId || ''}
                            onChange={(e) => onAssignTechnician(t.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                          >
                            <option value="">Não Atribuído</option>
                            {technicians.map(tc => (
                              <option key={tc.id} value={tc.id}>
                                {tc.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTicket(t);
                            }}
                            className="px-3 py-1 rounded bg-[#27431e]/10 hover:bg-[#27431e]/20 text-[#1e3316] font-bold text-xs"
                          >
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO DO CHAMADO COM SISTEMA DE ATRIBUIÇÃO */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#27431e]/30">
            
            {/* Cabeçalho */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-black text-[#1e3316]">
                    {activeTicket.code}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-sm font-bold text-slate-700">
                    {departments.find(d => d.id === activeTicket.departmentId)?.name}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${getPriorityStyle(activeTicket.priority).bg}`}>
                    {activeTicket.priority}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {activeTicket.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dados do Solicitante e Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">Militar Solicitante:</span>
                <span className="text-slate-900 font-bold text-sm">{activeTicket.requesterName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Data de Abertura:</span>
                <span className="text-slate-900 font-medium text-sm">
                  {new Date(activeTicket.createdAt).toLocaleDateString('pt-BR')} às {new Date(activeTicket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Descrição Completa */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Relato da Ocorrência:
              </h3>
              <p className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {activeTicket.description}
              </p>
            </div>

            {/* ÁREA DE ATRIBUIÇÃO DIRETA DO TÉCNICO E CONTROLE */}
            <div className="p-5 rounded-2xl bg-[#eef3eb] border-2 border-[#27431e]/40 space-y-4">
              
              <div className="flex items-center gap-2 text-[#192b14] font-black text-sm">
                <Wrench className="w-5 h-5 text-[#27431e]" />
                <span>Atribuição de Militar Responsável & Gestão do Chamado:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Selecionar Técnico */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-black text-[#192b14] mb-1">
                    Atribuir a qual Militar da TI:
                  </label>
                  <select
                    value={activeTicket.technicianId || ''}
                    onChange={(e) => {
                      const techId = e.target.value;
                      onAssignTechnician(activeTicket.id, techId);
                      setActiveTicket(prev => prev ? { ...prev, technicianId: techId || null, status: prev.status === 'aberto' ? 'em_atendimento' : prev.status } : null);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#27431e] text-xs font-bold bg-white text-slate-900 shadow-sm"
                  >
                    <option value="">Não Atribuído (Fila)</option>
                    {technicians.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.name} ({tc.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alterar Prioridade */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-black text-[#192b14] mb-1">
                    Alterar Prioridade:
                  </label>
                  <select
                    value={activeTicket.priority}
                    onChange={(e) => {
                      const p = e.target.value as Priority;
                      onUpdateTicketPriority(activeTicket.id, p);
                      setActiveTicket(prev => prev ? { ...prev, priority: p } : null);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#385e2b] text-xs font-bold bg-white text-slate-900"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica (Urgência)</option>
                  </select>
                </div>

                {/* Alterar Status */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-black text-[#192b14] mb-1">
                    Mudar Status:
                  </label>
                  <select
                    value={activeTicket.status}
                    onChange={(e) => {
                      const st = e.target.value as TicketStatus;
                      onUpdateTicketStatus(activeTicket.id, st);
                      setActiveTicket(prev => prev ? { ...prev, status: st } : null);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#385e2b] text-xs font-bold bg-white text-slate-900"
                  >
                    <option value="aberto">Aberto (Fila)</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="aguardando">Aguardando Peça</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

              </div>

              {/* Status do Técnico Atualmente Atribuído */}
              <div className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-[#27431e]/20 flex items-center justify-between">
                <span>
                  Militar designado no momento: <strong className="text-slate-900 font-bold">
                    {technicians.find(tc => tc.id === activeTicket.technicianId)?.name || 'Nenhum militar atribuído'}
                  </strong>
                </span>
                {activeTicket.technicianId && (
                  <span className="text-[11px] font-mono text-emerald-800 font-bold">
                    ● Atribuição Ativa
                  </span>
                )}
              </div>
            </div>

            {/* Fechamento / Resolução */}
            {activeTicket.status !== 'resolvido' && (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3">
                <span className="font-bold text-sm text-emerald-950 block">
                  Encerrar Chamado / Despacho de Resolução:
                </span>
                <input
                  type="text"
                  placeholder="Descreva a solução executada..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-sm bg-white"
                />
                <div className="flex items-center justify-end">
                  <button
                    onClick={handleResolveFromModal}
                    className="px-5 py-2.5 rounded-xl bg-[#27431e] text-[#dfb642] font-black text-xs hover:bg-[#1e3316] transition-colors shadow-xs"
                  >
                    Confirmar e Concluir Chamado
                  </button>
                </div>
              </div>
            )}

            {/* Histórico */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Histórico & Despachos da Ordem de Serviço ({activeTicket.history.length})
              </h3>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {activeTicket.history.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>{h.author} · {h.action}</span>
                      <span className="text-slate-400 font-mono font-normal">
                        {new Date(h.date).toLocaleDateString('pt-BR')} {new Date(h.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {h.comment && (
                      <p className="mt-1 text-slate-600">{h.comment}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Inserir novo despacho */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar nota técnica ou andamento militar..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNote();
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-3.5 py-2 rounded-lg bg-[#27431e] text-[#dfb642] font-black text-xs flex items-center gap-1 hover:bg-[#1e3316]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Despachar</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Componente do Cartão Kanban
interface KanbanTicketCardProps {
  ticket: Ticket;
  departments: Department[];
  technicians: Technician[];
  onClick: () => void;
  onQuickAssign: (techId: string) => void;
  onQuickAdvance?: () => void;
}

const KanbanTicketCard: React.FC<KanbanTicketCardProps> = ({
  ticket,
  departments,
  technicians,
  onClick,
  onQuickAssign,
  onQuickAdvance,
}) => {
  const dept = departments.find(d => d.id === ticket.departmentId);
  const tech = technicians.find(t => t.id === ticket.technicianId);
  const isCritical = ticket.priority === 'critica';

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-xl border bg-white shadow-xs hover:shadow-md transition-all cursor-pointer relative ${
        isCritical ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
      }`}
    >
      {/* Topo do Card */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="font-mono text-xs font-black text-[#1e3316]">
          {ticket.code}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
          ticket.priority === 'critica' ? 'bg-red-600 text-white' :
          ticket.priority === 'alta' ? 'bg-orange-500 text-white' :
          ticket.priority === 'media' ? 'bg-[#27431e] text-[#dfb642]' :
          'bg-slate-500 text-white'
        }`}>
          {ticket.priority}
        </span>
      </div>

      {/* Setor */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
        <span 
          className="w-2 h-2 rounded-full shrink-0" 
          style={{ backgroundColor: dept?.color || '#27431e' }}
        />
        <span className="truncate">{dept?.name}</span>
      </div>

      {/* Título */}
      <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 mb-2">
        {ticket.title}
      </h4>

      {/* Solicitante */}
      <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2 mb-2">
        <span className="truncate font-semibold text-slate-700">{ticket.requesterName}</span>
      </div>

      {/* Atribuição direta de militar no próprio Card */}
      <div className="flex items-center justify-between text-[11px] pt-1" onClick={(e) => e.stopPropagation()}>
        <select
          value={ticket.technicianId || ''}
          onChange={(e) => onQuickAssign(e.target.value)}
          className="text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 max-w-[150px] truncate"
        >
          <option value="">+ Atribuir Militar</option>
          {technicians.map(tc => (
            <option key={tc.id} value={tc.id}>{tc.name}</option>
          ))}
        </select>

        {onQuickAdvance && ticket.status !== 'resolvido' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdvance();
            }}
            className="text-[10px] font-bold text-[#27431e] hover:text-[#192b14] bg-[#27431e]/10 px-2 py-1 rounded-lg"
          >
            Avançar →
          </button>
        )}
      </div>
    </div>
  );
};
