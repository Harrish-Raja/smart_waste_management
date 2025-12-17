import { useState, useEffect, useCallback } from 'react';
import { Trash2, Play, Pause, RotateCcw, Map, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WasteBin, RoutePoint, OptimizationSettings, SystemStats } from './types';
import StatsBar from './StatsBar';
import CityMap from './CityMap';
import BinList from './BinList';
import AnalyticsView from './AnalyticsView';
import SettingsPanel from './SettingsPanel';

type TabType = 'map' | 'analytics' | 'settings';

const SmartWasteSystem = () => {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [isSimulating, setIsSimulating] = useState(false);
  const [bins, setBins] = useState<WasteBin[]>([]);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [settings, setSettings] = useState<OptimizationSettings>({
    binThreshold: 70,
    numClusters: 3,
    predictionDays: 7,
  });

  // Initialize bins
  useEffect(() => {
    const binTypes: Array<'residential' | 'commercial' | 'industrial'> = [
      'residential',
      'commercial',
      'industrial',
    ];
    const initialBins: WasteBin[] = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      x: Math.random() * 85 + 10,
      y: Math.random() * 85 + 10,
      fillLevel: Math.random() * 100,
      capacity: 100,
      type: binTypes[Math.floor(Math.random() * 3)],
      fillRate: Math.random() * 5 + 1,
      lastCollection: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      cluster: -1,
    }));
    setBins(initialBins);
  }, []);

  // K-means clustering
  const clusterBins = useCallback(
    (binsToCluster: WasteBin[], k: number): WasteBin[] => {
      const needCollection = binsToCluster.filter(
        (b) => b.fillLevel >= settings.binThreshold
      );
      if (needCollection.length === 0) return binsToCluster;

      let centroids = needCollection.slice(0, k).map((b) => ({ x: b.x, y: b.y }));
      let iterations = 0;
      const maxIterations = 50;

      while (iterations < maxIterations) {
        needCollection.forEach((bin) => {
          let minDist = Infinity;
          let clusterIdx = 0;
          centroids.forEach((c, idx) => {
            const dist = Math.sqrt((bin.x - c.x) ** 2 + (bin.y - c.y) ** 2);
            if (dist < minDist) {
              minDist = dist;
              clusterIdx = idx;
            }
          });
          bin.cluster = clusterIdx;
        });

        const newCentroids = [];
        for (let i = 0; i < k; i++) {
          const clusterBins = needCollection.filter((b) => b.cluster === i);
          if (clusterBins.length > 0) {
            const avgX =
              clusterBins.reduce((sum, b) => sum + b.x, 0) / clusterBins.length;
            const avgY =
              clusterBins.reduce((sum, b) => sum + b.y, 0) / clusterBins.length;
            newCentroids.push({ x: avgX, y: avgY });
          } else {
            newCentroids.push(centroids[i]);
          }
        }

        const moved = centroids.some(
          (c, i) =>
            Math.abs(c.x - newCentroids[i].x) > 0.1 ||
            Math.abs(c.y - newCentroids[i].y) > 0.1
        );

        centroids = newCentroids;
        if (!moved) break;
        iterations++;
      }

      return binsToCluster.map((bin) => {
        const needsCollection = bin.fillLevel >= settings.binThreshold;
        return needsCollection ? bin : { ...bin, cluster: -1 };
      });
    },
    [settings.binThreshold]
  );

  // Route optimization (TSP approximation)
  const optimizeRoute = useCallback(
    (clusteredBins: WasteBin[]): RoutePoint[] => {
      const needCollection = clusteredBins.filter(
        (b) => b.fillLevel >= settings.binThreshold
      );
      if (needCollection.length === 0) return [];

      const depot: RoutePoint = { x: 5, y: 5, id: 'depot' };
      const routes: RoutePoint[] = [];

      for (let c = 0; c < settings.numClusters; c++) {
        const clusterBins = needCollection.filter((b) => b.cluster === c);
        if (clusterBins.length === 0) continue;

        const visited = new Set<number>();
        const clusterRoute: RoutePoint[] = [depot];
        let current = depot;

        while (visited.size < clusterBins.length) {
          let nearest: WasteBin | null = null;
          let minDist = Infinity;

          clusterBins.forEach((bin) => {
            if (!visited.has(bin.id)) {
              const dist = Math.sqrt(
                (current.x - bin.x) ** 2 + (current.y - bin.y) ** 2
              );
              if (dist < minDist) {
                minDist = dist;
                nearest = bin;
              }
            }
          });

          if (nearest) {
            clusterRoute.push(nearest);
            visited.add((nearest as WasteBin).id);
            current = nearest;
          }
        }

        clusterRoute.push(depot);
        routes.push(...clusterRoute);
      }

      return routes;
    },
    [settings.binThreshold, settings.numClusters]
  );

  const runOptimization = useCallback(() => {
    const clustered = clusterBins(bins, settings.numClusters);
    setBins(clustered);
    const optimized = optimizeRoute(clustered);
    setRoute(optimized);
  }, [bins, settings.numClusters, clusterBins, optimizeRoute]);

  // Simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setBins((prev) =>
        prev.map((bin) => ({
          ...bin,
          fillLevel: Math.min(100, bin.fillLevel + bin.fillRate * 0.1),
        }))
      );
    }, 500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleReset = () => {
    const binTypes: Array<'residential' | 'commercial' | 'industrial'> = [
      'residential',
      'commercial',
      'industrial',
    ];
    setBins((prev) =>
      prev.map((b) => ({
        ...b,
        fillLevel: Math.random() * 100,
        type: binTypes[Math.floor(Math.random() * 3)],
        cluster: -1,
      }))
    );
    setRoute([]);
    setIsSimulating(false);
  };

  // Calculate stats
  const stats: SystemStats = {
    totalBins: bins.length,
    needCollection: bins.filter((b) => b.fillLevel >= settings.binThreshold).length,
    avgFillLevel:
      bins.length > 0
        ? bins.reduce((sum, b) => sum + b.fillLevel, 0) / bins.length
        : 0,
    routeDistance: route.reduce((sum, point, i) => {
      if (i === 0) return 0;
      const prev = route[i - 1];
      return sum + Math.sqrt((point.x - prev.x) ** 2 + (point.y - prev.y) ** 2);
    }, 0),
  };

  const tabs: { id: TabType; label: string; icon: typeof Map }[] = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Trash2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Smart Waste Collection
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Route Optimization
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsSimulating(!isSimulating)}
                variant={isSimulating ? 'destructive' : 'default'}
                className="gap-2"
              >
                {isSimulating ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isSimulating ? 'Pause' : 'Simulate'}
              </Button>
              <Button onClick={handleReset} variant="secondary" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <StatsBar stats={stats} />

      {/* Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'map' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CityMap
                  bins={bins}
                  route={route}
                  settings={settings}
                  onOptimize={runOptimization}
                />
              </div>
              <div>
                <BinList bins={bins} settings={settings} />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsView bins={bins} />}

          {activeTab === 'settings' && (
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          )}
        </div>
      </main>
    </div>
  );
};

export default SmartWasteSystem;
