import { motion } from 'framer-motion';
import type React from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: 'teal' | 'amber' | 'orange' | 'blue' | 'green' | 'purple';
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const iconColorClasses = {
  teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

export function StatCard({
  value,
  label,
  icon: Icon,
  iconColor = 'teal',
  subtext,
  trend,
  trendValue,
  className = '',
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-none p-4 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          {subtext && (
            <div className="text-[10px] text-muted-foreground/70 mt-1">{subtext}</div>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend === 'up'
                    ? 'text-green-600'
                    : trend === 'down'
                    ? 'text-red-600'
                    : 'text-muted-foreground'
                }`}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`h-10 w-10 rounded-none flex items-center justify-center ${iconColorClasses[iconColor]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface StatCardGroupProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function StatCardGroup({ children, columns = 4 }: StatCardGroupProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  return <div className={`grid ${gridCols[columns]} gap-3`}>{children}</div>;
}
