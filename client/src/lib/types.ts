export interface OHLCV {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerBandsSettings {
  // Inputs
  length: number;
  maType: 'sma';
  source: 'open' | 'high' | 'low' | 'close' | 'hl2' | 'hlc3' | 'ohlc4';
  stddev: number;
  offset: number;
  
  // Style
  basicVisible: boolean;
  basicColor: string;
  basicWidth: number;
  basicStyle: 'solid' | 'dashed';
  
  upperVisible: boolean;
  upperColor: string;
  upperWidth: number;
  upperStyle: 'solid' | 'dashed';
  
  lowerVisible: boolean;
  lowerColor: string;
  lowerWidth: number;
  lowerStyle: 'solid' | 'dashed';
  
  fillVisible: boolean;
  fillOpacity: number;
}

export interface BollingerBandsResult {
  timestamp: string;
  basis: number | null;
  upper: number | null;
  lower: number | null;
}
