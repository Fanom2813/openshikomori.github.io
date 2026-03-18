import { useState, useEffect } from 'react';
import { Mic, Play, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { supabase } from '../../contribution/services/supabase';
import type { Clip } from '../../contribution/types';

export function AdminClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClips();
  }, [filter]);

  const fetchClips = async () => {
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from('clips')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching clips:', error);
    } else {
      setClips((data || []).map(row => ({
        id: row.id,
        audioUrl: row.audio_url,
        duration: row.duration,
        language: row.language,
        dialect: row.dialect,
        transcription: { text: row.transcription, source: 'manual' },
        contributedBy: row.contributed_by,
        contributedAt: new Date(row.created_at),
        status: row.status,
        correctionsCount: row.correction_count,
        isDuplicate: row.is_duplicate,
      })));
    }

    setLoading(false);
  };

  const handleStatusChange = async (clipId: string, newStatus: 'approved' | 'rejected') => {
    if (!supabase) return;

    const { error } = await supabase
      .from('clips')
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq('id', clipId);

    if (!error) {
      fetchClips();
    }
  };

  const filteredClips = clips.filter(clip =>
    clip.transcription.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clip.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clips</h1>
          <p className="text-slate-500">Manage audio contributions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-10 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredClips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Mic className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No clips found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Audio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Transcription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClips.map((clip) => (
                <tr key={clip.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-2 text-primary hover:underline">
                      <Play className="h-4 w-4" />
                      <span className="text-sm">{Math.round(clip.duration)}s</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 max-w-xs truncate">
                      {clip.transcription.text}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                      {clip.language}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      clip.status === 'approved' ? 'bg-green-100 text-green-800' :
                      clip.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {clip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {clip.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(clip.id, 'approved')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(clip.id, 'rejected')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
