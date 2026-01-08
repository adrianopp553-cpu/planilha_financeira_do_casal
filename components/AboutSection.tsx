
import React from 'react';
import { translations } from '../translations';

interface AboutSectionProps {
  language: 'pt' | 'en' | 'es';
  lightMode: boolean;
}

// Logotipo do FinControl Pro reaproveitado do App.tsx para manter consistência de marca
const FCLogo = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="60" height="60" rx="12" stroke="currentColor" strokeWidth="4" />
    <path d="M35 35 H 55 V 42 H 42 V 48 H 52 V 54 H 42 V 65 H 35 Z" fill="currentColor" />
    <path d="M65 35 V 65 M 65 35 H 55 M 65 65 H 55" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <text x="50" y="85" textAnchor="middle" fontSize="12" fontWeight="900" fill="currentColor">PRO</text>
  </svg>
);

const AboutSection: React.FC<AboutSectionProps> = ({ language, lightMode }) => {
  const t = translations[language];
  const themeOrWhite = !lightMode ? 'text-white' : 'text-theme';
  const cardBg = !lightMode ? 'bg-white/5' : 'bg-white';
  const textContrast = !lightMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <section className="py-24 border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Lado Esquerdo: Como Funciona */}
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-theme mb-6">
              {t.howItWorks}
            </h2>
            <div className="space-y-12">
              {t.steps.map((step: any, idx: number) => (
                <div key={idx} className="flex gap-8 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-theme/10 border border-theme/20 flex items-center justify-center text-theme font-black text-xl transition-all group-hover:bg-theme group-hover:text-white group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-theme/20">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black mb-2 ${themeOrWhite}`}>{step.title}</h3>
                    <p className={`text-sm font-medium leading-relaxed ${textContrast}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lado Direito: Finalidade e Autoria */}
          <div className={`${cardBg} p-12 rounded-[56px] border border-black/5 dark:border-white/10 shadow-2xl relative overflow-hidden`}>
            {/* Background Decorativo */}
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 text-theme" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>

            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-theme mb-8">
                {t.purposeTitle}
              </h3>
              <p className={`text-2xl font-black italic tracking-tight leading-tight mb-12 ${themeOrWhite}`}>
                "{t.purposeText}"
              </p>

              <div className="pt-10 border-t border-black/5 dark:border-white/10 flex items-center gap-6">
                {/* Logo da Marca no lugar da Foto */}
                <div className="relative group/brand">
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-theme to-emerald-400 rounded-[38px] blur opacity-25 group-hover/brand:opacity-50 transition duration-1000"></div>
                  <div className="relative w-24 h-24 rounded-[32px] bg-theme/5 flex items-center justify-center border-2 border-white dark:border-white/20 shadow-2xl transition-all group-hover/brand:scale-105">
                    <FCLogo className="w-12 h-12 text-theme" />
                  </div>
                  {/* Badge de Verificado mantido para estilo Premium */}
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#00ffa3] rounded-full border-[3px] border-[#0a0a0a] flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white stroke-[4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 ml-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                    DESENVOLVIDO POR
                  </p>
                  <p className={`text-[32px] font-black tracking-tighter leading-none mb-4 ${themeOrWhite}`}>
                    Adriano P. Santos
                  </p>
                  <div className="inline-flex items-center px-4 py-1.5 border border-white/20 rounded-full bg-transparent">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#00ffa3]">FULL-STACK ARCHITECT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Decoração Cosmic */}
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-theme/10 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
};

export default AboutSection;
