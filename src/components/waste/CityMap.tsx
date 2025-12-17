import { Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WasteBin, RoutePoint, OptimizationSettings } from './types';

interface CityMapProps {
  bins: WasteBin[];
  route: RoutePoint[];
  settings: OptimizationSettings;
  onOptimize: () => void;
}

const CityMap = ({ bins, route, settings, onOptimize }: CityMapProps) => {
  const clusterColors = [
    'hsl(var(--destructive))',
    'hsl(var(--info))',
    'hsl(var(--warning))',
    'hsl(var(--chart-purple))',
    'hsl(var(--success))',
  ];

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">City Map</h2>
        <Button onClick={onOptimize} className="gap-2">
          <Route className="w-4 h-4" />
          Optimize Route
        </Button>
      </div>
      
      <div
        className="relative bg-secondary/30 rounded-lg overflow-hidden border border-border"
        style={{ height: '480px' }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
          {/* Grid lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <line
                x1={i * 10}
                y1={0}
                x2={i * 10}
                y2={100}
                stroke="hsl(var(--border))"
                strokeWidth="0.15"
              />
              <line
                x1={0}
                y1={i * 10}
                x2={100}
                y2={i * 10}
                stroke="hsl(var(--border))"
                strokeWidth="0.15"
              />
            </g>
          ))}

          {/* Draw routes */}
          {route.length > 1 && (
            <path
              d={route.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
              stroke="hsl(var(--primary))"
              strokeWidth="0.4"
              fill="none"
              strokeDasharray="1.5,0.8"
              strokeLinecap="round"
            />
          )}

          {/* Draw cluster connections */}
          {bins
            .filter((b) => b.cluster >= 0)
            .map((bin) => {
              const clusterBins = bins.filter(
                (b) => b.cluster === bin.cluster && b.id !== bin.id
              );
              return clusterBins.map((other) => (
                <line
                  key={`${bin.id}-${other.id}`}
                  x1={bin.x}
                  y1={bin.y}
                  x2={other.x}
                  y2={other.y}
                  stroke={clusterColors[bin.cluster % clusterColors.length]}
                  strokeWidth="0.12"
                  opacity="0.25"
                />
              ));
            })}

          {/* Draw bins */}
          {bins.map((bin) => {
            const isHigh = bin.fillLevel >= settings.binThreshold;
            const isMedium = bin.fillLevel >= 50;
            
            let fillColor = 'hsl(var(--success))';
            if (isHigh) fillColor = 'hsl(var(--destructive))';
            else if (isMedium) fillColor = 'hsl(var(--warning))';

            return (
              <g key={bin.id} className="transition-transform duration-300">
                {/* Pulse effect for high fill */}
                {isHigh && (
                  <circle
                    cx={bin.x}
                    cy={bin.y}
                    r={2.5}
                    fill={fillColor}
                    opacity="0.2"
                    className="animate-pulse-slow"
                  />
                )}
                <circle
                  cx={bin.x}
                  cy={bin.y}
                  r={isHigh ? 1.8 : 1.2}
                  fill={fillColor}
                  stroke="hsl(var(--card))"
                  strokeWidth="0.25"
                />
                {bin.cluster >= 0 && (
                  <text
                    x={bin.x}
                    y={bin.y}
                    fontSize="1.5"
                    textAnchor="middle"
                    dy="0.5"
                    fill="hsl(var(--card))"
                    fontWeight="bold"
                  >
                    {bin.cluster + 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* Depot */}
          <g>
            <rect
              x="2"
              y="2"
              width="5"
              height="5"
              rx="0.5"
              fill="hsl(var(--info))"
              stroke="hsl(var(--card))"
              strokeWidth="0.3"
            />
            <text
              x="4.5"
              y="5.2"
              fontSize="2.5"
              textAnchor="middle"
              fill="hsl(var(--info-foreground))"
              fontWeight="bold"
            >
              D
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-success rounded-full" />
          <span className="text-muted-foreground">Low (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-warning rounded-full" />
          <span className="text-muted-foreground">Medium (50-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive rounded-full" />
          <span className="text-muted-foreground">High (&gt;70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-info rounded-sm" />
          <span className="text-muted-foreground">Depot</span>
        </div>
      </div>
    </div>
  );
};

export default CityMap;
