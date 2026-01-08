
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
    <section className="py-24 border-t border-black/[0.03] dark:border-white/[0.05] relative overflow-hidden no-print">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          <div className="space-y-12">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-theme mb-8 opacity-70">
                {t.howItWorks}
              </h2>
              <div className="space-y-10">
                {t.steps.map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-8 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-theme/10 border border-theme/20 flex items-center justify-center text-theme font-black text-lg transition-all duration-500 group-hover:bg-theme group-hover:text-black">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className={`text-lg font-black mb-2 ${themeOrWhite}`}>{step.title}</h3>
                      <p className={`text-sm font-medium leading-relaxed max-w-sm ${textContrast}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${cardBg} p-12 rounded-[56px] border border-black/5 dark:border-white/10 shadow-xl relative`}>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-theme mb-8">
                {t.purposeTitle}
              </h3>
              <p className={`text-2xl font-black tracking-tighter leading-tight mb-12 ${themeOrWhite}`}>
                "{t.purposeText}"
              </p>

              <div className="pt-10 border-t border-black/5 dark:border-white/10">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative w-24 h-24 rounded-[32px] bg-theme/5 border-2 border-theme/20 flex items-center justify-center text-theme shadow-lg">
                    <FCLogo className="w-12 h-12" />
                  </div>

                  <div className="text-center sm:text-left">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">
                      DESENVOLVIDO POR
                    </p>
                    <p className={`text-3xl font-black tracking-tighter ${themeOrWhite} mb-3`}>
                      Adriano P. Santos
                    </p>
                    <div className="inline-block px-4 py-1.5 rounded-lg bg-theme/10 border border-theme/20">
                      <span className="text-[9px] font-black uppercase tracking-widest text-theme">Arquiteto de Sistemas</span>
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
