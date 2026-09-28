import React, { useState } from 'react';
import { Shield, Lock, User, ArrowLeft, AlertTriangle } from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onGoBackToPortal: () => void;
  a11y: AccessibilitySettings;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onGoBackToPortal,
  a11y,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Credenciais solicitadas:
    // Login: info
    // Senha: R3gD300d0r0!
    if (username.trim() === 'info' && password === 'R3gD300d0r0!') {
      onLoginSuccess();
    } else {
      setErrorMsg('Credenciais incorretas! Verifique o usuário e a senha da Seção de Informática.');
    }
  };

  return (
    <div className={`min-h-[85vh] flex items-center justify-center p-4 ${
      a11y.highContrast ? 'bg-black text-white' : 'bg-[#f4f6f2]'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border-2 transition-all shadow-xl ${
        a11y.highContrast 
          ? 'bg-neutral-950 border-yellow-400 text-white' 
          : 'bg-white border-[#2d4a22]/40'
      }`}>
        
        {/* Emblema / Cabeçalho do Exército Brasileiro */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3316] text-[#dfb642] shadow-md border border-[#cba135]/40 mb-1">
            <Shield className="w-9 h-9" />
          </div>

          <div className="font-mono text-xs font-black tracking-widest text-[#2d4a22] uppercase">
            2º GAC L - REGIMENTO DEODORO
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Seção de Informática
          </h2>
          <p className="text-xs text-slate-600">
            Acesso Restrito ao Chefe e Auxiliares de TI do Regimento
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
              placeholder="Digite o login (ex: info)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#2d4a22] focus:border-[#2d4a22] bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#2d4a22]" />
                <span>Senha da Seção de TI:</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-[#2d4a22] hover:underline"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Digite a senha de segurança"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#2d4a22] focus:border-[#2d4a22] bg-slate-50 focus:bg-white"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dica visível das credenciais padrão */}
          <div className="p-3 rounded-xl bg-[#eef3eb] border border-[#2d4a22]/20 text-[11px] text-[#1e3316] font-mono">
            <strong>Credenciais de Acesso:</strong>
            <div className="mt-0.5">Usuário: <span className="font-bold">info</span> · Senha: <span className="font-bold">R3gD300d0r0!</span></div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#1e3316] hover:bg-[#27431e] text-[#dfb642] font-black text-sm uppercase tracking-wider shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 border border-[#cba135]/40"
          >
            <Lock className="w-4 h-4" />
            <span>Autenticar e Entrar</span>
          </button>
        </form>

        {/* Botão para voltar à interface de chamados do cliente */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onGoBackToPortal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para a Central de Chamados do Solicitante</span>
          </button>
        </div>

      </div>
    </div>
  );
};
