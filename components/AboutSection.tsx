
import React from 'react';
import { translations } from '../translations';

interface AboutSectionProps {
  language: 'pt' | 'en' | 'es';
  lightMode: boolean;
}

const FCLogo = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="60" height="60" rx="16" stroke="currentColor" strokeWidth="5" />
    <path d="M35 35 H 55 V 42 H 42 V 48 H 52 V 54 H 42 V 65 H 35 Z" fill="currentColor" />
    <path d="M65 35 V 65 M 65 35 H 55 M 65 65 H 55" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const AboutSection: React.FC<AboutSectionProps> = ({ language, lightMode }) => {
  const t = translations[language];
  const themeOrWhite = !lightMode ? 'text-white' : 'text-slate-900';
  const cardBg = !lightMode ? 'bg-white/[0.03]' : 'bg-white';
  const textContrast = !lightMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <section className="py-32 border-t border-black/[0.03] dark:border-white/[0.05] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          {/* Lado Esquerdo: Metodologia */}
          <div className="space-y-16">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-theme mb-8 opacity-80">
                {t.howItWorks}
              </h2>
              <div className="space-y-12">
                {t.steps.map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-10 group">
                    <div className="flex-shrink-0 w-14 h-14 rounded-[22px] bg-theme/10 border border-theme/20 flex items-center justify-center text-theme font-black text-xl transition-all duration-500 group-hover:bg-theme group-hover:text-black group-hover:scale-110">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className={`text-xl font-black mb-3 ${themeOrWhite}`}>{step.title}</h3>
                      <p className={`text-base font-medium leading-relaxed max-w-sm ${textContrast}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lado Direito: Identidade e Autoria */}
          <div className={`${cardBg} p-16 rounded-[64px] border border-black/5 dark:border-white/10 shadow-2xl relative`}>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-theme mb-10">
                {t.purposeTitle}
              </h3>
              <p className={`text-3xl font-black tracking-tighter leading-[1.1] mb-16 ${themeOrWhite}`}>
                "{t.purposeText}"
              </p>

              <div className="pt-12 border-t border-black/5 dark:border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10">
                  {/* Container do Logo - Grande e Limpo */}
                  <div className="relative">
                    <div className="absolute -inset-4 bg-theme/20 blur-2xl rounded-full opacity-50"></div>
                    <div className="relative w-32 h-32 rounded-[40px] bg-theme/5 border-2 border-theme/20 flex items-center justify-center text-theme transition-transform duration-700 hover:rotate-6">
                      <FCLogo className="w-16 h-16" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                        Arquiteto do Ecossistema
                      </p>
                      <p className={`text-4xl font-black tracking-tighter ${themeOrWhite}`}>
                        Adriano P. Santos
                      </p>
                    </div>
                    <div className="inline-block px-5 py-2 rounded-xl bg-theme/10 border border-theme/20">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme">Full-Stack Architect & IA Specialist</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
