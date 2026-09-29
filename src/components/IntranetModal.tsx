import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Copy, 
  RotateCcw, 
  Server,
  Layers,
  FileText,
  Mail,
  ShieldCheck,
  Building
} from 'lucide-react';
import { AccessibilitySettings } from '../types';

export interface IntranetLink {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  isCustom?: boolean;
}

const DEFAULT_INTRANET_LINKS: IntranetLink[] = [
  {
    id: 'link-1',
    title: 'Intranet 2º GAC (Regimento Deodoro)',
    url: 'http://intranet.2gac.eb.mil.br',
    category: 'Regimento',
    description: 'Portal principal da Intranet do 2º Grupo de Artilharia de Campanha - Itu/SP.',
  },
  {
    id: 'link-2',
    title: 'SPED / SIGA-EB',
    url: 'https://sped.eb.mil.br',
    category: 'Documentos',
    description: 'Sistema de Protocolo Eletrônico e tramitação de documentos do Exército.',
  },
  {
    id: 'link-3',
    title: 'SGEx - Secretaria-Geral do Exército',
    url: 'http://www.sgex.eb.mil.br',
    category: 'Normas & Legislação',
    description: 'Boletins do Exército (BE), ostensivos e publicações oficiais.',
  },
  {
    id: 'link-4',
    title: 'Webmail Institucional EB',
    url: 'https://webmail.eb.mil.br',
    category: 'Comunicação',
    description: 'Acesso ao correio eletrônico corporativo @eb.mil.br.',
  },
  {
    id: 'link-5',
    title: 'SisCoFi / SIAFI',
    url: 'https://siscofi.eb.mil.br',
    category: 'Finanças & Fiscalização',
    description: 'Sistema de Controle Financeiro e acompanhamento de créditos.',
  },
  {
    id: 'link-6',
    title: 'Portal CTI / Suporte Local 2º GAC',
    url: 'http://10.24.0.10/suporte',
    category: 'Seção de TI',
    description: 'Servidor local da Seção de Informática e Telemática do Regimento.',
  },
  {
    id: 'link-7',
    title: 'DCT - Depto de Ciência e Tecnologia',
    url: 'http://www.dct.eb.mil.br',
    category: 'Comunicações',
    description: 'Diretrizes de segurança da informação e telemática militar.',
  },
];

const STORAGE_KEY = 'eb_deodoro_intranet_links';

interface IntranetModalProps {
  isOpen: boolean;
  onClose: () => void;
  a11y: AccessibilitySettings;
}

export const IntranetModal: React.FC<IntranetModalProps> = ({
  isOpen,
  onClose,
  a11y,
}) => {
  const [links, setLinks] = useState<IntranetLink[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_INTRANET_LINKS;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLink, setEditingLink] = useState<IntranetLink | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Regimento');
  const [description, setDescription] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {}
  }, [links]);

  if (!isOpen) return null;

  const handleCopy = (id: string, linkUrl: string) => {
    navigator.clipboard.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    if (editingLink) {
      setLinks(prev => prev.map(l => l.id === editingLink.id ? {
        ...l,
        title: title.trim(),
        url: url.trim(),
        category: category.trim(),
        description: description.trim(),
      } : l));
      setEditingLink(null);
    } else {
      const newLink: IntranetLink = {
        id: `link-${Date.now()}`,
        title: title.trim(),
        url: url.trim(),
        category: category.trim() || 'Intranet',
        description: description.trim(),
        isCustom: true,
      };
      setLinks(prev => [...prev, newLink]);
    }

    setShowAddForm(false);
    setTitle('');
    setUrl('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este link da lista da intranet?')) {
      setLinks(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm('Restaurar os links padrão do Exército Brasileiro / 2º GAC?')) {
      setLinks(DEFAULT_INTRANET_LINKS);
    }
  };

  const categories = Array.from(new Set(links.map(l => l.category)));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border-2 border-[#27431e]/40 max-h-[92vh] flex flex-col space-y-4">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1e3316] text-[#dfb642] shadow-sm">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  Abas & Sistemas da Intranet
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#dfb642] text-[#192b14]">
                  2º GAC
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Links diretos para portais corporativos e servidores da Seção de TI do Regimento Deodoro.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingLink(null);
                setTitle('');
                setUrl('');
                setDescription('');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#1e3316] text-[#dfb642] font-black text-xs flex items-center gap-1.5 hover:bg-[#27431e] shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Fechar Formulário' : 'Novo Link'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulário de Adicionar / Editar Link */}
        {showAddForm && (
          <form onSubmit={handleSave} className="p-4 rounded-2xl bg-[#f4f6f2] border border-[#27431e]/30 space-y-3 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#27431e]" />
              <span>{editingLink ? 'Editar Link da Intranet' : 'Adicionar Novo Link da Intranet'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Sistema / Aba:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: GLPI Suporte TI, Almoxarifado..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Endereço URL / IP do Servidor:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: http://10.24.1.5:8080 ou https://intranet..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoria:</label>
                <input
                  type="text"
                  placeholder="Ex: Regimento, Seção de TI, Finanças"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Breve Descrição (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: Servidor de arquivos e chamados internos da OM"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLink(null);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-200 text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#1e3316] text-[#dfb642] font-black hover:bg-[#27431e] shadow-xs"
              >
                {editingLink ? 'Salvar Alterações' : 'Adicionar Link'}
              </button>
            </div>
          </form>
        )}

        {/* Lista de Links agrupada por categoria */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <span className="text-[11px] font-mono font-black uppercase text-[#1e3316] tracking-wider block border-b border-slate-200 pb-1">
                {cat}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {links.filter(l => l.category === cat).map((link) => (
                  <div
                    key={link.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#27431e] bg-slate-50/60 hover:bg-white transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-xs text-slate-900 group-hover:text-[#192b14] flex items-center gap-1.5 hover:underline"
                        >
                          <span>{link.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#27431e] shrink-0" />
                        </a>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleCopy(link.id, link.url)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Copiar link"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingLink(link);
                              setTitle(link.title);
                              setUrl(link.url);
                              setCategory(link.category);
                              setDescription(link.description || '');
                              setShowAddForm(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-[#192b14] hover:bg-slate-100"
                            title="Editar link"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(link.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Remover link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {link.description && (
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {link.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                      <code className="text-[#27431e] font-semibold truncate max-w-[200px]" title={link.url}>
                        {link.url}
                      </code>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-[#1e3316] text-[#dfb642] font-black hover:bg-[#27431e] shrink-0"
                      >
                        Abrir ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé do Modal com Informações e Reset */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Configuração salva no navegador local deste servidor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-[11px] font-bold text-slate-500 hover:text-[#192b14] flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
