import React, { useState } from 'react';
import {
  UserPlus, X, CheckCircle2,
  Crown, MessageSquare
} from 'lucide-react';

const ROLES = [
  { id: 'owner', name: 'Owner', permissions: ['all'] },
  { id: 'admin', name: 'Admin', permissions: ['manage_team', 'manage_content', 'publish', 'analytics'] },
  { id: 'editor', name: 'Editor', permissions: ['create_content', 'edit_content', 'approve'] },
  { id: 'viewer', name: 'Viewer', permissions: ['view'] },
];

export default function TeamWorkspace({ isPro, setShowPaymentModal }) {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Andi Pratama', email: 'andi@example.com', role: 'editor', status: 'active', avatar: null },
    { id: 2, name: 'Siti Rahma', email: 'siti@example.com', role: 'viewer', status: 'active', avatar: null },
  ]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [activeTab, setActiveTab] = useState('members');

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    if (!isPro) { setShowPaymentModal(true); return; }
    const newMember = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      avatar: null
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setShowInvite(false);
  };

  const removeMember = (id) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const getRoleBadge = (role) => {
    const r = ROLES.find(r => r.id === role);
    return r?.name || role;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Team Workspace</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola tim, approval workflow, dan kolaborasi konten.</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md">
          <UserPlus className="w-4 h-4" /> Undang Anggota
        </button>
      </div>

      {!isPro && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
          <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Fitur Tim tersedia di paket Pro</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">Upgrade untuk menambahkan anggota tim, workflow approval, dan white-label mode.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'members', label: '👥 Anggota Tim' },
          { id: 'workflow', label: '🔄 Approval Workflow' },
          { id: 'activity', label: '📊 Aktivitas Tim' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'members' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {member.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                    {getRoleBadge(member.role)}
                  </span>
                  <button onClick={() => removeMember(member.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showInvite && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Undang Anggota Baru</h4>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@example.com" className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                </div>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="px-3 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
                  {ROLES.filter(r => r.id !== 'owner').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button onClick={handleInvite} className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm">Kirim Undangan</button>
                <button onClick={() => setShowInvite(false)} className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-semibold text-sm">Batal</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Approval Workflow</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 font-bold">1</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Draft Dibuat</p>
                <p className="text-xs text-slate-500">Editor membuat konten dan mengirim untuk review</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-amber-600 font-bold">2</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Review & Feedback</p>
                <p className="text-xs text-slate-500">Admin/Reviewer memberikan komentar dan revisi</p>
              </div>
              <MessageSquare className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 font-bold">3</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Approved</p>
                <p className="text-xs text-slate-500">Konten disetujui dan siap publikasi</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Aktivitas Tim Terbaru</h3>
          <div className="space-y-3">
            {[
              { user: 'Andi', action: 'membuat konten', target: 'Video Review Skincare', time: '10 menit lalu' },
              { user: 'Siti', action: 'menyetujui', target: 'Postingan Instagram', time: '1 jam lalu' },
              { user: 'Andi', action: 'mengedit', target: 'Caption TikTok', time: '3 jam lalu' },
              { user: 'Siti', action: 'menjadwalkan', target: '5 konten ke content calendar', time: '5 jam lalu' },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  {act.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">{act.user}</span> {act.action} <span className="font-medium text-indigo-600 dark:text-indigo-400">{act.target}</span>
                  </p>
                </div>
                <span className="text-xs text-slate-400">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
