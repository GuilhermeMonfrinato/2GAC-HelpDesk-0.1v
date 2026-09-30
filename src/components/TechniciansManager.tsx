import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  X, 
  Check, 
  User, 
  Briefcase, 
  Wrench, 
  Mail,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  History,
  Search,
  Filter,
  AlertTriangle,
  Tv,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import { 
  Technician, 
  AccessibilitySettings, 
  MilitaryUser, 
  SystemAuditLog, 
  UserRole 
} from '../types';

interface TechniciansManagerProps {
  technicians: Technician[];
  militaryUsers: MilitaryUser[];
  auditLogs: SystemAuditLog[];
  currentUser: MilitaryUser | null;
  a11y: AccessibilitySettings;
  onUpdateTechnicians: (techs: Technician[]) => void;
  onUpdateMilitaryUsers: (users: MilitaryUser[]) => void;
  onAddAuditLog: (log: Omit<SystemAuditLog, 'id' | 'timestamp'>) => void;
  onSwitchUser?: (user: MilitaryUser) => void;
}

const RANKS = [
  '1º Ten',
  '2º Ten',
  'Asp',
  'Subten',
  '1º Sgt',
  '2º Sgt',
  '3º Sgt',
  'Cb',
  'Sd',
  'TI (Civil/Painel)'
];

const ROLES_INFO: Record<UserRole, { title: string; desc: string; badgeBg: string; textCol: string; borderCol: string }> = {
  'CH-SECINFO': {
    title: 'Chefe da Seção de TI',
    desc: 'Acesso irrestrito a todo o sistema, cautelas, chamados, logs, exclusões e gerenciamento de usuários.',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    textCol: 'text-amber-700',
    borderCol: 'border-amber-400'
  },
  'CH-XERIFEINFO': {
    title: 'Xerife do Corpo Técnico',
    desc: 'Atribui técnicos nos chamados, intervém com mensagem em todos, altera prioridade, edita nome e exclui chamados.',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    textCol: 'text-blue-700',
    borderCol: 'border-blue-400'
  },
  'CH-TECNICOINFO': {
    title: 'Técnico de Atendimento',
    desc: 'Liberado consultar chamados, responder dúvidas dos solicitantes e movimentar blocos de status.',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    textCol: 'text-emerald-700',
    borderCol: 'border-emerald-400'
  },
  'CH-TVINFO': {
    title: 'Painel TV (Telão da Seção)',
    desc: 'Exibição pública em tela grande com auto-scroll. Somente visualização dos chamados, sem nenhuma interação.',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    textCol: 'text-purple-700',
    borderCol: 'border-purple-400'
  }
};

export const TechniciansManager: React.FC<TechniciansManagerProps> = ({
  technicians,
  militaryUsers,
  auditLogs,
  currentUser,
  a11y,
  onUpdateTechnicians,
  onUpdateMilitaryUsers,
  onAddAuditLog,
  onSwitchUser,
}) => {
  // Controle de Abas: 'users' (Militares e Logins) | 'audit' (Logs do Sistema) | 'technicians' (Bancada Técnica)
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'technicians'>('users');

  // Permissões do usuário atual
  const isChefe = currentUser?.role === 'CH-SECINFO';
  const isXerife = currentUser?.role === 'CH-XERIFEINFO';
  const canManageUsers = isChefe || isXerife;

  // Estados do Modal de Criação de Militar (Login/Senha)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedRank, setSelectedRank] = useState('3º Sgt');
  const [warName, setWarName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CH-TECNICOINFO');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('Manutenção de Hardware e Suporte de Rede');
  const [userError, setUserError] = useState('');

  // Estados do Modal de Alteração de Senha
  const [passwordModalUser, setPasswordModalUser] = useState<MilitaryUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Estados do Modal de Desligamento / Afastamento de Militar
  const [deactivatingUser, setDeactivatingUser] = useState<MilitaryUser | null>(null);
  const [deactivationReasonCategory, setDeactivationReasonCategory] = useState<string>('Transferência de OM');
  const [deactivationNotes, setDeactivationNotes] = useState<string>('');

  // Estados de Filtro de Logs de Auditoria
  const [logSearch, setLogSearch] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('all');
  const [logFilterUser, setLogFilterUser] = useState('all');

  // Criação de Novo Militar com Login & Senha
  const handleCreateMilitaryUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanWarName = warName.trim();

    if (!cleanWarName) {
      setUserError('Informe o Nome de Guerra do militar.');
      return;
    }
    if (!cleanUsername) {
      setUserError('Informe o login de acesso do militar.');
      return;
    }
    if (!password || password.length < 3) {
      setUserError('A senha deve conter no mínimo 3 caracteres.');
      return;
    }

    // Verificar se o login já existe
    if (militaryUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      setUserError(`O login "${cleanUsername}" já está em uso por outro militar.`);
      return;
    }

    const fullName = `${selectedRank} ${cleanWarName}`;
    const newUser: MilitaryUser = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      password: password,
      name: fullName,
      rank: selectedRank,
      warName: cleanWarName,
      role: selectedRole,
      active: true,
      email: email.trim() || `${cleanUsername}@eb.mil.br`,
      specialty: specialty.trim() || 'Informática e Suporte Operacional',
      createdAt: new Date().toISOString(),
    };

    onUpdateMilitaryUsers([...militaryUsers, newUser]);

    // Registrar no Log de Auditoria
    onAddAuditLog({
      militaryName: currentUser?.name || 'Chefe da Seção',
      militaryLogin: currentUser?.username || 'admin',
      role: currentUser?.role || 'CH-SECINFO',
      actionType: 'USUARIO_CRIADO',
      summary: `Cadastrou o militar ${fullName} com login "${cleanUsername}" e perfil ${selectedRole}`,
      details: `Função: ${ROLES_INFO[selectedRole].title} | Especialidade: ${newUser.specialty}`,
      targetRef: cleanUsername,
    });

    // Se for técnico ou xerife, cadastra também na lista de bancada se não existir
    if (selectedRole !== 'CH-TVINFO' && !technicians.some(t => t.name.toLowerCase() === fullName.toLowerCase())) {
      const initials = (selectedRank.split(' ')[0][0] + cleanWarName[0]).toUpperCase();
      const newTech: Technician = {
        id: `tech-${Date.now()}`,
        name: fullName,
        role: ROLES_INFO[selectedRole].title,
        email: newUser.email || `${cleanUsername}@eb.mil.br`,
        avatar: initials,
        active: true,
        specialty: newUser.specialty || 'Suporte Técnico',
      };
      onUpdateTechnicians([...technicians, newTech]);
    }

    setShowAddUserModal(false);
    setWarName('');
    setUsername('');
    setPassword('');
    setEmail('');
  };

  // Alterar Senha de Militar
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPasswordInput.trim()) return;

    onUpdateMilitaryUsers(
      militaryUsers.map(u => u.id === passwordModalUser.id ? { ...u, password: newPasswordInput.trim() } : u)
    );

    onAddAuditLog({
      militaryName: currentUser?.name || 'Administrador',
      militaryLogin: currentUser?.username || 'admin',
      role: currentUser?.role || 'CH-SECINFO',
      actionType: 'USUARIO_SENHA_ALTERADA',
      summary: `Redefiniu a senha de acesso do militar ${passwordModalUser.name} (${passwordModalUser.username})`,
      targetRef: passwordModalUser.username,
    });

    alert(`Senha do militar ${passwordModalUser.name} alterada com sucesso!`);
    setPasswordModalUser(null);
    setNewPasswordInput('');
  };

  // Alternar Status Ativo / Inativo
  const handleToggleUserActive = (user: MilitaryUser) => {
    if (user.role === 'CH-SECINFO' && user.active && militaryUsers.filter(u => u.role === 'CH-SECINFO' && u.active).length <= 1) {
      alert('Não é possível desativar o único militar com cargo CH-SECINFO do sistema.');
      return;
    }

    if (user.active) {
      // Abrir modal para registrar o motivo do desligamento/afastamento
      setDeactivatingUser(user);
      setDeactivationReasonCategory('Transferência de OM');
      setDeactivationNotes('');
    } else {
      // Reativação direta
      if (window.confirm(`Deseja reativar o militar ${user.name} (${user.username}) para o serviço ativo na Seção de TI?`)) {
        handleReactivateUser(user);
      }
    }
  };

  const handleConfirmDeactivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivatingUser) return;

    const fullReason = deactivationNotes.trim() 
      ? `${deactivationReasonCategory}: ${deactivationNotes.trim()}`
      : deactivationReasonCategory;

    const deactivatedAt = new Date().toISOString();

    const updated = militaryUsers.map(u => u.id === deactivatingUser.id ? { 
      ...u, 
      active: false,
      deactivationReason: fullReason,
      deactivatedAt: deactivatedAt
    } : u);

    onUpdateMilitaryUsers(updated);

    // Sincronizar na bancada de técnicos também
    onUpdateTechnicians(
      technicians.map(t => t.id === deactivatingUser.id || t.email === deactivatingUser.email 
        ? { ...t, active: false } 
        : t
      )
    );

    onAddAuditLog({
      militaryName: currentUser?.name || 'Administrador',
      militaryLogin: currentUser?.username || 'admin',
      role: currentUser?.role || 'CH-SECINFO',
      actionType: 'MILITAR_DESATIVADO',
      summary: `Desativou/afastou o militar ${deactivatingUser.name} (${deactivatingUser.username})`,
      details: `Motivo: ${fullReason}`,
      targetRef: deactivatingUser.username,
    });

    setDeactivatingUser(null);
  };

  const handleReactivateUser = (user: MilitaryUser) => {
    const updated = militaryUsers.map(u => u.id === user.id ? { 
      ...u, 
      active: true,
      deactivationReason: undefined,
      deactivatedAt: undefined
    } : u);

    onUpdateMilitaryUsers(updated);

    onUpdateTechnicians(
      technicians.map(t => t.id === user.id || t.email === user.email 
        ? { ...t, active: true } 
        : t
      )
    );

    onAddAuditLog({
      militaryName: currentUser?.name || 'Administrador',
      militaryLogin: currentUser?.username || 'admin',
      role: currentUser?.role || 'CH-SECINFO',
      actionType: 'MILITAR_REATIVADO',
      summary: `Reativou o militar ${user.name} (${user.username}) para o serviço ativo`,
      targetRef: user.username,
    });
  };

  // Excluir Militar
  const handleDeleteUser = (user: MilitaryUser) => {
    if (user.role === 'CH-SECINFO' && militaryUsers.filter(u => u.role === 'CH-SECINFO').length <= 1) {
      alert('Não é permitido excluir o único Chefe de Seção (CH-SECINFO).');
      return;
    }

    if (window.confirm(`Deseja realmente remover o militar ${user.name} (login: ${user.username})?\n\nEsta ação excluirá o militar e seus acessos.`)) {
      onUpdateMilitaryUsers(militaryUsers.filter(u => u.id !== user.id));

      onAddAuditLog({
        militaryName: currentUser?.name || 'Administrador',
        militaryLogin: currentUser?.username || 'admin',
        role: currentUser?.role || 'CH-SECINFO',
        actionType: 'USUARIO_EDITADO',
        summary: `Excluiu o militar ${user.name} (login: ${user.username}) do sistema`,
        targetRef: user.username,
      });
    }
  };

  // Filtragem de Logs de Auditoria
  const filteredLogs = auditLogs.filter(log => {
    if (logFilterAction !== 'all' && log.actionType !== logFilterAction) return false;
    if (logFilterUser !== 'all' && log.militaryLogin !== logFilterUser) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const match = (
        log.militaryName.toLowerCase().includes(q) ||
        log.militaryLogin.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.targetRef && log.targetRef.toLowerCase().includes(q))
      );
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Cabeçalho Principal */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#1e3316] text-[#dfb642] uppercase">
              2º GAC - REGIMENTO DEODORO · SEÇÃO DE TI
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Controle de Efetivo & Rastreabilidade
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Gestão de Militares, Permissões & Auditoria
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl">
            Criação de <strong>login e senha individuais</strong> dos militares, atribuição rigorosa de cargos e registro cronológico de <strong>todas as ações executadas no sistema</strong> para controle militar.
          </p>
        </div>

        {canManageUsers && (
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-5 py-3 rounded-2xl bg-[#1e3316] text-[#dfb642] font-black text-sm flex items-center gap-2 hover:bg-[#27431e] shadow-md transition-all active:scale-[0.99] border border-[#cba135]/50 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Cadastrar Militar (Login/Senha)</span>
          </button>
        )}
      </div>

      {/* Faixa Explicativa dos 4 Cargos Militares do Sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(ROLES_INFO) as UserRole[]).map((roleKey) => {
          const info = ROLES_INFO[roleKey];
          return (
            <div 
              key={roleKey}
              className={`p-3.5 rounded-2xl border bg-white shadow-2xs space-y-1.5 ${info.borderCol}`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${info.badgeBg}`}>
                  {roleKey}
                </span>
                <Shield className={`w-4 h-4 ${info.textCol}`} />
              </div>
              <h4 className="font-bold text-xs text-slate-900">{info.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">{info.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Abas de Navegação */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'users'
              ? 'border-[#27431e] text-[#1e3316] bg-white font-black shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-[#27431e]" />
          <span>Militares Cadastrados & Logins ({militaryUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'audit'
              ? 'border-[#27431e] text-[#1e3316] bg-white font-black shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-amber-700" />
          <span>Logs de Auditoria & Ações ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('technicians')}
          className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'technicians'
              ? 'border-[#27431e] text-[#1e3316] bg-white font-black shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-slate-600" />
          <span>Bancada Técnica Operacional ({technicians.length})</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: MILITARES & LOGINS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Militares com credenciais individuais ativas no 2º GAC.</span>
            <span className="font-mono text-slate-500">Total: <strong>{militaryUsers.length} militares</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {militaryUsers.map((user) => {
              const roleMeta = ROLES_INFO[user.role] || ROLES_INFO['CH-TECNICOINFO'];
              const isLogged = currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`p-5 rounded-3xl border transition-all bg-white shadow-xs space-y-4 relative ${
                    user.active ? 'border-slate-200 hover:border-[#27431e]' : 'border-slate-200 opacity-60 bg-slate-50'
                  } ${isLogged ? 'ring-2 ring-[#27431e] shadow-md' : ''}`}
                >
                  {isLogged && (
                    <div className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full bg-[#1e3316] text-[#dfb642] font-mono text-[10px] font-black tracking-widest uppercase shadow-xs">
                      ● Sessão Atual
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1e3316] text-[#dfb642] font-black text-sm flex items-center justify-center border border-[#cba135]/40 shadow-xs shrink-0">
                        {user.warName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-slate-900 leading-tight">
                            {user.name}
                          </h3>
                        </div>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black border ${roleMeta.badgeBg}`}>
                          {user.role} · {roleMeta.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Ativar/Desativar */}
                      {canManageUsers && (
                        <button
                          onClick={() => handleToggleUserActive(user)}
                          title={user.active ? "Desativar Militar" : "Ativar Militar"}
                          className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                            user.active ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}

                      {/* Excluir */}
                      {canManageUsers && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          title="Remover militar"
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Informações de Credenciais (Login e Senha) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold block text-[11px]">Login do Militar:</span>
                      <code className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                        {user.username}
                      </code>
                    </div>

                    <div>
                      <span className="text-slate-500 font-bold block text-[11px]">Senha Cadastrada:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <code className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300">
                          {user.password ? '••••••••' : 'Sem senha'}
                        </code>
                        {canManageUsers && (
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordModalUser(user);
                              setNewPasswordInput(user.password || '');
                            }}
                            className="p-1 rounded text-slate-500 hover:text-[#27431e] hover:bg-slate-200"
                            title="Alterar ou visualizar senha deste militar"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Especialidade e E-mail */}
                  <div className="text-xs space-y-1 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-[#27431e] shrink-0" />
                      <span className="truncate"><strong>Especialidade:</strong> {user.specialty || 'TI Geral'}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#27431e] shrink-0" />
                        <span className="truncate"><strong>E-mail:</strong> {user.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card: Trocar de Sessão (Atalho para Testar Permissão) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] inline-block ${
                        user.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {user.active ? '● Efetivo Ativo na TI' : '○ Militar Afastado / Desligado'}
                      </span>
                      {!user.active && user.deactivationReason && (
                        <div className="mt-1 text-[11px] text-red-700 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                          <strong>Motivo:</strong> {user.deactivationReason}
                        </div>
                      )}
                    </div>

                    {onSwitchUser && (
                      <button
                        type="button"
                        onClick={() => onSwitchUser(user)}
                        disabled={isLogged || !user.active}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto ${
                          isLogged 
                            ? 'bg-slate-100 text-slate-400 cursor-default' 
                            : 'bg-[#1e3316] text-[#dfb642] hover:bg-[#27431e] shadow-2xs'
                        }`}
                        title="Alternar login para testar a experiência com o perfil deste militar"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{isLogged ? 'Conectado' : 'Entrar como este militar'}</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: LOGS DE AUDITORIA (QUEM FEZ O QUÊ NO SISTEMA) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          
          {/* Painel de Filtros dos Logs */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por militar, chamado (TICKET-1001), notebook ou descrição..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logFilterAction}
                  onChange={(e) => setLogFilterAction(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="all">Todas as Ações</option>
                  <option value="PRORROGACAO_CAUTELA">Prorrogação de Cautela</option>
                  <option value="MENSAGEM_CAUTELA">Mensagem em Cautela</option>
                  <option value="DEVOLUCAO_CAUTELA">Descautela / Devolução</option>
                  <option value="INTERVENCAO_XERIFE">Intervenção do Xerife</option>
                  <option value="ATRIBUIR_TECNICO">Atribuição de Técnico</option>
                  <option value="PRIORIDADE_CHAMADO">Alteração de Prioridade</option>
                  <option value="EDITAR_TITULO_CHAMADO">Edição de Título</option>
                  <option value="EXCLUSAO_CHAMADO">Exclusão de Chamado</option>
                  <option value="STATUS_CHAMADO">Movimentação de Bloco</option>
                  <option value="USUARIO_CRIADO">Criação de Militar/Login</option>
                  <option value="LOGIN_SUCESSO">Login no Sistema</option>
                </select>

                <select
                  value={logFilterUser}
                  onChange={(e) => setLogFilterUser(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="all">Todos os Militares</option>
                  {militaryUsers.map(u => (
                    <option key={u.id} value={u.username}>{u.name} ({u.username})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Trilha de Auditoria Oficial do Exército Brasileiro · 2º GAC</span>
              <span>Exibindo <strong>{filteredLogs.length}</strong> de {auditLogs.length} registros</span>
            </div>
          </div>

          {/* Tabela dos Logs de Auditoria */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e3316] text-[#dfb642] font-mono font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Militar Responsável</th>
                    <th className="py-3 px-4">Cargo / Role</th>
                    <th className="py-3 px-4">Ação Executada</th>
                    <th className="py-3 px-4">Referência</th>
                    <th className="py-3 px-4">Resumo & Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        Nenhum registro de log encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const roleMeta = ROLES_INFO[log.role] || ROLES_INFO['CH-TECNICOINFO'];
                      const isProrrogacao = log.actionType === 'PRORROGACAO_CAUTELA';
                      const isIntervencao = log.actionType === 'INTERVENCAO_XERIFE';
                      const isExclusao = log.actionType === 'EXCLUSAO_CHAMADO';

                      return (
                        <tr 
                          key={log.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isProrrogacao ? 'bg-amber-50/30' : isIntervencao ? 'bg-blue-50/30' : isExclusao ? 'bg-red-50/20' : ''
                          }`}
                        >
                          {/* Data/Hora */}
                          <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString('pt-BR')} {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          {/* Militar */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block leading-tight">{log.militaryName}</span>
                            <code className="text-[10px] text-slate-500 font-mono">@{log.militaryLogin}</code>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${roleMeta.badgeBg}`}>
                              {log.role}
                            </span>
                          </td>

                          {/* Ação */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`font-mono text-[11px] font-black uppercase ${
                              isProrrogacao ? 'text-amber-800' : isIntervencao ? 'text-blue-800' : isExclusao ? 'text-red-700' : 'text-slate-700'
                            }`}>
                              {log.actionType.replace(/_/g, ' ')}
                            </span>
                          </td>

                          {/* Referência */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                            {log.targetRef ? (
                              <span className="px-2 py-0.5 rounded bg-slate-100 border text-slate-900">
                                {log.targetRef}
                              </span>
                            ) : '-'}
                          </td>

                          {/* Resumo */}
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-900 leading-snug">{log.summary}</p>
                            {log.details && (
                              <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                                {log.details}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: BANCADA TÉCNICA */}
      {activeTab === 'technicians' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Militares escalados como técnicos para atendimento de chamados do regimento.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className={`p-5 rounded-3xl border transition-all bg-white shadow-xs ${
                  tech.active ? 'border-slate-200 hover:border-[#27431e]' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1e3316] text-[#dfb642] font-black text-sm flex items-center justify-center border border-[#cba135]/40 shadow-xs">
                      {tech.avatar}
                    </div>
                    <div>
                      <h3 className="font-black text-base text-slate-900">
                        {tech.name}
                      </h3>
                      <span className="text-xs font-bold text-[#27431e] block">
                        {tech.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onUpdateTechnicians(technicians.map(t => t.id === tech.id ? { ...t, active: !t.active } : t));
                      }}
                      title={tech.active ? "Marcar como Inativo" : "Marcar como Ativo"}
                      className={`p-1.5 rounded-lg text-xs font-bold ${
                        tech.active ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-[#27431e] shrink-0" />
                    <span><strong>Especialidade:</strong> {tech.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#27431e] shrink-0" />
                    <span><strong>E-mail:</strong> {tech.email}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                    tech.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tech.active ? '● Ativo para Atendimento' : '○ Em Missão / Inativo'}
                  </span>
                  <span className="text-slate-400 font-mono">Disponível</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CADASTRAR MILITAR COM LOGIN E SENHA */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#27431e]/30">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-[#1e3316] text-[#dfb642]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    Cadastrar Login de Militar
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">2º GAC - Regimento Deodoro</span>
                </div>
              </div>

              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateMilitaryUser} className="space-y-4 text-xs">
              
              {/* Posto e Nome de Guerra */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Posto / Graduação:
                  </label>
                  <select
                    value={selectedRank}
                    onChange={(e) => setSelectedRank(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                  >
                    {RANKS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome de Guerra:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Silveira, Rocha, Alencar"
                    value={warName}
                    onChange={(e) => {
                      setWarName(e.target.value);
                      if (!username) {
                        setUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Credenciais: Login e Senha */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Credenciais de Autenticação do Militar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Login de Acesso:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: rocha, silveira"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Senha Inicial:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 123 ou senha forte"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Perfil de Acesso (Cargo no Sistema) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#27431e]" />
                  <span>Perfil de Acesso & Permissões:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(ROLES_INFO) as UserRole[]).map((r) => {
                    const info = ROLES_INFO[r];
                    const isSelected = selectedRole === r;
                    return (
                      <div
                        key={r}
                        onClick={() => setSelectedRole(r)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1e3316] text-[#dfb642] border-[#cba135] shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-black text-xs">{r}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#dfb642]" />}
                        </div>
                        <span className={`text-[11px] block font-bold ${isSelected ? 'text-emerald-200' : 'text-slate-900'}`}>
                          {info.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Especialidade e E-mail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Especialidade:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Manutenção N2, Redes"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    E-mail Institucional:
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: militar@eb.mil.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {userError && (
                <div className="p-2.5 rounded-xl bg-red-100 text-red-900 text-xs font-bold border border-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{userError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-100 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1e3316] text-[#dfb642] font-black hover:bg-[#27431e] shadow-md border border-[#cba135]/40"
                >
                  Cadastrar Militar & Acessos
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ALTERAR SENHA DO MILITAR */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Alterar Senha do Militar
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {passwordModalUser.name} (@{passwordModalUser.username})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nova Senha de Acesso:
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Digite a nova senha..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                A troca de senha ficará registrada no log de auditoria com o carimbo do militar autenticado.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1e3316] text-[#dfb642] font-black hover:bg-[#27431e]"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRO DE MOTIVO DE DESLIGAMENTO / AFASTAMENTO DE MILITAR */}
      {deactivatingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-red-500/40">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 text-red-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Afastamento / Desligamento de Militar
                  </h3>
                  <span className="text-xs text-slate-500">
                    {deactivatingUser.name} ({deactivatingUser.username})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeactivatingUser(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeactivation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Motivo Principal do Afastamento *
                </label>
                <select
                  value={deactivationReasonCategory}
                  onChange={(e) => setDeactivationReasonCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="Transferência de OM">Transferência de OM / Guarnição</option>
                  <option value="Missão Externa / Operação">Missão Externa / Operação Militar</option>
                  <option value="Licença Especial / Médica">Licença Especial / Licença Médica (FSR)</option>
                  <option value="Baixa do Serviço Ativo">Baixa do Serviço Ativo / Reserva</option>
                  <option value="Férias Regulamentares">Férias Regulamentares</option>
                  <option value="Designação Externa">Designação para outra função interna</option>
                  <option value="Desligamento Administrativo">Desligamento Administrativo da TI</option>
                  <option value="Outro Motivo">Outro Motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Observações / Justificativa Militar (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Publicado no BI nº 142 de 24/09; Transferido para a 2ª Bia O; Período de 30 dias..."
                  value={deactivationNotes}
                  onChange={(e) => setDeactivationNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Atenção:</strong> Ao desativar o militar, o acesso dele ao painel administrativo será bloqueado e o motivo ficará registrado nos logs de auditoria e na listagem da seção.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeactivatingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md cursor-pointer"
                >
                  Confirmar Afastamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
