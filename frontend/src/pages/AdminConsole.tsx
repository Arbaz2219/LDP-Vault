import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Info
} from 'lucide-react';
import LDPLogo from '../components/LDPLogo';

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
  status: string;
}

const AdminConsole: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'collections' | 'members' | 'groups' | 'settings'>('collections');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  
  // Simulated members for the mockup
  const [members] = useState<Member[]>([
    { id: '1', name: 'Super Admin', email: 'help-desk@ldplogistics.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Arbaz Khan', email: 'arbaz@ldplogistics.com', role: 'User', status: 'Active' },
  ]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/org/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to fetch departments');
    } finally {
      // Done
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [token]);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/org/departments', { name: newDeptName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDeptName('');
      fetchDepartments();
    } catch (err) {
      alert('Failed to create department. Admins only.');
    }
  };

  const navItems = [
    { id: 'collections', label: 'Collections', icon: <Layers size={18} /> },
    { id: 'members', label: 'Members', icon: <UserPlus size={18} /> },
    { id: 'groups', label: 'Groups', icon: <Users size={18} /> },
    { id: 'reporting', label: 'Reporting', icon: <BarChart2 size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Puzzle size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
           <LDPLogo className="w-8 h-8" />
           <h1 className="text-2xl font-medium text-gray-800">LDP Logistics, Inc</h1>
        </div>
        <div className="flex items-center gap-4">
           <button className="bg-[#175ddc] hover:bg-[#134db8] text-white px-4 py-1.5 rounded flex items-center gap-2 text-sm font-bold shadow-sm transition-colors">
              <Plus size={16} />
              New
              <ChevronDown size={14} className="opacity-60" />
           </button>
           <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded">
             <LayoutGrid size={18} />
           </button>
           <div className="w-8 h-8 rounded-full bg-[#175ddc] flex items-center justify-center text-white font-bold text-xs">
             HE
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sub-Sidebar */}
        <div className="w-64 bg-[#f8f9fc] border-r border-gray-200 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 text-sm font-medium cursor-pointer hover:bg-gray-100 rounded">
              <Globe size={18} /> LDP Logistics, Inc
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors ${
                  activeTab === item.id ? 'bg-[#d9e2f3] text-[#175ddc]' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-40 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 text-gray-400 text-sm font-medium">
               <Shield size={18} /> Password Manager
            </div>
            <div className="flex items-center gap-3 px-3 py-2 bg-[#d9e2f3] text-[#175ddc] text-sm font-medium rounded">
               <Layers size={18} /> Admin Console
            </div>
          </div>
        </div>

        {/* Main Admin View */}
        <div className="flex-1 flex flex-col overflow-hidden px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              LDP Logistics, Inc {activeTab === 'collections' ? 'collections' : activeTab}
            </h2>
          </div>

          {/* Filters Bar */}
          <div className="flex gap-8 mb-6">
            <div className="w-64 space-y-6">
               <div className="space-y-4">
                  <div className="flex items-center justify-between group cursor-pointer">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filters</h3>
                    <Info size={14} className="text-gray-300" />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder={`Search ${activeTab}`} 
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:border-blue-500 text-sm outline-none"
                    />
                  </div>
               </div>
               
               <div className="space-y-1">
                  <div className="flex items-center gap-3 px-2 py-1.5 rounded bg-blue-50 text-blue-700 font-medium text-sm cursor-pointer">
                    <ChevronDown size={14} /> All items
                  </div>
                  <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
                    <Globe size={14} /> Login
                  </div>
                  <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
                    <Layers size={14} /> Collections
                  </div>
               </div>
            </div>

            {/* List View */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <input type="checkbox" className="rounded" />
                <div className="flex-1">Name</div>
                {activeTab === 'collections' ? (
                  <>
                    <div className="w-32">Groups</div>
                    <div className="w-32">Permission</div>
                  </>
                ) : (
                  <>
                    <div className="w-48">Groups</div>
                    <div className="w-32">Permission</div>
                  </>
                )}
                <div className="w-10"></div>
              </div>

              <div className="divide-y divide-gray-100">
                {activeTab === 'collections' ? (
                  <>
                    {departments.map((dept) => (
                      <div key={dept.id} className="flex items-center gap-4 py-3 hover:bg-gray-50 group px-2 rounded cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400">
                          <Layers size={16} />
                        </div>
                        <div className="flex-1 font-bold text-gray-800 text-sm">{dept.name}</div>
                        <div className="w-32 flex gap-1">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">Admin</span>
                        </div>
                        <div className="w-32 text-blue-600 text-xs font-medium hover:underline">Edit items</div>
                        <div className="w-10 flex justify-end">
                          <MoreVertical size={16} className="text-gray-300" />
                        </div>
                      </div>
                    ))}
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <h3 className="text-sm font-bold text-gray-800 mb-4">Create New Collection</h3>
                      <form onSubmit={handleCreateDept} className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="Collection Name" 
                          className="input-field max-w-sm"
                          value={newDeptName}
                          onChange={e => setNewDeptName(e.target.value)}
                        />
                        <button type="submit" className="bg-[#175ddc] text-white px-6 py-2 rounded font-bold hover:bg-[#134db8]">
                          Create
                        </button>
                      </form>
                    </div>
                  </>
                ) : activeTab === 'members' ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                       <p className="text-sm text-gray-500">Manage users who have access to this organization.</p>
                       <button className="bg-[#175ddc] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                         <UserPlus size={16} /> Invite Member
                       </button>
                    </div>
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 py-3 hover:bg-gray-50 group px-2 rounded cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {member.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                        <div className="w-48 text-xs text-gray-500">None</div>
                        <div className="w-32 text-xs text-gray-500">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${member.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                             {member.role}
                           </span>
                        </div>
                        <div className="w-10 flex justify-end">
                          <MoreVertical size={16} className="text-gray-300" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : activeTab === 'settings' ? (
                  <div className="max-w-2xl space-y-8">
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Organization Settings</h3>
                        <div className="space-y-4">
                           <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Organization Name</label>
                              <input type="text" className="input-field mt-1" defaultValue="LDP Logistics, Inc" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Billing Email</label>
                              <input type="email" className="input-field mt-1" defaultValue="help-desk@ldplogistics.com" />
                           </div>
                        </div>
                     </div>
                     
                     <div className="pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Security Policies</h3>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                 <p className="font-bold text-gray-800 text-sm">Two-step Login</p>
                                 <p className="text-xs text-gray-500">Require all members to use two-step login.</p>
                              </div>
                              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                                 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                 <p className="font-bold text-gray-800 text-sm">Master Password Complexity</p>
                                 <p className="text-xs text-gray-500">Enforce strong master passwords.</p>
                              </div>
                              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                                 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <button className="bg-[#175ddc] text-white px-6 py-2 rounded font-bold hover:bg-[#134db8]">
                        Save Settings
                     </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <p>This section is coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
