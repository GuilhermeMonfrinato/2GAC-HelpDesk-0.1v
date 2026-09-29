import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Tv, 
  MessageSquare, 
  LogOut, 
  Layers, 
  Laptop, 
  Users,
  Clock,
  ShieldAlert,
  Shield,
  UserCheck
} from 'lucide-react';
import { AccessibilitySettings, MilitaryUser } from '../types';
import { RegimentoDeodoroLogo } from './RegimentoDeodoroLogo';

interface AdminTopBarProps {
  adminTab: 'it' | 'notebooks' | 'technicians';
  onToggleMobileSidebar: () => void;
  unreadMessagesCount: number;
  onOpenTvMode: () => void;
  onLogoutAdmin: () => void;
  criticalCount: number;
  onFilterCritical?: () => void;
  currentUser?: MilitaryUser | null;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  adminTab,
  onToggleMobileSidebar,
  unreadMessagesCount,
  onOpenTvMode,
  onLogoutAdmin,
  criticalCount,
  onFilterCritical,
  currentUser,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const getTabTitle = () => {
    switch (adminTab) {
      case 'it':
        return {
          title: 'Fila de Atendimento da TI',
          subtitle: 'Triagem, bancada técnica e histórico de ordens',
          icon: <Layers className="w-5 h-5 text-[#27431e]" />
        };
      case 'notebooks':
        return {
          title: 'Cautela de Notebooks',
          subtitle: 'Registro de cautelas, descautelas e conferência de CTI',
          icon: <Laptop className="w-5 h-5 text-[#27431e]" />
        };
      case 'technicians':
        return {
          title: 'Gestão de Militares & Auditoria',
          subtitle: 'Cadastro de login/senha individual e logs detalhados',
          icon: <Users className="w-5 h-5 text-[#27431e]" />
        };
    }
  };

  const { title, subtitle, icon } = getTabTitle();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'CH-SECINFO':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'CH-XERIFEINFO':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'CH-TECNICOINFO':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'CH-TVINFO':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xs">
      
      {/* Lado Esquerdo: Botão Mobile & Título */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
          title="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex p-1.5 rounded-xl bg-slate-100 border border-slate-200">
            <RegimentoDeodoroLogo size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#27431e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                2º GAC · REGIMENTO DEODORO
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Lado Direito: Perfil do Militar, Notificações & Atalhos */}
      <div className="flex items-center gap-3">
        
        {/* Identificação do Militar Conectado */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="w-7 h-7 rounded-xl bg-[#1e3316] text-[#dfb642] font-black text-[11px] flex items-center justify-center border border-[#cba135]/40 shrink-0">
              {currentUser.warName.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <span className="font-bold text-slate-900 block leading-tight text-xs">
                {currentUser.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`px-1.5 py-0.2 rounded font-mono font-black text-[9px] border ${getRoleBadge(currentUser.role)}`}>
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</span>
              </div>
            </div>
          </div>
        )}

        {/* Alerta de Perguntas do Solicitante no Chat */}
        {unreadMessagesCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold animate-pulse">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Dúvidas:</span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-600 text-white font-mono text-[11px]">
              {unreadMessagesCount}
            </span>
          </div>
        )}

        {/* Relógio Digital */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-[#27431e]" />
          <span>{timeStr}</span>
        </div>

        {/* Botão Painel TV */}
        <button
          onClick={onOpenTvMode}
          className="px-3.5 py-2 rounded-xl bg-[#1e3316] text-[#dfb642] font-black text-xs flex items-center gap-2 hover:bg-[#27431e] transition-colors border border-[#cba135]/50 shadow-xs"
          title="Abrir painel ampliado para televisão da sala"
        >
          <Tv className="w-4 h-4" />
          <span className="hidden sm:inline">Painel TV</span>
        </button>

        {/* Sair */}
        <button
          onClick={onLogoutAdmin}
          className="p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
          title="Encerrar sessão"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
};

