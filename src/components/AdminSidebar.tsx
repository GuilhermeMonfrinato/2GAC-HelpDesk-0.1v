import React from 'react';
import { 
  Shield, 
  Layers, 
  Laptop, 
  Users, 
  Tv, 
  LogOut, 
  MessageSquare, 
  ExternalLink, 
  X,
  ZoomIn,
  ZoomOut,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface AdminSidebarProps {
  adminTab: 'it' | 'notebooks' | 'technicians';
  onSelectAdminTab: (tab: 'it' | 'notebooks' | 'technicians') => void;
  openTicketsCount: number;
  activeLoansCount: number;
  techniciansCount: number;
  unreadMessagesCount: number;
  onOpenTvMode: () => void;
  onLogoutAdmin: () => void;
  onNavigateToClient: () => void;
  a11y: AccessibilitySettings;
  onUpdateA11y: (updater: (prev: AccessibilitySettings) => AccessibilitySettings) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminTab,
  onSelectAdminTab,
  openTicketsCount,
  activeLoansCount,
  techniciansCount,
  unreadMessagesCount,
  onOpenTvMode,
  onLogoutAdmin,
  onNavigateToClient,
  a11y,
  onUpdateA11y,
  isMobileOpen,
  onCloseMobile,
}) => {
  const toggleContrast = () => {
    onUpdateA11y(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const cycleFontSize = (direction: 'increase' | 'decrease') => {
    onUpdateA11y(prev => {
      if (direction === 'increase') {
        if (prev.fontSize === 'normal') return { ...prev, fontSize: 'large' };
        if (prev.fontSize === 'large') return { ...prev, fontSize: 'extralarge' };
        return prev;
      } else {
        if (prev.fontSize === 'extralarge') return { ...prev, fontSize: 'large' };
        if (prev.fontSize === 'large') return { ...prev, fontSize: 'normal' };
        return prev;
      }
    });
  };

  return (
    <>
      {/* Backdrop para telas móveis */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Barra Lateral / Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col shrink-0 transition-transform duration-300 ease-in-out border-r shadow-2xl ${
        a11y.highContrast
          ? 'bg-neutral-950 border-yellow-400 text-white'
          : 'bg-[#152311] border-[#2d4a22] text-slate-100'
      } ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Cabeçalho da Sidebar: Brasão & Identidade Militar */}
        <div className="p-5 border-b border-[#2d4a22] bg-[#1a2c15]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-md border ${
                a11y.highContrast 
                  ? 'bg-yellow-400 text-black border-white' 
                  : 'bg-[#27431e] text-[#dfb642] border-[#cba135]/60'
              }`}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black tracking-widest uppercase text-[#dfb642] block">
                  Exército Brasileiro
                </span>
                <h1 className="text-sm font-black tracking-tight text-white leading-tight">
                  2º GAC L - REGIMENTO DEODORO
                </h1>
                <span className="text-[11px] text-emerald-200/80 font-mono tracking-tight block">
                  Seção de Informática & TI
                </span>
              </div>
            </div>

            {/* Fechar no Mobile */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#27431e]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Links de Navegação Principal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono font-black tracking-wider uppercase text-emerald-400/80">
              Painel de Controle
            </div>

            <nav className="space-y-1.5">
              {/* Item 1: Fila de Chamados */}
              <button
                onClick={() => {
                  onSelectAdminTab('it');
                  onCloseMobile();
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between group ${
                  adminTab === 'it'
                    ? a11y.highContrast
                      ? 'bg-yellow-400 text-black font-black shadow-md'
                      : 'bg-[#dfb642] text-[#192b14] font-black shadow-lg scale-[1.01]'
                    : 'text-slate-200 hover:bg-[#1e3316] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    adminTab === 'it' ? 'bg-[#192b14] text-[#dfb642]' : 'bg-[#1e3316] text-emerald-300 group-hover:bg-[#27431e]'
                  }`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm">Fila de Chamados</span>
                    <span className={`text-[10px] font-normal block ${adminTab === 'it' ? 'text-[#192b14]/80' : 'text-slate-400'}`}>
                      Triagem e Atendimentos
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {openTicketsCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                      adminTab === 'it' ? 'bg-[#192b14] text-[#dfb642]' : 'bg-[#dfb642] text-[#192b14]'
                    }`}>
                      {openTicketsCount}
                    </span>
                  )}
                  {unreadMessagesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white animate-pulse">
                      💬 {unreadMessagesCount}
                    </span>
                  )}
                </div>
              </button>

              {/* Item 2: Cautela de Notebooks */}
              <button
                onClick={() => {
                  onSelectAdminTab('notebooks');
                  onCloseMobile();
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between group ${
                  adminTab === 'notebooks'
                    ? a11y.highContrast
                      ? 'bg-yellow-400 text-black font-black shadow-md'
                      : 'bg-[#dfb642] text-[#192b14] font-black shadow-lg scale-[1.01]'
                    : 'text-slate-200 hover:bg-[#1e3316] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    adminTab === 'notebooks' ? 'bg-[#192b14] text-[#dfb642]' : 'bg-[#1e3316] text-emerald-300 group-hover:bg-[#27431e]'
                  }`}>
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm">Cautela de Notebooks</span>
                    <span className={`text-[10px] font-normal block ${adminTab === 'notebooks' ? 'text-[#192b14]/80' : 'text-slate-400'}`}>
                      Controle de CTI e Seções
                    </span>
                  </div>
                </div>

                {activeLoansCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    adminTab === 'notebooks' ? 'bg-[#192b14] text-[#dfb642]' : 'bg-[#dfb642] text-[#192b14]'
                  }`}>
                    {activeLoansCount}
                  </span>
                )}
              </button>

              {/* Item 3: Militares da TI */}
              <button
                onClick={() => {
                  onSelectAdminTab('technicians');
                  onCloseMobile();
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between group ${
                  adminTab === 'technicians'
                    ? a11y.highContrast
                      ? 'bg-yellow-400 text-black font-black shadow-md'
                      : 'bg-[#dfb642] text-[#192b14] font-black shadow-lg scale-[1.01]'
                    : 'text-slate-200 hover:bg-[#1e3316] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    adminTab === 'technicians' ? 'bg-[#192b14] text-[#dfb642]' : 'bg-[#1e3316] text-emerald-300 group-hover:bg-[#27431e]'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm">Militares da TI</span>
                    <span className={`text-[10px] font-normal block ${adminTab === 'technicians' ? 'text-[#192b14]/80' : 'text-slate-400'}`}>
                      Técnicos & Mecânicos
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  adminTab === 'technicians' ? 'bg-[#192b14] text-[#dfb642]' : 'bg-[#1e3316] text-emerald-300'
                }`}>
                  {techniciansCount}
                </span>
              </button>

              {/* Item 4: Painel TV da Sala */}
              <button
                onClick={() => {
                  onOpenTvMode();
                  onCloseMobile();
                }}
                className="w-full px-3.5 py-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between group bg-[#1a2c15] text-[#dfb642] hover:bg-[#233c1d] border border-[#cba135]/40 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#27431e] text-[#dfb642]">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm">Painel TV da Sala</span>
                    <span className="text-[10px] text-emerald-200/70 font-normal block">
                      Exibição Operacional
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-[#dfb642] text-[#192b14]">
                  TELÃO
                </span>
              </button>
            </nav>
          </div>

          {/* Atalho para o Portal do Solicitante */}
          <div className="pt-2 border-t border-[#2d4a22]/60">
            <button
              onClick={() => {
                onNavigateToClient();
                onCloseMobile();
              }}
              className="w-full p-3 rounded-xl bg-[#1e3316]/60 hover:bg-[#1e3316] text-emerald-200 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors border border-[#2d4a22]"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#dfb642]" />
                <span>Portal do Solicitante</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Abrir / Consultar</span>
            </button>
          </div>

          {/* Notificações de Dúvidas Pendentes */}
          {unreadMessagesCount > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-950/80 border border-amber-600/60 text-amber-200 space-y-1.5 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Dúvidas do Solicitante!</span>
              </div>
              <p className="text-[11px] leading-tight text-amber-100">
                Existem <strong>{unreadMessagesCount} mensagem(ns)</strong> de militares aguardando resposta na fila.
              </p>
            </div>
          )}

        </div>

        {/* Rodapé da Barra Lateral: Sessão & Acessibilidade */}
        <div className="p-4 border-t border-[#2d4a22] bg-[#1a2c15] space-y-3">
          
          {/* Cartão do Usuário Conectado */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#152311] border border-[#2d4a22]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#27431e] text-[#dfb642] flex items-center justify-center font-bold text-xs border border-[#cba135]/40 font-mono">
                TI
              </div>
              <div className="leading-tight">
                <span className="text-xs font-bold text-white block">
                  Operador da TI
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sessão Ativa
                </span>
              </div>
            </div>

            <button
              onClick={onLogoutAdmin}
              title="Encerrar sessão de TI (Logoff)"
              className="p-2 rounded-lg text-red-300 hover:text-white hover:bg-red-950/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Controles de Acessibilidade */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
              Leitura:
            </span>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center rounded-lg border border-[#385e2b] overflow-hidden divide-x divide-[#385e2b] bg-[#27431e]">
                <button
                  onClick={() => cycleFontSize('decrease')}
                  disabled={a11y.fontSize === 'normal'}
                  title="Diminuir fonte"
                  className="px-2 py-1 text-[11px] font-bold text-emerald-100 hover:bg-[#325727] disabled:opacity-30"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <div className="px-2 py-1 text-[11px] font-mono font-bold text-[#dfb642]">
                  {a11y.fontSize === 'normal' ? 'A' : a11y.fontSize === 'large' ? 'A+' : 'A++'}
                </div>
                <button
                  onClick={() => cycleFontSize('increase')}
                  disabled={a11y.fontSize === 'extralarge'}
                  title="Aumentar fonte"
                  className="px-2 py-1 text-[11px] font-bold text-emerald-100 hover:bg-[#325727] disabled:opacity-30"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={toggleContrast}
                title="Alto contraste"
                className={`p-1.5 rounded-lg border transition-colors ${
                  a11y.highContrast
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-[#27431e] text-emerald-100 border-[#385e2b] hover:bg-[#325727]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </aside>
    </>
  );
};
