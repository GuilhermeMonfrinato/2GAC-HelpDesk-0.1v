import React, { useState } from 'react';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  ExternalLink, 
  Globe, 
  Lock, 
  ChevronRight,
  Shield,
  Layers,
  FileText,
  Mail,
  Server,
  Building,
  HeartHandshake
} from 'lucide-react';
import { AccessibilitySettings } from '../types';
import { RegimentoDeodoroLogo } from './RegimentoDeodoroLogo';
import { IntranetLink } from './IntranetModal';

interface OfficialFooterProps {
  a11y: AccessibilitySettings;
  isAdminRoute: boolean;
  onNavigateToAdmin: () => void;
  onNavigateToClient: () => void;
  onOpenIntranetModal: () => void;
  onToggleContrast: () => void;
}

export const OfficialFooter: React.FC<OfficialFooterProps> = ({
  a11y,
  isAdminRoute,
  onNavigateToAdmin,
  onNavigateToClient,
  onOpenIntranetModal,
  onToggleContrast,
}) => {
  // Links rápidos da Intranet padrão do Exército Brasileiro / 2º GAC
  const quickIntranetLinks = [
    { title: 'Intranet 2º GAC (Local)', url: 'http://intranet.2gac.eb.mil.br', desc: 'Portal oficial' },
    { title: 'SPED / SIGA-EB', url: 'https://sped.eb.mil.br', desc: 'Documentos e Protocolo' },
    { title: 'Webmail Institucional EB', url: 'https://webmail.eb.mil.br', desc: 'Correio eletrônico' },
    { title: 'SGEx - Boletins e Normas', url: 'http://www.sgex.eb.mil.br', desc: 'Boletins do Exército' },
    { title: 'SisCoFi / SIAFI', url: 'https://siscofi.eb.mil.br', desc: 'Gestão financeira' },
    { title: 'Servidor Local TI (10.24.0.10)', url: 'http://10.24.0.10', desc: 'Sistemas da OM' },
  ];

  const handleLinkClick = (url: string, e: React.MouseEvent) => {
    // Tenta abrir o link em nova aba
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer 
      className={`border-t transition-colors relative z-10 ${
        a11y.highContrast 
          ? 'bg-black border-yellow-400 text-white' 
          : 'bg-[#152311] border-[#2d4a22] text-slate-200'
      }`}
    >
      {/* Container Principal de Colunas Oficiais (Estilo Portal 2º GAC) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        
        {/* Brasão Superior Oficial do 2º GAC */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#2d4a22]/70">
          <div className="p-1 rounded-xl bg-[#1b2f15] border border-[#dfb642]/60 shadow-md">
            <RegimentoDeodoroLogo size={42} highContrast={a11y.highContrast} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#dfb642] block">
              Exército Brasileiro · Comando Militar do Sudeste
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
              2º GRUPO DE ARTILHARIA DE CAMPANHA - REGIMENTO DEODORO
            </h3>
            <span className="text-xs text-emerald-300/80 font-mono">
              Quartel do Bom Jesus · Itu - SP
            </span>
          </div>
        </div>

        {/* Barra de Botões Rápidos da Intranet - Padrão de Sites Oficiais */}
        <div className="mb-8 p-4 rounded-2xl bg-[#1a2d14] border border-[#345925] shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[#2d4a22]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#dfb642]" />
              <span className="font-mono text-xs font-black text-[#dfb642] uppercase tracking-wider">
                Abas da Intranet & Serviços Oficiais
              </span>
            </div>
            <button
              onClick={onOpenIntranetModal}
              className="text-[11px] font-mono font-bold text-emerald-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>+ Gerenciar / Adicionar Abas</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quickIntranetLinks.map((item, idx) => (
              <button
                key={idx}
                onClick={(e) => handleLinkClick(item.url, e)}
                className="px-3.5 py-2 rounded-xl bg-[#233c1c] hover:bg-[#2e5223] text-left border border-[#3e682e] text-white hover:text-[#dfb642] transition-all flex items-center gap-2 group cursor-pointer text-xs font-bold shadow-xs active:scale-[0.98]"
                title={`Abrir em nova aba: ${item.url}`}
              >
                <span>{item.title}</span>
                <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:text-[#dfb642] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Grade de 4 Colunas como no site padrão da OM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          
          {/* COLUNA 1: INSTITUCIONAL */}
          <div>
            <h4 className="font-black text-[#dfb642] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfb642]"></span>
              INSTITUCIONAL
            </h4>
            <ul className="space-y-1.5 text-slate-300 font-medium">
              <li>
                <a href="#historico" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Histórico do Regimento</span>
                </a>
              </li>
              <li>
                <a href="#comando" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Comando da OM</span>
                </a>
              </li>
              <li>
                <a href="#adjunto" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Adjunto de Comando</span>
                </a>
              </li>
              <li>
                <a href="#eternos" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Eternos Comandantes</span>
                </a>
              </li>
              <li>
                <a href="#subordinacao" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Subordinação (11ª Bda Inf L)</span>
                </a>
              </li>
              <li>
                <a href="#moeda" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Moeda do 2º GAC</span>
                </a>
              </li>
              <li>
                <a href="#cancao" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Canção do Regimento Deodoro</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUNA 2: RELACIONAMENTO COM A SOCIEDADE */}
          <div>
            <h4 className="font-black text-[#dfb642] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfb642]"></span>
              RELACIONAMENTO COM A SOCIEDADE
            </h4>
            <ul className="space-y-1.5 text-slate-300 font-medium">
              <li>
                <a href="#visitas" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Como Visitar o 2º GAC?</span>
                </a>
              </li>
              <li>
                <a href="#localizacao" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Endereço e Localização em Itu</span>
                </a>
              </li>
              <li>
                <a href="#comsoc" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Comunicação Social (ComSoc)</span>
                </a>
              </li>
              <li>
                <a href="#noticias" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Notícias e Eventos da OM</span>
                </a>
              </li>
              <li>
                <a href="#contato" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Contato / Fale Conosco</span>
                </a>
              </li>
              <li>
                <a href="#alistamento" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Serviço Militar Inicial / NPOR</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: SERVIÇOS ADMINISTRATIVOS & FUSEX */}
          <div>
            <h4 className="font-black text-[#dfb642] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfb642]"></span>
              SERVIÇOS ADMINISTRATIVOS
            </h4>
            <ul className="space-y-1.5 text-slate-300 font-medium">
              <li>
                <a href="#sfpc" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Fiscalização de Produtos Controlados (SFPC)</span>
                </a>
              </li>
              <li>
                <a href="#veteranos" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Veteranos, Pensionistas e Prova de Vida</span>
                </a>
              </li>
              <li>
                <a href="#compras" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Planos de Contratações Anuais (SALC)</span>
                </a>
              </li>
              <li>
                <a href="#identidade" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#dfb642] transition-colors flex items-center gap-1.5 group">
                  <span className="text-emerald-400/80 group-hover:translate-x-0.5 transition-transform">→</span>
                  <span>Agendamento de Identidade Militar</span>
                </a>
              </li>
              
              <li className="pt-2 border-t border-[#2d4a22]/50">
                <span className="font-bold text-[#dfb642] block mb-1">Fundo de Saúde do Exército (FuSEx):</span>
                <div className="pl-2 space-y-1 text-[11px] text-slate-400">
                  <p>→ Solicitação de Guia Médica / Odonto</p>
                  <p>→ Casos Urgentes / Pronto Atendimento</p>
                  <p>→ Rede Credenciada na Guarnição de Itu</p>
                  <p>→ Ouvidoria FuSEx do 2º GAC</p>
                </div>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: ABAS DA INTRANET (BOTÕES CLICÁVEIS DIRETOS) */}
          <div className="bg-[#1b2e15] p-4 rounded-2xl border border-[#2d4a22] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-[#dfb642] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#dfb642]" />
                <span>ABAS DA INTRANET</span>
              </h4>
              <button
                onClick={onOpenIntranetModal}
                className="text-[10px] font-mono text-emerald-300 hover:text-white underline cursor-pointer"
                title="Configurar URLs dos sistemas para o servidor do quartel"
              >
                Gerenciar
              </button>
            </div>
            
            <p className="text-[11px] text-slate-300 mb-3 leading-snug">
              Acesso direto aos sistemas internos do quartel e redes militares:
            </p>

            {/* Grade de botões clicáveis como sites padrões */}
            <div className="grid grid-cols-1 gap-1.5">
              {quickIntranetLinks.map((item, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleLinkClick(item.url, e)}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#233c1c] hover:bg-[#2d4e24] text-left border border-[#375f2c] text-white hover:text-[#dfb642] transition-all flex items-center justify-between group cursor-pointer"
                  title={`Abrir ${item.title}: ${item.url}`}
                >
                  <div className="min-w-0 pr-1">
                    <span className="font-bold text-[11px] block truncate leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[9px] text-emerald-300/70 block truncate">
                      {item.desc}
                    </span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:text-[#dfb642] shrink-0" />
                </button>
              ))}
            </div>

            <button
              onClick={onOpenIntranetModal}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-[#2d4a22] hover:bg-[#385e2b] text-[#dfb642] hover:text-white font-mono text-[11px] font-bold border border-[#dfb642]/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>+ Adicionar Link do Servidor</span>
            </button>
          </div>

        </div>

        {/* SEÇÃO INFERIOR: REDES SOCIAIS & SELOS GOVERNAMENTAIS */}
        <div className="mt-10 pt-6 border-t border-[#2d4a22]/70 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Redes Sociais */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-mono font-black uppercase text-[#dfb642]">
              REDES SOCIAIS:
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/exercito_oficial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#1b2f15] border border-[#2d4a22] text-slate-300 hover:text-[#dfb642] hover:bg-[#233d1c] transition-colors"
                title="Instagram Oficial"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/exercitooficial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#1b2f15] border border-[#2d4a22] text-slate-300 hover:text-[#dfb642] hover:bg-[#233d1c] transition-colors"
                title="Twitter / X Oficial"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/exercito"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#1b2f15] border border-[#2d4a22] text-slate-300 hover:text-[#dfb642] hover:bg-[#233d1c] transition-colors"
                title="Facebook Oficial"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/exercitooficial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#1b2f15] border border-[#2d4a22] text-slate-300 hover:text-[#dfb642] hover:bg-[#233d1c] transition-colors"
                title="YouTube Oficial"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Selos Governamentais (Acesso à Informação & Governo Federal) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-5">
            {/* Selo Acesso à Informação */}
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-7 h-7 rounded-full bg-white text-[#152311] flex items-center justify-center font-black text-xs">
                i
              </div>
              <div className="text-[10px] leading-tight font-sans">
                <span className="font-bold block">Acesso à</span>
                <span>Informação</span>
              </div>
            </div>

            {/* Selo Governo Federal */}
            <div className="flex items-center gap-1.5 pl-4 border-l border-[#2d4a22] text-white">
              <div>
                <span className="text-[8px] tracking-wider uppercase block text-slate-300">Governo Federal</span>
                <span className="font-black text-sm tracking-tight text-white block leading-none">BRASIL</span>
                <span className="text-[7px] text-[#dfb642] block font-mono">UNIÃO E RECONSTRUÇÃO</span>
              </div>
            </div>

            {/* Ações de Navegação e Acessibilidade */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#2d4a22]">
              {!isAdminRoute ? (
                <button
                  onClick={onNavigateToAdmin}
                  className="hover:text-white flex items-center gap-1 font-mono text-[11px] text-emerald-200/70 hover:text-[#dfb642] transition-colors cursor-pointer"
                  title="Acesso exclusivo da Seção de TI via URL /admin"
                >
                  <Lock className="w-3 h-3" />
                  <span>Acesso TI (/admin)</span>
                </button>
              ) : (
                <button
                  onClick={onNavigateToClient}
                  className="hover:text-white font-mono text-[11px] text-[#dfb642] hover:underline cursor-pointer"
                >
                  ← Central do Solicitante
                </button>
              )}

              <span>·</span>

              <button
                onClick={onToggleContrast}
                className="hover:underline font-semibold text-xs cursor-pointer"
              >
                {a11y.highContrast ? 'Alto Contraste: ON' : 'Alto Contraste'}
              </button>
            </div>

          </div>

        </div>

        {/* Linha de Crédito Oficial Requerida */}
        <div className="mt-6 pt-4 border-t border-[#2d4a22]/40 text-center font-mono text-[11px] text-emerald-300/80">
          desenvolvido com &lt;3 por Manfrinato | INFO/26
        </div>

      </div>
    </footer>
  );
};
