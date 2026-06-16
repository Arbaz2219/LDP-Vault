import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart2, 
  ShieldAlert, 
  RefreshCw, 
  Lock, 
  AlertTriangle 
} from 'lucide-react';
import { decrypt } from '../utils/crypto';

interface VaultItem {
  id: string;
  name: string;
  username: string;
  password?: string;
  url: string;
  type: string;
}

const Reports: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  // Security stats
  const [weakCount, setWeakCount] = useState(0);
  const [reusedCount, setReusedCount] = useState(0);
  const [unsecuredCount, setUnsecuredCount] = useState(0);

  const [weakList, setWeakList] = useState<VaultItem[]>([]);
  const [reusedList, setReusedList] = useState<VaultItem[]>([]);

  const fetchAndAnalyze = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/vault', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetched: VaultItem[] = response.data.filter((item: any) => item.type === 'login');
      analyze(fetched);
    } catch (err) {
      console.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const analyze = (itemsList: VaultItem[]) => {

    const weak: VaultItem[] = [];
    const passwordMap: { [key: string]: VaultItem[] } = {};
    const unsecured: VaultItem[] = [];

    itemsList.forEach(item => {
      // Decrypt password using automated system key
      const plainPassword = item.password ? decrypt(item.password) : '';

      // 1. Check Weak
      if (plainPassword && (plainPassword.length < 8 || !/\d/.test(plainPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(plainPassword))) {
        weak.push(item);
      }

      // 2. Check Reused
      if (plainPassword) {
        if (!passwordMap[plainPassword]) {
          passwordMap[plainPassword] = [];
        }
        passwordMap[plainPassword].push(item);
      }

      // 3. Check Unsecured
      if (item.url && !item.url.startsWith('https://')) {
        unsecured.push(item);
      }
    });

    const reused: VaultItem[] = [];
    Object.values(passwordMap).forEach(group => {
      if (group.length > 1) {
        reused.push(...group);
      }
    });

    setWeakList(weak);
    setWeakCount(weak.length);
    setReusedList(reused);
    setReusedCount(reused.length);
    setUnsecuredCount(unsecured.length);
  };

  useEffect(() => {
    if (token) {
      fetchAndAnalyze();
    }
  }, [token]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-medium text-gray-800">Security Reports</h1>
        <button 
          onClick={fetchAndAnalyze}
          className="p-2 hover:bg-gray-150 rounded border border-gray-200 text-gray-400 hover:text-blue-600 transition-colors"
          title="Refresh Analysis"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 font-sans">
        <div className="flex items-center gap-4 p-6 bg-blue-50/50 border border-blue-100 rounded-lg">
          <BarChart2 className="text-[#175ddc] w-10 h-10 shrink-0" />
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Vault Audit & Strength Analysis</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              These reports evaluate your password habits to locate weak credentials, reused passwords, or unsecured websites.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#175ddc]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Scorecard row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weak Passwords</h3>
                  <p className="text-3xl font-extrabold text-red-500 mt-2">{weakCount}</p>
                </div>
                <div className="p-3 bg-red-50 text-red-500 rounded-full">
                  <Lock size={24} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reused Passwords</h3>
                  <p className="text-3xl font-extrabold text-orange-500 mt-2">{reusedCount}</p>
                </div>
                <div className="p-3 bg-orange-50 text-orange-500 rounded-full">
                  <AlertTriangle size={24} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unsecured Sites (HTTP)</h3>
                  <p className="text-3xl font-extrabold text-yellow-600 mt-2">{unsecuredCount}</p>
                </div>
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                  <ShieldAlert size={24} />
                </div>
              </div>
            </div>

            {/* Detailed Reports Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Weak passwords report list */}
              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2 flex items-center gap-2">
                  <Lock size={18} className="text-red-500" /> Weak Password Report
                </h3>
                {weakList.length === 0 ? (
                  <p className="text-xs text-green-600 font-bold bg-green-50 p-3 rounded">Excellent! No weak passwords found in your vault.</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {weakList.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <div>
                          <p className="font-bold text-gray-700">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.username || 'No username'}</p>
                        </div>
                        <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded uppercase">Weak</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reused passwords report list */}
              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-500" /> Reused Password Report
                </h3>
                {reusedList.length === 0 ? (
                  <p className="text-xs text-green-600 font-bold bg-green-50 p-3 rounded">Excellent! No reused passwords found in your vault.</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {reusedList.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <div>
                          <p className="font-bold text-gray-700">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.username || 'No username'}</p>
                        </div>
                        <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded uppercase">Reused</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
