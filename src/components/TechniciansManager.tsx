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
  Shield
} from 'lucide-react';
import { Technician, AccessibilitySettings } from '../types';

interface TechniciansManagerProps {
  technicians: Technician[];
  a11y: AccessibilitySettings;
  onUpdateTechnicians: (techs: Technician[]) => void;
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
];

export const TechniciansManager: React.FC<TechniciansManagerProps> = ({
  technicians,
  a11y,
  onUpdateTechnicians,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRank, setSelectedRank] = useState('3º Sgt');
  const [warName, setWarName] = useState('');
  const [role, setRole] = useState('Mecânico de Informática / N1');
  const [specialty, setSpecialty] = useState('Manutenção de Computadores e Impressoras');
  const [email, setEmail] = useState('');

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warName.trim()) {
      alert('Informe o Nome de Guerra do militar.');
      return;
    }

    const fullName = `${selectedRank} ${warName.trim()}`;
    const initials = (selectedRank.split(' ')[0][0] + warName.trim()[0]).toUpperCase();

    const newTech: Technician = {
      id: `tech-${Date.now()}`,
      name: fullName,
      role: role.trim() || 'Técnico de Suporte',
      email: email.trim() || `${warName.trim().toLowerCase()}@eb.mil.br`,
      avatar: initials,
      active: true,
      specialty: specialty.trim() || 'Suporte Geral de Informática',
    };

    onUpdateTechnicians([...technicians, newTech]);
    setShowAddModal(false);
    setWarName('');
    setEmail('');
  };

  const handleToggleActive = (id: string) => {
    onUpdateTechnicians(
      technicians.map(t => t.id === id ? { ...t, active: !t.active } : t)
    );
  };

  const handleDeleteTechnician = (id: string) => {
    if (technicians.length <= 1) {
      alert('É necessário manter pelo menos um militar cadastrado na Seção de TI.');
      return;
    }
    if (confirm('Deseja realmente remover este militar da lista de técnicos da TI?')) {
      onUpdateTechnicians(technicians.filter(t => t.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#1e3316] text-[#dfb642] uppercase">
              2º GAC L - REGIMENTO DEODORO
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Efetivo da Seção de Informática & Telemática
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Militares da TI (Técnicos de Atendimento)
          </h1>
          <p className="text-sm text-slate-600">
            Cadastre os militares da seção para atribuição direta nos chamados de suporte do quartel.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-[#1e3316] text-[#dfb642] font-black text-sm flex items-center gap-2 hover:bg-[#27431e] shadow-md transition-all active:scale-[0.99] border border-[#cba135]/50"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Novo Militar na TI</span>
        </button>
      </div>

      {/* Grid de Militares Cadastrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <div
            key={tech.id}
            className={`p-5 rounded-2xl border transition-all bg-white shadow-xs ${
              tech.active ? 'border-slate-200 hover:border-[#27431e]' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1e3316] text-[#dfb642] font-black text-sm flex items-center justify-center border border-[#cba135]/40 shadow-xs">
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
                  onClick={() => handleToggleActive(tech.id)}
                  title={tech.active ? "Marcar como Inativo" : "Marcar como Ativo"}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    tech.active ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTechnician(tech.id)}
                  title="Remover militar"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
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

      {/* Modal: Cadastrar Novo Militar de TI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#27431e]/30">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#1e3316] text-[#dfb642]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Cadastrar Militar na Seção de TI
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">2º GAC L - Regimento Deodoro</span>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddTechnician} className="space-y-4 text-xs">
              
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
                    placeholder="Ex: Rocha, Alencar, Silveira"
                    value={warName}
                    onChange={(e) => setWarName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Função na Seção de TI */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Função / Cargo na Seção de TI:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mecânico de Informática N1, Suporte a Redes"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              {/* Especialidade */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Especialidade Principal:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Manutenção de Computadores, Impressoras, Cabeamento"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              {/* E-mail Militar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correio Eletrônico:
                </label>
                <input
                  type="email"
                  placeholder="Ex: militar@eb.mil.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-100 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1e3316] text-[#dfb642] font-black hover:bg-[#27431e] shadow-md border border-[#cba135]/40"
                >
                  Cadastrar Militar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
