import { Settings, AlertCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { OptimizationSettings } from './types';

interface SettingsPanelProps {
  settings: OptimizationSettings;
  onSettingsChange: (settings: OptimizationSettings) => void;
}

const SettingsPanel = ({ settings, onSettingsChange }: SettingsPanelProps) => {
  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border max-w-2xl animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        Optimization Settings
      </h2>
      
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">
              Collection Threshold
            </label>
            <span className="text-sm font-bold text-primary">
              {settings.binThreshold}%
            </span>
          </div>
          <Slider
            value={[settings.binThreshold]}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, binThreshold: value[0] })
            }
            min={50}
            max={90}
            step={5}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Bins above this level will be prioritized for collection
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">
              Number of Clusters (Routes)
            </label>
            <span className="text-sm font-bold text-primary">
              {settings.numClusters} clusters
            </span>
          </div>
          <Slider
            value={[settings.numClusters]}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, numClusters: value[0] })
            }
            min={2}
            max={5}
            step={1}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Divides collection areas into separate routes for different trucks
          </p>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-medium mb-2">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>ML predicts waste fill levels using historical patterns</li>
                <li>K-means clustering groups nearby bins for efficient routing</li>
                <li>TSP optimization finds shortest collection path per cluster</li>
                <li>Real-time updates adjust routes as bins fill up</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
