
import React, { useState } from 'react';
import { analyzeFinances, deepThinkingAnalysis, marketSearchAnalysis } from '../services/geminiService';
import { getLocalAnalysis } from '../services/localAdvisor';
import { Transaction, AIAnalysisResult } from '../types';

interface AIAssistantProps {
  transactions: Transaction[];
  language: 'pt' | 'en' | 'es';
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions, language }) => {
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const handleAction = async (type: 'quick' | 'deep' | 'market') => {
    if (transactions.length === 0) return;
    setLoading(type);
    setResult(null);
    setIsOfflineMode(false);

    try {
      let data: AIAnalysisResult;
      
      // Tentativa com IA (requer internet e chave)
      if (type === 'quick') data = await analyzeFinances(transactions);
      else if (type === 'deep') data = await deepThinkingAnalysis(transactions);
      else data = await marketSearchAnalysis(transactions);

      // Se a IA retornar erro ou mensagem vazia (comum sem internet/chave)
      if (!data.text || data.text.includes("Erro")) {
        throw new Error("API Indisponível");
      }
      
      setResult(data);
    } catch (err) {
      // MODO OFFLINE AUTOMÁTICO
      console.log("Iniciando Processamento Local (Offline)...");
      const localData = getLocalAnalysis(transactions, type, language);
      setResult(localData);
      setIsOfflineMode(true);
    } finally {
      setLoading(null);
    }
  };

  const cardStyle = {
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary-dark), black 40%) 0%, var(--bg-dark) 100%)',
    borderColor: 'rgba(255, 255, 255, 0.1)'
  };

  return (
    <div 
      style={cardStyle}
      className="text-white p-6 md:p-8 rounded-[40px] shadow-2xl mb-8 overflow-hidden relative border transition-all duration-500 hover:shadow-theme/20"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-theme p-2.5 rounded-2xl mr-4 shadow-lg shadow-theme/20 border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black tracking-tight italic">Conselheiro Virtual</h2>
          </div>
          {isOfflineMode && (
            <span className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white/50 border border-white/5">
              ⚡ Processamento Local
            </span>
          )}
        </div>
        
        <p className="text-white/70 mb-8 text-sm font-medium max-w-lg leading-relaxed">
          Sua inteligência financeira personalizada. {isOfflineMode ? 'Analítica local ativa: insights gerados instantaneamente sem nuvem.' : 'Analisamos seus dados para oferecer os melhores conselhos amorosos e financeiros.'}
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <button 
            onClick={() => handleAction('quick')} 
            disabled={!!loading || transactions.length === 0} 
            className={`px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-30`}
          >
            {loading === 'quick' ? '...' : '💡 Conselhos'}
          </button>
          <button 
            onClick={() => handleAction('deep')} 
            disabled={!!loading || transactions.length === 0} 
            className={`px-6 py-3 bg-theme hover:brightness-110 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-30 shadow-lg shadow-theme/20`}
          >
            {loading === 'deep' ? '...' : '🧠 Estratégia'}
          </button>
          <button 
            onClick={() => handleAction('market')} 
            disabled={!!loading || transactions.length === 0} 
            className={`px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-30`}
          >
            {loading === 'market' ? '...' : '🌐 Mercado'}
          </button>
        </div>

        {result && (
          <div className="bg-black/20 p-8 rounded-[32px] border border-white/10 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-md relative overflow-hidden">
            <div className="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: result.text }} />
            
            {result.sources && result.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
                {result.sources.map((source, idx) => source.web && (
                  <a 
                    key={idx} 
                    href={source.web.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] bg-theme/20 hover:bg-theme/40 border border-theme/30 px-4 py-2 rounded-full text-white font-black uppercase tracking-wider transition-all"
                  >
                    {source.web.title || 'Referência'}
                  </a>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => { setResult(null); setIsOfflineMode(false); }} 
              className="mt-8 text-[10px] text-white/40 hover:text-white uppercase tracking-[0.2em] font-black underline underline-offset-8 transition-colors"
            >
              Fechar Análise
            </button>
            
            {isOfflineMode && (
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
            )}
          </div>
        )}
      </div>
      
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-theme/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-theme/20 rounded-full blur-[80px] pointer-events-none"></div>
    </div>
  );
};

export default AIAssistant;
