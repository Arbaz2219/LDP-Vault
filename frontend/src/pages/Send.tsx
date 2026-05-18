import React, { useState } from 'react';
import { 
  Send as SendIcon, 
  Plus, 
  Trash2, 
  Copy, 
  Clock, 
  X,
  Check
} from 'lucide-react';

interface SendItem {
  id: string;
  name: string;
  text: string;
  expiresIn: string;
  createdAt: string;
  link: string;
}

const Send: React.FC = () => {
  const [sends, setSends] = useState<SendItem[]>([
    {
      id: '1',
      name: 'Server root credentials',
      text: 'root:supersecretpassword',
      expiresIn: '1 day',
      createdAt: new Date().toLocaleDateString(),
      link: 'https://send.bitlockerldp.com/s/72a1b3'
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [expiresIn, setExpiresIn] = useState('1 day');

  const handleCreateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !text) return;

    const randomId = Math.random().toString(36).substring(7);
    const newSend: SendItem = {
      id: randomId,
      name,
      text,
      expiresIn,
      createdAt: new Date().toLocaleDateString(),
      link: `https://send.bitlockerldp.com/s/${randomId}`
    };

    setSends([newSend, ...sends]);
    setIsAdding(false);
    setName('');
    setText('');
  };

  const handleDelete = (id: string) => {
    setSends(sends.filter(s => s.id !== id));
  };

  const handleCopy = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-medium text-gray-800">Send</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#175ddc] hover:bg-[#134db8] text-white px-4 py-1.5 rounded flex items-center gap-2 text-sm font-bold shadow-sm transition-colors"
        >
          <Plus size={16} />
          New Send
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 relative">
        <p className="text-sm text-gray-500 mb-6">
          Bitlocker LDP Send is a secure, ephemeral way to share credentials, notes, or secrets with colleagues.
        </p>

        {sends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <SendIcon size={48} className="mb-4 opacity-20" />
            <p className="text-gray-400">No active Sends.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sends.map(send => (
              <div key={send.id} className="border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-base">{send.name}</h3>
                    <button 
                      onClick={() => handleDelete(send.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded p-3 mb-4 font-mono text-xs text-gray-700 break-all max-h-24 overflow-y-auto">
                    {send.text}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> Expires in {send.expiresIn}</span>
                    <span>Created: {send.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={send.link} 
                      className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs text-[#175ddc] font-medium outline-none select-all"
                    />
                    <button 
                      onClick={() => handleCopy(send.link, send.id)}
                      className="bg-blue-50 text-[#175ddc] hover:bg-blue-100 p-2 rounded transition-colors"
                      title="Copy Link"
                    >
                      {copiedId === send.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <SendIcon className="text-[#175ddc]" size={24} />
                  <h2 className="text-xl font-bold text-gray-800 font-sans">Create a secure Send</h2>
                </div>
                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateSend} className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Send Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Prod database credentials" 
                    className="input-field mt-1" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Secure Text Content</label>
                  <textarea 
                    placeholder="Type or paste the secrets you want to share..." 
                    className="input-field mt-1 h-32" 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    required 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Expiry Duration</label>
                  <select 
                    className="input-field mt-1 h-10" 
                    value={expiresIn} 
                    onChange={e => setExpiresIn(e.target.value)}
                  >
                    <option value="1 hour">1 Hour</option>
                    <option value="1 day">1 Day</option>
                    <option value="7 days">7 Days</option>
                    <option value="never">Never (Manual deletion only)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#175ddc] hover:bg-[#134db8] text-white font-bold py-2 rounded transition-colors"
                  >
                    Generate Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Send;
