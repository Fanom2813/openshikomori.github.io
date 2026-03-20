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
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-black">Overview of your contribution system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card p-8 rounded-xl border border-border shadow-sm group hover:border-primary/50 transition-all"
            >
              <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} ${stat.color} mb-6 transition-transform group-hover:scale-110`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {loading ? '-' : stat.value.toLocaleString()}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <h2 className="text-lg font-bold text-foreground mb-6 uppercase tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/admin/clips"
              className="flex items-center justify-center gap-3 h-14 bg-foreground text-background text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              <Mic className="h-4 w-4" />
              Review Clips
            </a>
            <a
              href="/admin/corrections"
              className="flex items-center justify-center gap-3 h-14 bg-background border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-lg hover:bg-muted transition-all"
            >
              <Edit3 className="h-4 w-4" />
              Review Corrections
            </a>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-8">
          <h2 className="text-lg font-bold text-foreground mb-6 uppercase tracking-tight">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30 border-2 border-dashed border-border rounded-lg bg-background/50">
            <AlertCircle className="h-10 w-10 mb-4 stroke-[1.5]" />
            <p className="text-[10px] font-black uppercase tracking-widest">Activity feed coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
