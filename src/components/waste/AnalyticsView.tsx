import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { WasteBin } from './types';

interface AnalyticsViewProps {
  bins: WasteBin[];
}

const AnalyticsView = ({ bins }: AnalyticsViewProps) => {
  const predictWasteFill = (bin: WasteBin, days: number) => {
    return Math.min(100, bin.fillLevel + bin.fillRate * days);
  };

  const predictionData = Array.from({ length: 8 }, (_, i) => {
    const dayData: Record<string, string | number> = { day: `Day ${i}` };
    bins.slice(0, 5).forEach((bin) => {
      dayData[`Bin ${bin.id}`] = predictWasteFill(bin, i);
    });
    return dayData;
  });

  const distributionData = [
    { range: '0-25%', count: bins.filter((b) => b.fillLevel < 25).length, fill: 'hsl(var(--success))' },
    { range: '25-50%', count: bins.filter((b) => b.fillLevel >= 25 && b.fillLevel < 50).length, fill: 'hsl(152, 55%, 45%)' },
    { range: '50-75%', count: bins.filter((b) => b.fillLevel >= 50 && b.fillLevel < 75).length, fill: 'hsl(var(--warning))' },
    { range: '75-100%', count: bins.filter((b) => b.fillLevel >= 75).length, fill: 'hsl(var(--destructive))' },
  ];

  const chartColors = [
    'hsl(var(--destructive))',
    'hsl(var(--info))',
    'hsl(var(--warning))',
    'hsl(var(--success))',
    'hsl(var(--chart-purple))',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border animate-fade-in">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Waste Generation Prediction (Next 7 Days)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{
                value: 'Fill Level (%)',
                angle: -90,
                position: 'insideLeft',
                fill: 'hsl(var(--muted-foreground))',
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {bins.slice(0, 5).map((bin, i) => (
              <Line
                key={bin.id}
                type="monotone"
                dataKey={`Bin ${bin.id}`}
                stroke={chartColors[i]}
                strokeWidth={2}
                dot={{ fill: chartColors[i], r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border animate-fade-in">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Fill Level Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="range"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsView;
