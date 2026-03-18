import { useEffect, useState } from 'react';
import { Mic, Edit3, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../contribution/services/supabase';

interface Stats {
  totalClips: number;
  pendingClips: number;
  approvedClips: number;
  pendingCorrections: number;
  totalContributors: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalClips: 0,
    pendingClips: 0,
    approvedClips: 0,
    pendingCorrections: 0,
    totalContributors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return;

      try {
        // Get clips stats
        const { count: totalClips } = await supabase
          .from('clips')
          .select('*', { count: 'exact', head: true });

        const { count: pendingClips } = await supabase
          .from('clips')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: approvedClips } = await supabase
          .from('clips')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        const { count: pendingCorrections } = await supabase
          .from('corrections')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: totalContributors } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalClips: totalClips || 0,
          pendingClips: pendingClips || 0,
          approvedClips: approvedClips || 0,
          pendingCorrections: pendingCorrections || 0,
          totalContributors: totalContributors || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Clips',
      value: stats.totalClips,
      icon: Mic,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending Review',
      value: stats.pendingClips,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Approved',
      value: stats.approvedClips,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pending Corrections',
      value: stats.pendingCorrections,
      icon: Edit3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Contributors',
      value: stats.totalContributors,
      icon: Users,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of your contribution system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} ${stat.color} mb-4`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? '-' : stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/clips"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Mic className="h-4 w-4" />
            Review Clips
          </a>
          <a
            href="/admin/corrections"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Review Corrections
          </a>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-slate-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Activity feed coming soon</p>
        </div>
      </div>
    </div>
  );
}
