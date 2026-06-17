import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Globe, 
  Phone,
  Camera,
  BadgeCheck,
  Bell,
  Lock,
  ChevronRight
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto py-12 px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your professional profile and security preferences.</p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#0d43af] to-[#1a56d2]"></div>
              
              <div className="relative mt-8 mb-4 inline-block">
                <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-500">
                    <User size={40} />
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-[#0d43af] transition-colors">
                  <Camera size={14} />
                </button>
              </div>

              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{user?.name}</h2>
              <p className="text-[10px] font-black text-[#0d43af] uppercase tracking-[0.2em] mt-1 bg-blue-50 py-1 px-3 rounded-full inline-block">
                {user?.role === 'ADMIN' ? 'System Administrator' : 'Premium User'}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group/item">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-blue-50 group-hover/item:text-[#0d43af] transition-colors">
                    <Mail size={14} />
                  </div>
                  <span className="text-xs font-bold truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group/item">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-blue-50 group-hover/item:text-[#0d43af] transition-colors">
                    <Building2 size={14} />
                  </div>
                  <span className="text-xs font-bold">LDP Logistics Corp.</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0d43af] rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
               <div className="relative z-10">
                 <ShieldCheck className="mb-4 opacity-50" size={32} />
                 <h3 className="font-black text-lg leading-tight mb-2">Enterprise Protection Active</h3>
                 <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Your account is secured with 256-bit military-grade encryption.</p>
               </div>
               <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Right Column: Detailed Settings */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Professional Profile</h3>
                <button className="text-[10px] font-black text-[#0d43af] uppercase tracking-widest border border-[#0d43af]/20 px-4 py-2 rounded-xl hover:bg-[#0d43af] hover:text-white transition-all">Edit Profile</button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-[#0d43af]/30 transition-colors">
                    <User size={16} className="text-slate-300 group-hover:text-[#0d43af] transition-colors" />
                    <span className="text-sm font-bold text-slate-700">{user?.name}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <Mail size={16} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-700">{user?.email}</span>
                    <BadgeCheck size={16} className="text-green-500 ml-auto" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <Building2 size={16} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-700">LDP Logistics Corp.</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <Globe size={16} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-700">Enterprise Security</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <Phone size={16} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-700">+1 (555) 012-3456</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <ShieldCheck size={16} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-widest text-[#0d43af]">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">Security & MFA</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Manage your credentials</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
               </div>

               <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">Notifications</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Alert settings</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
