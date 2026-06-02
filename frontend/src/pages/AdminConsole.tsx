import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Shield, 
  Settings, 
  UserPlus, 
  Layers, 
  BarChart2, 
  Puzzle, 
  Globe, 
  MoreVertical,
  Search,
  ChevronDown,
  LayoutGrid,
  Info,
  Building2,
  Lock,
  ExternalLink,
  ShieldCheck,
  XCircle,
  RefreshCw,
  Terminal
} from 'lucide-react';
import LDPLogo from '../components/LDPLogo';
import { Link, useNavigate } from 'react-router-dom';

interface Department {
  id: string;
  name: string;
  _count: {
    users: number;
    vaultItems: number;
  };
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  portals: string[];
  createdAt: string;
}

const AdminConsole: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'collections' | 'members' | 'reporting'>('collections');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [orgName, setOrgName] = useState('LDP VAULT');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('USER');
  const [invitePassword, setInvitePassword] = useState('');
  const [invitePortals, setInvitePortals] = useState<string[]>(['vault', 'terminal']);
  
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/org/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/api/org/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
    } catch (err) {
      console.error('Failed to fetch members');
    }
  };

  const fetchOrgDetails = async () => {
    try {
      const response = await api.get('/api/org', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) setOrgName(response.data.name);
    } catch (err) {
      console.error('Failed to fetch org details');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch logs');
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN' && !currentUser.portals?.includes('admin')) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (token) {
      fetchDepartments();
      fetchMembers();
      fetchOrgDetails();
      fetchLogs();
    }
  }, [token]);


  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/org/users', {
        email: inviteEmail,
        name: inviteName,
        password: invitePassword,
        role: inviteRole,
        portals: invitePortals
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsInviting(false);
      setInviteEmail('');
      setInviteName('');
      setInvitePassword('');
      setInvitePortals(['vault', 'terminal']);
      fetchMembers();
    } catch (err) {
      alert('Failed to invite user');
    }
  };

  const toggleUserPortal = async (userId: string, portal: string, currentPortals: string[]) => {
    const newPortals = currentPortals.includes(portal)
      ? currentPortals.filter(p => p !== portal)
      : [...currentPortals, portal];
    
    try {
      await api.patch(`/api/org/users/${userId}/portals`, { portals: newPortals }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMembers();
    } catch (err) {
      alert('Failed to update portal access');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/org/users/${resetUserId}/reset-password`, {
        newPassword: resetPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password reset successfully');
      setResetUserId(null);
      setResetPassword('');
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  const navItems = [
    { id: 'collections', label: 'Collections', icon: <Layers size={18} /> },
    { id: 'members', label: 'Members', icon: <Users size={18} /> },
    { id: 'groups', label: 'Groups', icon: <Users size={18} /> },
    { id: 'reporting', label: 'Reporting', icon: <BarChart2 size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Puzzle size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-white font-sans text-[#1d2736]">
      {/* Sidebar Overlay for Mobile */}
      
      {/* Sidebar - Light Bitwarden Style */}
      <aside className="w-[280px] bg-[#f8f9fb] border-r border-[#e6ebf1] flex flex-col z-20">
        <div className="p-8 pb-10">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <LDPLogo className="h-10 w-auto" hideText={true} />
            <div className="flex flex-col">
               <span className="text-xl font-black text-[#0d43af] tracking-tight leading-none">LDP Vault</span>
               <span className="text-[10px] font-bold text-[#5e6b7e] uppercase tracking-widest mt-0.5">Admin Console</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="px-4 py-2 mb-2 flex items-center justify-between group cursor-pointer hover:bg-gray-100/50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
               <Building2 size={18} className="text-[#5e6b7e]" />
               <span className="text-sm font-bold text-[#1d2736]">{orgName}</span>
            </div>
            <ChevronDown size={14} className="text-[#5e6b7e] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === item.id 
                ? 'bg-[#d9e2f3] text-[#0d43af]' 
                : 'text-[#5e6b7e] hover:bg-gray-100 hover:text-[#1d2736]'
              }`}
            >
              <span className={activeTab === item.id ? 'text-[#0d43af]' : 'text-[#5e6b7e]'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Portal Switcher at Bottom */}
        <div className="p-4 mt-auto border-t border-[#e6ebf1] space-y-2">
           <Link 
             to="/dashboard"
             className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#5e6b7e] hover:bg-gray-100 rounded-xl transition-all"
           >
              <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                <Lock size={16} />
              </div>
              Password Manager
           </Link>
           <div className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-[#0d43af] bg-[#d9e2f3] rounded-xl shadow-sm">
              <div className="p-1.5 bg-[#0d43af] text-white rounded-lg">
                <Shield size={16} />
              </div>
              Admin Console
           </div>
        </div>

        <div className="p-6 text-[10px] text-[#5e6b7e] font-medium opacity-60">
           More from LDP Vault
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-20 bg-white border-b border-[#e6ebf1] flex items-center justify-between px-10 shrink-0">
           <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-[#1d2736]">
                {orgName} {activeTab === 'collections' ? 'collections' : activeTab}
              </h1>
           </div>

           <div className="flex items-center gap-4">
              <button className="h-10 px-5 bg-[#0d43af] hover:bg-[#0a358a] text-white rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/10 transition-all active:scale-95">
                 <Plus size={18} />
                 New
                 <div className="w-px h-4 bg-white/20 ml-1"></div>
                 <ChevronDown size={14} className="opacity-70" />
              </button>
              
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-[#e6ebf1]">
                 <button className="p-2 text-[#5e6b7e] hover:bg-white hover:text-[#0d43af] hover:shadow-sm rounded-md transition-all">
                    <LayoutGrid size={18} />
                 </button>
                 <button className="p-2 bg-white text-[#0d43af] shadow-sm rounded-md">
                    <Layers size={18} />
                 </button>
              </div>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d43af] to-[#2563eb] flex items-center justify-center text-white font-black text-xs shadow-md">
                {currentUser?.name?.[0]?.toUpperCase() || 'A'}
              </div>
           </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-10 bg-white">
           <div className="flex gap-10">
              {/* Left Column: Filters */}
              <div className="w-72 shrink-0 space-y-8">
                 <div className="bg-white rounded-2xl border border-[#e6ebf1] shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[#e6ebf1] flex items-center justify-between">
                       <h3 className="text-xs font-black text-[#5e6b7e] uppercase tracking-widest">Filters</h3>
                       <Info size={14} className="text-[#5e6b7e]" />
                    </div>
                    <div className="p-5 space-y-5">
                       <div className="relative group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5e6b7e] w-4 h-4 group-focus-within:text-[#11347a] transition-colors" />
                          <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`} 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#e6ebf1] rounded-xl focus:bg-white focus:border-[#11347a] focus:ring-4 focus:ring-[#11347a]/5 text-sm outline-none transition-all placeholder:text-[#5e6b7e]/50 font-medium"
                          />
                       </div>

                       <div className="space-y-1">
                          <button className="w-full flex items-center gap-3 px-3 py-2 bg-[#d9e2f3] text-[#11347a] rounded-lg text-sm font-bold">
                             <ChevronDown size={14} /> All items
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#5e6b7e] hover:bg-gray-50 rounded-lg text-sm font-semibold pl-8">
                             <Globe size={14} /> Login
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#5e6b7e] hover:bg-gray-50 rounded-lg text-sm font-semibold pl-8">
                             <Lock size={14} /> Secret
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#5e6b7e] hover:bg-gray-50 rounded-lg text-sm font-semibold text-left">
                             <Layers size={14} className="mr-1" /> Collections
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Column: Portal/Content Tables */}
              <div className="flex-1 min-w-0">
                 {activeTab === 'members' && (
                    <div className="mb-6 flex items-center justify-between">
                       <div>
                          <h2 className="text-sm font-bold text-[#1d2736]">Organization Members</h2>
                          <p className="text-xs text-[#5e6b7e] mt-1">Manage users and their portal access levels.</p>
                       </div>
                       <button 
                         onClick={() => setIsInviting(true)}
                         className="h-10 px-6 bg-[#11347a] hover:bg-[#0a2150] text-white rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-all shadow-md shadow-blue-500/10"
                       >
                         <UserPlus size={16} /> Invite Member
                       </button>
                    </div>
                 )}

                 {/* Custom Table Header */}
                 <div className="flex items-center gap-4 py-3 border-b border-[#e6ebf1] text-[10px] font-black text-[#5e6b7e] uppercase tracking-[0.15em] px-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-[#e6ebf1] text-[#11347a] focus:ring-[#11347a]" />
                    <div className="flex-1">Name / Status</div>
                    {activeTab === 'members' ? (
                       <>
                          <div className="w-48">Portal Access</div>
                          <div className="w-32">Role</div>
                          <div className="w-32 text-right">Joined</div>
                       </>
                    ) : (
                       <>
                          <div className="w-48">Groups</div>
                          <div className="w-32 text-right">Permission</div>
                       </>
                    )}
                    <div className="w-10"></div>
                 </div>

                 {/* List Container */}
                 <div className="divide-y divide-gray-50">
                    {activeTab === 'collections' ? (
                       <>
                          {departments.map((dept) => (
                             <div key={dept.id} className="flex items-center gap-4 py-4 px-4 hover:bg-[#f8f9fb] transition-colors group cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-[#e6ebf1] text-[#11347a]" />
                                <div className="w-10 h-10 rounded-xl border border-[#e6ebf1] bg-white flex items-center justify-center text-[#5e6b7e] shadow-sm">
                                   <Layers size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="font-bold text-[#1d2736] text-sm truncate">{dept.name}</p>
                                   <p className="text-[10px] text-[#5e6b7e] font-semibold uppercase tracking-wider mt-0.5">
                                      {dept._count.users} Users • {dept._count.vaultItems} Items
                                   </p>
                                </div>
                                <div className="w-48 flex items-center gap-2">
                                   <span className="px-3 py-1 bg-gray-100 text-[#5e6b7e] rounded-full text-[10px] font-black uppercase tracking-wider">Unassigned</span>
                                </div>
                                <div className="w-32 text-right">
                                   <span className="text-[#11347a] text-xs font-bold hover:underline">Edit Permission</span>
                                </div>
                                <div className="w-10 flex justify-end">
                                   <button className="p-2 text-[#e6ebf1] hover:text-[#5e6b7e] rounded-lg transition-colors">
                                      <MoreVertical size={18} />
                                   </button>
                                </div>
                             </div>
                          ))}
                       </>
                    ) : activeTab === 'members' ? (
                       <>
                          {members.map((member) => (
                             <div key={member.id} className="flex items-center gap-4 py-5 px-4 hover:bg-[#f8f9fb] transition-colors group">
                                <input type="checkbox" className="w-4 h-4 rounded border-[#e6ebf1] text-[#11347a]" />
                                <div className="w-10 h-10 rounded-xl bg-[#d9e2f3] text-[#11347a] flex items-center justify-center font-black text-sm shadow-sm ring-1 ring-white">
                                   {member.name[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2">
                                      <p className="font-bold text-[#1d2736] text-sm truncate">{member.name}</p>
                                      {member.role === 'ADMIN' && <ShieldCheck size={14} className="text-[#11347a]" />}
                                   </div>
                                   <p className="text-xs text-[#5e6b7e] font-medium truncate">{member.email}</p>
                                </div>
                                <div className="w-48 flex items-center gap-3">
                                   {/* Portal Access Controls */}
                                   <button 
                                     onClick={() => toggleUserPortal(member.id, 'vault', member.portals || [])}
                                     className={`p-1.5 rounded-lg transition-all ${member.portals?.includes('vault') ? 'bg-[#d9e2f3] text-[#11347a]' : 'bg-gray-50 text-gray-300'}`}
                                     title="Vault Access"
                                   >
                                      <Lock size={14} />
                                   </button>
                                   <button 
                                     onClick={() => toggleUserPortal(member.id, 'admin', member.portals || [])}
                                     className={`p-1.5 rounded-lg transition-all ${member.portals?.includes('admin') ? 'bg-[#11347a] text-white shadow-sm' : 'bg-gray-50 text-gray-300'}`}
                                     title="Admin Access"
                                   >
                                      <Shield size={14} />
                                   </button>
                                   <button 
                                     onClick={() => toggleUserPortal(member.id, 'terminal', member.portals || [])}
                                     className={`p-1.5 rounded-lg transition-all ${member.portals?.includes('terminal') ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-50 text-gray-300'}`}
                                     title="Terminal Access"
                                   >
                                      <Terminal size={14} />
                                   </button>
                                </div>
                                <div className="w-32">
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-[#5e6b7e]'}`}>
                                      {member.role === 'ADMIN' ? 'Executive' : 'Member'}
                                   </span>
                                </div>
                                <div className="w-32 text-right text-[10px] font-bold text-[#5e6b7e] opacity-60 uppercase">
                                   {new Date(member.createdAt).toLocaleDateString()}
                                </div>
                                <div className="w-10 flex justify-end relative group/menu">
                                   <button className="p-2 text-[#e6ebf1] hover:text-[#5e6b7e] rounded-lg transition-colors">
                                      <MoreVertical size={18} />
                                   </button>
                                   <div className="hidden group-hover/menu:block absolute right-0 top-full mt-1 w-48 bg-white border border-[#e6ebf1] shadow-2xl rounded-2xl p-2 z-50">
                                      <button 
                                        onClick={() => navigate(`/members/${member.id}`)}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#1d2736] hover:bg-gray-50 rounded-xl"
                                      >
                                         <ExternalLink size={14} /> View Details
                                      </button>
                                      <button 
                                        onClick={() => setResetUserId(member.id)}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#1d2736] hover:bg-gray-50 rounded-xl"
                                      >
                                         <Lock size={14} /> Reset Master Password
                                      </button>
                                      <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                      <button 
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl"
                                      >
                                         <XCircle size={14} /> Remove Member
                                      </button>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </>
                    ) : activeTab === 'reporting' ? (
                       <div className="space-y-6">
                          <div className="flex items-center justify-between mb-8">
                             <div>
                                <h2 className="text-xl font-black text-[#1d2736] tracking-tight">Security Audit Logs</h2>
                                <p className="text-sm text-[#5e6b7e] font-medium">Monitoring all authentication and credential access events.</p>
                             </div>
                             <button 
                               onClick={fetchLogs}
                               className="p-2 border border-[#e6ebf1] rounded-xl hover:bg-gray-50 text-[#5e6b7e]"
                             >
                                <RefreshCw size={18} />
                             </button>
                          </div>

                          <div className="bg-white rounded-3xl border border-[#e6ebf1] shadow-sm overflow-hidden">
                             <table className="w-full text-left border-collapse">
                                <thead>
                                   <tr className="bg-gray-50/50 border-b border-[#e6ebf1]">
                                      <th className="px-6 py-4 text-[10px] font-black text-[#5e6b7e] uppercase tracking-widest">Timestamp</th>
                                      <th className="px-6 py-4 text-[10px] font-black text-[#5e6b7e] uppercase tracking-widest">User</th>
                                      <th className="px-6 py-4 text-[10px] font-black text-[#5e6b7e] uppercase tracking-widest">Action</th>
                                      <th className="px-6 py-4 text-[10px] font-black text-[#5e6b7e] uppercase tracking-widest">Details</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e6ebf1]">
                                   {logs.length === 0 ? (
                                      <tr>
                                         <td colSpan={4} className="px-6 py-20 text-center text-[#5e6b7e]/40 font-bold italic">
                                            No audit logs found.
                                         </td>
                                      </tr>
                                   ) : (
                                      logs.map((log: any) => (
                                         <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-[#5e6b7e]">
                                               {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                               <div className="flex items-center gap-3">
                                                  <div className="w-7 h-7 rounded-lg bg-[#d9e2f3] text-[#11347a] flex items-center justify-center font-black text-[10px]">
                                                     {log.user?.name?.[0]?.toUpperCase() || '?'}
                                                  </div>
                                                  <div>
                                                     <p className="text-xs font-bold text-[#1d2736]">{log.user?.name}</p>
                                                     <p className="text-[10px] text-[#5e6b7e]">{log.user?.email}</p>
                                                  </div>
                                               </div>
                                            </td>
                                            <td className="px-6 py-4">
                                               <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                                  log.action.includes('LOGIN') ? 'bg-green-50 text-green-700' : 
                                                  log.action.includes('COPY') ? 'bg-blue-50 text-blue-700' : 
                                                  'bg-orange-50 text-orange-700'
                                               }`}>
                                                  {log.action}
                                               </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-[#1d2736]">
                                               {log.details || 'N/A'}
                                            </td>
                                         </tr>
                                      ))
                                   )}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center py-40 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100 mt-4">
                          <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                             <BarChart2 size={32} className="text-[#e6ebf1]" />
                          </div>
                          <p className="text-sm font-bold text-[#5e6b7e]">Module: {activeTab}</p>
                          <p className="text-xs text-[#5e6b7e]/60 mt-2 font-medium">This administrative module is under development.</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Modals & Overlays */}
      {isInviting && (
        <div className="fixed inset-0 bg-[#0b1a30]/40 flex items-center justify-center z-[100] backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-10 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#11347a] to-[#2563eb]"></div>
              
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-14 h-14 bg-blue-50 text-[#11347a] rounded-2xl flex items-center justify-center shadow-inner">
                    <UserPlus size={28} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-[#1d2736] tracking-tight">Invite Member</h2>
                    <p className="text-sm text-[#5e6b7e] font-medium">Add a new professional to your organization.</p>
                 </div>
              </div>

              <form onSubmit={handleInvite} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#5e6b7e] uppercase tracking-[0.2em] ml-1">Full Name</label>
                       <input 
                         type="text" 
                         className="w-full px-5 py-3.5 bg-gray-50 border border-[#e6ebf1] rounded-2xl focus:bg-white focus:border-[#11347a] focus:ring-4 focus:ring-[#11347a]/5 text-sm outline-none transition-all font-semibold" 
                         value={inviteName}
                         onChange={e => setInviteName(e.target.value)}
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#5e6b7e] uppercase tracking-[0.2em] ml-1">Work Email</label>
                       <input 
                         type="email" 
                         className="w-full px-5 py-3.5 bg-gray-50 border border-[#e6ebf1] rounded-2xl focus:bg-white focus:border-[#11347a] focus:ring-4 focus:ring-[#11347a]/5 text-sm outline-none transition-all font-semibold" 
                         value={inviteEmail}
                         onChange={e => setInviteEmail(e.target.value)}
                         required
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#5e6b7e] uppercase tracking-[0.2em] ml-1">Assigned Role</label>
                       <select 
                         className="w-full px-5 py-3.5 bg-gray-50 border border-[#e6ebf1] rounded-2xl focus:bg-white focus:border-[#11347a] focus:ring-4 focus:ring-[#11347a]/5 text-sm outline-none transition-all font-bold appearance-none cursor-pointer"
                         value={inviteRole}
                         onChange={e => setInviteRole(e.target.value)}
                       >
                          <option value="USER">Member</option>
                          <option value="ADMIN">Executive / Admin</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-[#5e6b7e] uppercase tracking-[0.2em] ml-1">Master Password</label>
                       <input 
                         type="text" 
                         className="w-full px-5 py-3.5 bg-gray-50 border border-[#e6ebf1] rounded-2xl focus:bg-white focus:border-[#11347a] focus:ring-4 focus:ring-[#11347a]/5 text-sm outline-none transition-all font-semibold" 
                         value={invitePassword}
                         placeholder="Minimum 6 characters"
                         onChange={e => setInvitePassword(e.target.value)}
                         required
                         minLength={6}
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                     <label className="text-[10px] font-black text-[#5e6b7e] uppercase tracking-[0.2em] ml-1">Portal Access</label>
                     <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-[#e6ebf1]">
                        <button 
                          type="button"
                          onClick={() => {
                            const newPortals = invitePortals.includes('vault') ? invitePortals.filter(p => p !== 'vault') : [...invitePortals, 'vault'];
                            setInvitePortals(newPortals);
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all font-bold text-xs ${invitePortals.includes('vault') ? 'bg-[#11347a] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}
                        >
                           <Lock size={14} /> Vault
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const newPortals = invitePortals.includes('admin') ? invitePortals.filter(p => p !== 'admin') : [...invitePortals, 'admin'];
                            setInvitePortals(newPortals);
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all font-bold text-xs ${invitePortals.includes('admin') ? 'bg-[#11347a] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}
                        >
                           <Shield size={14} /> Admin
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const newPortals = invitePortals.includes('terminal') ? invitePortals.filter(p => p !== 'terminal') : [...invitePortals, 'terminal'];
                            setInvitePortals(newPortals);
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all font-bold text-xs ${invitePortals.includes('terminal') ? 'bg-[#11347a] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}
                        >
                           <Terminal size={14} /> Terminal
                        </button>
                     </div>
                  </div>

                 <div className="flex gap-4 mt-12">
                    <button 
                      type="button"
                      onClick={() => setIsInviting(false)}
                      className="flex-1 px-8 py-4 text-sm font-black text-[#5e6b7e] hover:bg-gray-50 rounded-2xl transition-all uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-[#11347a] hover:bg-[#0a2150] text-white font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                    >
                      Send Invitation
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Reset Password Modal (Simplified for local) */}
      {resetUserId && (
        <div className="fixed inset-0 bg-[#0b1a30]/40 flex items-center justify-center z-[100] backdrop-blur-md">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">
              <h2 className="text-xl font-black text-[#1d2736] mb-6 tracking-tight">Reset Master Password</h2>
              <form onSubmit={handleResetPassword} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#5e6b7e] uppercase tracking-[0.2em]">New Password</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-gray-50 border border-[#e6ebf1] rounded-2xl focus:border-[#11347a] outline-none font-bold" 
                      value={resetPassword}
                      onChange={e => setResetPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                 </div>
                 <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setResetUserId(null)}
                      className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-[#5e6b7e]"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-[#11347a] text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-xs"
                    >
                      Update Password
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
