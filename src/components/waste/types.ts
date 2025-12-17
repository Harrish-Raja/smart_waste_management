export interface WasteBin {
  id: number;
  x: number;
  y: number;
  fillLevel: number;
  capacity: number;
  type: 'residential' | 'commercial' | 'industrial';
  fillRate: number;
  lastCollection: number;
  cluster: number;
}

export interface RoutePoint {
  id: number | string;
  x: number;
  y: number;
}

export interface OptimizationSettings {
  binThreshold: number;
  numClusters: number;
  predictionDays: number;
}

export interface SystemStats {
  totalBins: number;
  needCollection: number;
  avgFillLevel: number;
  routeDistance: number;
}
