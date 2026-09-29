import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowLeft, 
  AlertTriangle, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  Tv, 
  Globe 
} from 'lucide-react';
import { AccessibilitySettings, MilitaryUser, UserRole } from '../types';
import { RegimentoDeodoroLogo } from './RegimentoDeodoroLogo';
import malletBg from '../assets/mallet_bg.jpg';

interface AdminLoginProps {
  militaryUsers: MilitaryUser[];
  onLoginSuccess: (user: MilitaryUser) => void;
  onGoBackToPortal: () => void;
  a11y: AccessibilitySettings;
  onOpenIntranet?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  militaryUsers,
  onLoginSuccess,
  onGoBackToPortal,
  a11y,
  onOpenIntranet,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password;

    // Verificar militares cadastrados
    const matchedUser = militaryUsers.find(
      u => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (matchedUser) {
      if (!matchedUser.active) {
        setErrorMsg('Este militar está com o acesso inativo. Procure o Chefe da Seção (CH-SECINFO).');
        return;
      }
      onLoginSuccess(matchedUser);
      return;
    }

    // Compatibilidade com chave mestre legada (info / R3gD300d0r0!)
    if (cleanUser === 'info' && cleanPass === 'R3gD300d0r0!') {
      const fallbackUser: MilitaryUser = {
        id: 'usr-master',
        username: 'info',
        password: cleanPass,
        name: '1º Ten Carlos Mendes',
        rank: '1º Ten',
        warName: 'Carlos Mendes',
        role: 'CH-SECINFO',
        active: true,
        specialty: 'Chefe da Seção de TI (Conta Mestre)',
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(fallbackUser);
      return;
    }

    setErrorMsg('Credenciais incorretas! Verifique o login e a senha do militar.');
  };

  const handleQuickLogin = (role: UserRole) => {
    const userForRole = militaryUsers.find(u => u.role === role && u.active);
    if (userForRole) {
      setUsername(userForRole.username);
      setPassword(userForRole.password);
      onLoginSuccess(userForRole);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CH-SECINFO':
        return { label: 'CH-SECINFO · Chefe da Seção', color: 'bg-[#dfb642] text-[#192b14] border-[#cba135]', desc: 'Acesso Total ao Sistema' };
      case 'CH-XERIFEINFO':
        return { label: 'CH-XERIFEINFO · Xerife Técnico', color: 'bg-amber-600 text-white border-amber-700', desc: 'Gerência do Corpo Técnico' };
      case 'CH-TECNICOINFO':
        return { label: 'CH-TECNICOINFO · Técnico', color: 'bg-emerald-700 text-white border-emerald-800', desc: 'Fila e Resposta a Chamados' };
      case 'CH-TVINFO':
        return { label: 'CH-TVINFO · Telão TV', color: 'bg-slate-700 text-white border-slate-800', desc: 'Exibição Sem Interação' };
    }
  };

  return (
    <div className={`min-h-[85vh] flex items-center justify-center p-4 py-8 relative overflow-hidden ${
      a11y.highContrast ? 'bg-black text-white' : 'bg-[#f4f6f2]'
    }`}>
      {/* Marca d'água artística militar: General Mallet & Artilharia */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.06] bg-cover bg-center bg-no-repeat mix-blend-multiply"
        style={{ backgroundImage: `url(${malletBg})` }}
        aria-hidden="true"
      />

      <div className={`w-full max-w-xl p-6 sm:p-8 rounded-3xl border-2 transition-all shadow-xl relative z-10 ${
        a11y.highContrast 
          ? 'bg-neutral-950 border-yellow-400 text-white' 
          : 'bg-white/95 backdrop-blur-xs border-[#2d4a22]/40'
      }`}>
        
        {/* Emblema Próprio do 2º GAC com Canhões Cruzados */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#1e3316] shadow-md border border-[#cba135]/40 mb-1">
            <RegimentoDeodoroLogo size={56} highContrast={a11y.highContrast} />
          </div>

          <div className="font-mono text-xs font-black tracking-widest text-[#2d4a22] uppercase">
            2º GAC - REGIMENTO DEODORO
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Seção de Informática & Telemática
          </h2>
          <p className="text-xs text-slate-600">
            Acesso com Autenticação Individual dos Militares da Seção
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2d4a22]" />
              <span>Identificação Militar / Login:</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Digite seu login (ex: secinfo, xerife, tecnico, tvinfo)..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-[#2d4a22] ${
                a11y.highContrast
                  ? 'bg-black border-yellow-400 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#2d4a22]" />
              <span>Senha Militar:</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Digite sua senha de acesso..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:ring-2 focus:ring-[#2d4a22] ${
                a11y.highContrast
                  ? 'bg-black border-yellow-400 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
              }`}
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 text-red-900 border border-red-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#1e3316] text-[#dfb642] font-black text-sm tracking-wider uppercase hover:bg-[#27431e] shadow-md transition-all active:scale-[0.99] border border-[#cba135]/50 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Autenticar no Sistema</span>
          </button>
        </form>

        {/* Atalhos Rápidos para Teste de Perfis */}
        <div className="mt-6 pt-5 border-t border-slate-200 text-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Acesso Rápido por Perfil:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Senha padrão: 123</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {(['CH-SECINFO', 'CH-XERIFEINFO', 'CH-TECNICOINFO', 'CH-TVINFO'] as UserRole[]).map(role => {
              const u = militaryUsers.find(usr => usr.role === role);
              const badge = getRoleBadge(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleQuickLogin(role)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-[#1e3316] hover:bg-slate-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${badge.color}`}>
                      {role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono group-hover:text-slate-700">Entrar →</span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-900 truncate">
                    {u ? u.name : role}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Login: <span className="font-bold text-slate-700">{u?.username}</span> · {badge.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Links do rodapé do card de login */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
          <button
            type="button"
            onClick={onGoBackToPortal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Central do Solicitante</span>
          </button>

          {onOpenIntranet && (
            <button
              type="button"
              onClick={onOpenIntranet}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e3316] hover:underline transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#27431e]" />
              <span>Abas da Intranet (2º GAC)</span>
            </button>
          )}
        </div>

        {/* Crédito do Desenvolvedor */}
        <div className="mt-4 pt-3 text-center text-[11px] font-mono text-[#27431e] font-semibold border-t border-slate-100">
          Desenvolvido com &lt;3 por Manfrinato | INFO/26
        </div>

      </div>
    </div>
  );
};
