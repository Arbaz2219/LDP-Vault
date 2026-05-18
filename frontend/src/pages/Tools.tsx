import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Copy, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  ShieldAlert 
} from 'lucide-react';

const Tools: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowercase = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (avoidAmbiguous) {
      uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O
      lowercase = 'abcdefghijkmnopqrstuvwxyz'; // Removed l
      numbers = '23456789'; // Removed 0, 1
    }

    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (!charset) {
      setPassword('Select at least one option');
      return;
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generated += charset[randomIndex];
    }
    setPassword(generated);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, avoidAmbiguous]);

  const handleCopy = () => {
    if (password === 'Select at least one option') return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPasswordStrength = () => {
    if (password.length < 8) return { label: 'Too Weak', color: 'text-red-500 bg-red-50 border-red-200', score: 1 };
    let score = 0;
    if (includeUppercase) score++;
    if (includeLowercase) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;
    if (length >= 14) score++;
    if (length >= 20) score++;

    if (score <= 3) return { label: 'Weak', color: 'text-orange-500 bg-orange-50 border-orange-200', score: 2 };
    if (score <= 4) return { label: 'Good', color: 'text-blue-500 bg-blue-50 border-blue-200', score: 3 };
    return { label: 'Strong & Secure', color: 'text-green-600 bg-green-50 border-green-200', score: 4 };
  };

  const strength = getPasswordStrength();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-medium text-gray-800">Generator</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
          <Wrench size={16} /> Tools
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Password Generator</h2>
            <p className="text-sm text-gray-500">Create highly secure random passwords with enterprise-grade customization.</p>
          </div>

          {/* Password Output Container */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 font-mono text-xl text-gray-800 break-all select-all justify-between relative group">
              <span className="flex-1 mr-4 overflow-hidden">{password}</span>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={generatePassword} 
                  className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-[#175ddc] transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  onClick={handleCopy}
                  className="p-2 bg-blue-50 text-[#175ddc] hover:bg-blue-100 rounded transition-colors"
                  title="Copy Password"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* Strength indicator */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-bold w-fit ${strength.color}`}>
              {strength.score >= 3 ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              Strength: {strength.label}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Length slider */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold text-gray-600">
                <span>Password Length</span>
                <span className="text-[#175ddc]">{length} characters</span>
              </div>
              <input 
                type="range" 
                min={8} 
                max={64} 
                value={length} 
                onChange={e => setLength(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#175ddc]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>Minimum (8)</span>
                <span>Maximum (64)</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="uppercase" 
                    checked={includeUppercase} 
                    onChange={e => setIncludeUppercase(e.target.checked)}
                    className="rounded text-[#175ddc] focus:ring-[#175ddc]"
                  />
                  <label htmlFor="uppercase" className="text-sm font-medium text-gray-700 cursor-pointer select-none">A-Z (Uppercase letters)</label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="lowercase" 
                    checked={includeLowercase} 
                    onChange={e => setIncludeLowercase(e.target.checked)}
                    className="rounded text-[#175ddc] focus:ring-[#175ddc]"
                  />
                  <label htmlFor="lowercase" className="text-sm font-medium text-gray-700 cursor-pointer select-none">a-z (Lowercase letters)</label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="numbers" 
                    checked={includeNumbers} 
                    onChange={e => setIncludeNumbers(e.target.checked)}
                    className="rounded text-[#175ddc] focus:ring-[#175ddc]"
                  />
                  <label htmlFor="numbers" className="text-sm font-medium text-gray-700 cursor-pointer select-none">0-9 (Numbers)</label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="symbols" 
                    checked={includeSymbols} 
                    onChange={e => setIncludeSymbols(e.target.checked)}
                    className="rounded text-[#175ddc] focus:ring-[#175ddc]"
                  />
                  <label htmlFor="symbols" className="text-sm font-medium text-gray-700 cursor-pointer select-none">!@#$ (Special character symbols)</label>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <input 
                    type="checkbox" 
                    id="ambiguous" 
                    checked={avoidAmbiguous} 
                    onChange={e => setAvoidAmbiguous(e.target.checked)}
                    className="rounded text-[#175ddc] focus:ring-[#175ddc]"
                  />
                  <label htmlFor="ambiguous" className="text-sm font-medium text-gray-500 cursor-pointer select-none">Avoid ambiguous characters (e.g. l, O, 0)</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
