
import React, { useState, useEffect } from 'react';

interface AuthOverlayProps {
  correctPin: string;
  onUnlock: () => void;
  language: 'pt' | 'en' | 'es';
}

const FCLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="90" height="90" rx="28" stroke="currentColor" strokeWidth="2.5" className="opacity-40" />
    <rect x="22" y="22" width="56" height="56" rx="14" stroke="#00ffa3" strokeWidth="4" />
    <path d="M40 38 H 55 V 43 H 45 V 48 H 53 V 53 H 45 V 62 H 40 Z" fill="white" />
    <path d="M62 38 V 62 M 62 38 H 58 M 62 62 H 58" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const AuthOverlay: React.FC<AuthOverlayProps> = ({ correctPin, onUnlock, language }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleClear = () => setPin('');

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
  }, [pin, correctPin, onUnlock]);

  const labels = {
    pt: { title: "Cofre Protegido", subtitle: "Insira seu PIN para acessar" },
    en: { title: "Protected Vault", subtitle: "Enter your PIN to access" },
    es: { title: "Cofre Protegido", subtitle: "Ingrese su PIN para acceder" }
  }[language];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[40px] flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="flex flex-col items-center max-w-xs w-full">
        <div className="mb-12 flex flex-col items-center text-center">
          <FCLogo className="w-20 h-20 text-emerald-400 mb-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2">{labels.title}</h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">{labels.subtitle}</p>
        </div>

        {/* PIN Indicators */}
        <div className={`flex gap-5 mb-16 ${error ? 'animate-shake' : ''}`}>
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                pin.length > i ? 'bg-theme border-theme shadow-[0_0_15px_var(--primary-shadow)]' : 'border-white/20'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
              key={num} 
              onClick={() => handleInput(num.toString())}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-white hover:bg-theme hover:text-black transition-all active:scale-90"
            >
              {num}
            </button>
          ))}
          <div />
          <button 
            onClick={() => handleInput('0')}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-white hover:bg-theme hover:text-black transition-all active:scale-90"
          >
            0
          </button>
          <button 
            onClick={handleClear}
            className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-xs font-black text-white/30 hover:text-rose-500 uppercase tracking-widest"
          >
            Limpar
          </button>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
};

export default AuthOverlay;
