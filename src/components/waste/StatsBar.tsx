import { Trash2, AlertTriangle, Gauge, Route } from 'lucide-react';
import { SystemStats } from './types';

interface StatsBarProps {
  stats: SystemStats;
}

const StatsBar = ({ stats }: StatsBarProps) => {
  const statItems = [
    {
      label: 'Total Bins',
      value: stats.totalBins,
      icon: Trash2,
      color: 'text-foreground',
    },
    {
      label: 'Need Collection',
      value: stats.needCollection,
      icon: AlertTriangle,
      color: 'text-warning',
    },
    {
      label: 'Avg Fill Level',
      value: `${stats.avgFillLevel.toFixed(1)}%`,
      icon: Gauge,
      color: 'text-info',
    },
    {
      label: 'Route Distance',
      value: `${stats.routeDistance.toFixed(1)} km`,
      icon: Route,
      color: 'text-success',
    },
  ];

  return (
    <div className="bg-card border-b border-border py-4 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 animate-fade-in"
          >
            <div className={`p-2 rounded-lg bg-card ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
