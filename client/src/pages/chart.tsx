import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Chart from "@/components/Chart";
import BollingerSettings from "@/components/BollingerSettings";
import { BollingerBandsSettings, OHLCV } from "@/lib/types";
import demoData from "@/data/demo-ohlcv.json";
import { computeBollingerBands } from "@/lib/indicators/bollinger";

export default function ChartPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [bollingerSettings, setBollingerSettings] = useState<BollingerBandsSettings>({
    // Inputs
    length: 20,
    maType: 'sma',
    source: 'close',
    stddev: 2,
    offset: 0,
    // Style
    basicVisible: true,
    basicColor: '#f7c52d',
    basicWidth: 1,
    basicStyle: 'solid',
    upperVisible: true,
    upperColor: '#2962ff',
    upperWidth: 1,
    upperStyle: 'solid',
    lowerVisible: true,
    lowerColor: '#c84bc7',
    lowerWidth: 1,
    lowerStyle: 'solid',
    fillVisible: true,
    fillOpacity: 10
  });

  const [chartData, setChartData] = useState<OHLCV[]>([]);
  const [bollingerData, setBollingerData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  useEffect(() => {
    // Load demo data
    const data = demoData as OHLCV[];
    setChartData(data);
    
    if (data.length > 0) {
      const latest = data[data.length - 1];
      const previous = data[data.length - 2];
      setCurrentPrice(latest.close);
      const change = latest.close - previous.close;
      setPriceChange(change);
      setPriceChangePercent((change / previous.close) * 100);
    }
  }, []);

  useEffect(() => {
    if (chartData.length > 0) {
      const bands = computeBollingerBands(chartData, bollingerSettings);
      setBollingerData(bands);
    }
  }, [chartData, bollingerSettings]);

  const currentBands = bollingerData.length > 0 ? bollingerData[bollingerData.length - 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">FindScan</h1>
            <div className="text-sm text-muted-foreground">
              <span className={`${priceChange >= 0 ? 'text-bullish' : 'text-bearish'}`} data-testid="text-symbol">BTCUSD</span>
              <span className="ml-2" data-testid="text-current-price">${currentPrice.toFixed(2)}</span>
              <span className={`ml-2 ${priceChange >= 0 ? 'text-bullish' : 'text-bearish'}`} data-testid="text-price-change">
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setShowSettings(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="button-add-indicator"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Indicator
            </Button>
            <Button variant="secondary" size="sm" data-testid="button-settings">
              <i className="fas fa-cog"></i>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Chart Section */}
        <Card className="chart-container rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold" data-testid="text-chart-title">BTCUSD Chart</h2>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-20" data-testid="select-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1D</SelectItem>
                  <SelectItem value="4H">4H</SelectItem>
                  <SelectItem value="1H">1H</SelectItem>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="1m">1m</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-secondary rounded px-3 py-1">
                <span className="text-xs text-muted-foreground" data-testid="text-indicator-name">Bollinger Bands</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                  onClick={() => setShowSettings(true)}
                  data-testid="button-open-settings"
                >
                  <i className="fas fa-cog"></i>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                  data-testid="button-remove-indicator"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Chart Component */}
          <div className="relative h-96 bg-background border border-border rounded-md" data-testid="container-chart">
            <Chart 
              data={chartData}
              bollingerData={bollingerData}
              settings={bollingerSettings}
            />
          </div>
        </Card>

        {/* Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2" data-testid="text-settings-title">Current Settings</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Length:</span>
                <span data-testid="text-setting-length">{bollingerSettings.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Source:</span>
                <span data-testid="text-setting-source">{bollingerSettings.source}</span>
              </div>
              <div className="flex justify-between">
                <span>StdDev:</span>
                <span data-testid="text-setting-stddev">{bollingerSettings.stddev}</span>
              </div>
              <div className="flex justify-between">
                <span>Offset:</span>
                <span data-testid="text-setting-offset">{bollingerSettings.offset}</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2" data-testid="text-performance-title">Performance</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Candles:</span>
                <span data-testid="text-candle-count">{chartData.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeframe:</span>
                <span data-testid="text-timeframe">{timeframe}</span>
              </div>
              <div className="flex justify-between">
                <span>Update Time:</span>
                <span data-testid="text-update-time">~2ms</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2" data-testid="text-band-values-title">Band Values</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span>Upper:</span>
                <span 
                  className="text-xs font-mono" 
                  style={{ color: bollingerSettings.upperColor }}
                  data-testid="text-upper-value"
                >
                  {currentBands ? `$${currentBands.upper.toFixed(2)}` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Basis:</span>
                <span 
                  className="text-xs font-mono" 
                  style={{ color: bollingerSettings.basicColor }}
                  data-testid="text-basis-value"
                >
                  {currentBands ? `$${currentBands.basis.toFixed(2)}` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Lower:</span>
                <span 
                  className="text-xs font-mono" 
                  style={{ color: bollingerSettings.lowerColor }}
                  data-testid="text-lower-value"
                >
                  {currentBands ? `$${currentBands.lower.toFixed(2)}` : '-'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <BollingerSettings
          settings={bollingerSettings}
          onSettingsChange={setBollingerSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
