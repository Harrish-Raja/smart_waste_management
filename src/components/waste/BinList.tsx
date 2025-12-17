import { WasteBin, OptimizationSettings } from './types';

interface BinListProps {
  bins: WasteBin[];
  settings: OptimizationSettings;
}

const BinList = ({ bins, settings }: BinListProps) => {
  const sortedBins = [...bins].sort((a, b) => b.fillLevel - a.fillLevel);

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-4">Bin Status</h2>
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2">
        {sortedBins.map((bin, index) => {
          const isHigh = bin.fillLevel >= settings.binThreshold;
          const isMedium = bin.fillLevel >= 50;
          
          let barColor = 'bg-success';
          let textColor = 'text-muted-foreground';
          if (isHigh) {
            barColor = 'bg-destructive';
            textColor = 'text-destructive';
          } else if (isMedium) {
            barColor = 'bg-warning';
          }

          return (
            <div
              key={bin.id}
              className="p-3 bg-secondary/50 rounded-lg animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-foreground">
                  Bin #{bin.id}
                </span>
                <span className={`text-sm font-bold ${textColor}`}>
                  {bin.fillLevel.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${bin.fillLevel}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground capitalize flex items-center gap-1">
                <span>{bin.type}</span>
                <span>•</span>
                <span>{bin.fillRate.toFixed(1)} kg/day</span>
                {bin.cluster >= 0 && (
                  <>
                    <span>•</span>
                    <span className="font-medium">Cluster {bin.cluster + 1}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BinList;
