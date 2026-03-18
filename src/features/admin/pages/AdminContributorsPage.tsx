import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, MoreVertical, CheckCircle } from 'lucide-react';
import { supabase } from '../../contribution/services/supabase';
import { avatarOptions } from '../../contribution/data/avatars';
import type { User as UserType } from '../../contribution/types';

interface Contributor {
  id: string;
  displayName: string;
  avatar: string;
  contributionCount: number;
  isPublic: boolean;
  createdAt: string;
}

export function AdminContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    if (!supabase) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_public', true)
      .order('contribution_count', { ascending: false });

    if (!error && data) {
      setContributors(data.map(row => ({
        id: row.id,
        displayName: row.display_name || 'Unknown',
        avatar: row.avatar || '👤',
        contributionCount: row.contribution_count || 0,
        isPublic: row.is_public,
        createdAt: row.created_at,
      })));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contributor?')) return;

    if (!supabase) return;
    await supabase.from('users').delete().eq('id', id);
    fetchContributors();
  };

  const handleSave = async (contributor: Partial<Contributor>) => {
    if (!supabase) return;

    if (contributor.id) {
      // Update
      await supabase.from('users').update({
        display_name: contributor.displayName,
        avatar: contributor.avatar,
        contribution_count: contributor.contributionCount,
        is_public: contributor.isPublic,
      }).eq('id', contributor.id);
    } else {
      // Create - requires auth user first, so this is simplified
      alert('Creating new contributors requires Supabase Auth. Use the invite feature instead.');
    }

    setShowAddModal(false);
    setEditingContributor(null);
    fetchContributors();
  };

  const filteredContributors = contributors.filter(c =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contributors</h1>
          <p className="text-slate-500">Manage public contributors and their profiles</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Contributor
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contributors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredContributors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No contributors found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contributor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contributions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredContributors.map((contributor) => (
                <tr key={contributor.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-lg bg-slate-100">
                        {contributor.avatar}
                      </div>
                      <span className="font-medium text-slate-900">{contributor.displayName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{contributor.contributionCount}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(contributor.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Public
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingContributor(contributor)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contributor.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal - simplified version */}
      {(showAddModal || editingContributor) && (
        <ContributorModal
          contributor={editingContributor}
          onClose={() => {
            setShowAddModal(false);
            setEditingContributor(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface ContributorModalProps {
  contributor: Contributor | null;
  onClose: () => void;
  onSave: (contributor: Partial<Contributor>) => void;
}

function ContributorModal({ contributor, onClose, onSave }: ContributorModalProps) {
  const [displayName, setDisplayName] = useState(contributor?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(contributor?.avatar || avatarOptions[0]?.id || '👤');
  const [contributionCount, setContributionCount] = useState(contributor?.contributionCount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: contributor?.id,
      displayName,
      avatar: selectedAvatar,
      contributionCount,
      isPublic: true,
    });
  };

  const selectedAvatarData = avatarOptions.find(a => a.id === selectedAvatar);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">
            {contributor ? 'Edit Contributor' : 'Add Contributor'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center text-4xl mb-2"
              style={{ backgroundColor: selectedAvatarData?.bgColor || '#e2e8f0' }}
            >
              {selectedAvatarData?.emoji || '👤'}
            </div>
            <p className="font-medium">{displayName || 'Preview'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Avatar</label>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all ${
                    selectedAvatar === avatar.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: avatar.bgColor }}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contribution Count</label>
            <input
              type="number"
              min={0}
              value={contributionCount}
              onChange={(e) => setContributionCount(parseInt(e.target.value) || 0)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
