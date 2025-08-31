import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Chart from "@/components/Chart";
import BollingerSettings from "@/components/BollingerSettings";
import { BollingerBandsSettings, OHLCV } from "@/lib/types";
import demoData from "@/data/demo-ohlcv.json";
import { computeBollingerBands } from "@/lib/indicators/bollinger";
import { useToast } from "@/hooks/use-toast";
import { Download, TrendingUp, Settings, Upload, Plus, X, Bell } from "lucide-react";

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
  const [uploadedData, setUploadedData] = useState<OHLCV[] | null>(null);
  const [bollingerData, setBollingerData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(true);
  const { toast } = useToast();

  // CSV file upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim().length > 0);
          
          if (lines.length < 2) {
            alert('CSV file must contain at least a header row and one data row.');
            return;
          }
          
          const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
          
          // Check if this looks like OHLCV data
          const hasOHLCV = ['open', 'high', 'low', 'close', 'volume'].some(field => 
            headers.some(h => h.includes(field))
          );
          
          if (!hasOHLCV) {
            alert(`This CSV format is not supported. Please use OHLCV format with columns:\n\n- timestamp/date\n- open\n- high\n- low\n- close\n- volume\n\nYour file has columns: ${headers.join(', ')}`);
            return;
          }
          
          // Find column indices
          const getColumnIndex = (possibleNames: string[]) => {
            for (const name of possibleNames) {
              const index = headers.findIndex(h => h.includes(name));
              if (index !== -1) return index;
            }
            return -1;
          };
          
          const timestampIndex = getColumnIndex(['timestamp', 'date', 'time']);
          const openIndex = getColumnIndex(['open']);
          const highIndex = getColumnIndex(['high']);
          const lowIndex = getColumnIndex(['low']);
          const closeIndex = getColumnIndex(['close']);
          const volumeIndex = getColumnIndex(['volume', 'vol']);
          
          if (openIndex === -1 || highIndex === -1 || lowIndex === -1 || closeIndex === -1) {
            alert('CSV must contain Open, High, Low, and Close price columns.');
            return;
          }
          
          const parsedData: OHLCV[] = [];
          let validRows = 0;
          
          for (let i = 1; i < lines.length && i <= 1001; i++) { // Limit to 1000 rows + header
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length >= Math.max(openIndex, highIndex, lowIndex, closeIndex) + 1) {
              try {
                const timestamp = timestampIndex >= 0 ? values[timestampIndex] : `2024-01-${String(i).padStart(2, '0')}T00:00:00Z`;
                const open = parseFloat(values[openIndex]);
                const high = parseFloat(values[highIndex]);
                const low = parseFloat(values[lowIndex]);
                const close = parseFloat(values[closeIndex]);
                const volume = volumeIndex >= 0 ? parseFloat(values[volumeIndex]) : 1000000;
                
                if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close) && open > 0 && high > 0 && low > 0 && close > 0) {
                  parsedData.push({
                    timestamp,
                    open,
                    high,
                    low,
                    close,
                    volume: isNaN(volume) ? 1000000 : volume
                  });
                  validRows++;
                }
              } catch (error) {
                console.warn('Skipping invalid row:', values);
              }
            }
          }
          
          if (validRows > 0) {
            setUploadedData(parsedData);
            alert(`Successfully loaded ${validRows} data points from your CSV file!`);
          } else {
            alert('No valid OHLCV data found. Please ensure your CSV has numeric Open, High, Low, Close prices.');
          }
        } catch (error) {
          alert('Error reading CSV file. Please check the file format and try again.');
          console.error('CSV parsing error:', error);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file (.csv extension required).');
    }
    
    // Clear the input so the same file can be uploaded again
    event.target.value = '';
  };

  useEffect(() => {
    // Load demo data if no uploaded data
    const data = uploadedData || (demoData as OHLCV[]);
    setChartData(data);
    
    if (data.length > 0) {
      const latest = data[data.length - 1];
      const previous = data[data.length - 2];
      setCurrentPrice(latest.close);
      const change = latest.close - previous.close;
      setPriceChange(change);
      setPriceChangePercent((change / previous.close) * 100);
      
      // Show welcome notification on first load
      if (!uploadedData) {
        toast({
          title: "Welcome to FindScan! 📈",
          description: "Demo data loaded with Bollinger Bands indicator. Upload your CSV file or explore the current chart.",
        });
      }
    }
  }, [uploadedData, toast]);

  useEffect(() => {
    if (chartData.length > 0) {
      const bands = computeBollingerBands(chartData, bollingerSettings);
      setBollingerData(bands);
    }
  }, [chartData, bollingerSettings]);

  const currentBands = bollingerData.length > 0 ? bollingerData[bollingerData.length - 1] : null;

  // Download indicator data function
  const downloadIndicatorData = () => {
    if (bollingerData.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please load chart data first to download indicator values.",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Timestamp', 'Open', 'High', 'Low', 'Close', 'Volume', 'Upper Band', 'Basis', 'Lower Band'].join(','),
      ...chartData.map((candle, index) => {
        const bands = bollingerData[index] || { upper: '', basis: '', lower: '' };
        return [
          candle.timestamp,
          candle.open,
          candle.high,
          candle.low,
          candle.close,
          candle.volume,
          bands.upper ? bands.upper.toFixed(2) : '',
          bands.basis ? bands.basis.toFixed(2) : '',
          bands.lower ? bands.lower.toFixed(2) : ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bollinger_bands_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Complete! 📄",
      description: "Bollinger Bands data exported successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-card via-card to-muted/30 border-b border-border/60 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-app-title">
                  FindScan
                  <span className="text-sm font-normal text-muted-foreground ml-2">Pro</span>
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-background/50">
                  <span className={`font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-symbol">NIFTY50</span>
                </Badge>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-mono text-foreground" data-testid="text-current-price">₹{currentPrice.toFixed(2)}</span>
                  <Badge variant={priceChange >= 0 ? "default" : "destructive"} className={priceChange >= 0 ? 'bg-green-100 text-green-800' : ''}>
                    <span data-testid="text-price-change">
                      {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                data-testid="input-csv-upload"
              />
              <Button 
                onClick={() => document.getElementById('csv-upload')?.click()}
                variant="outline"
                className="hover-primary-light"
                data-testid="button-upload-csv"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
              <Button 
                onClick={downloadIndicatorData}
                variant="outline"
                className="hover-green-light hover:text-green-700 hover:border-green-200"
                data-testid="button-download-data"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                onClick={() => setShowSettings(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                data-testid="button-add-indicator"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Indicator
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Welcome Alert */}
        {showWelcomeAlert && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Bell className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-foreground">
                  📈 <strong>Live Bollinger Bands Analysis</strong> - Monitor real-time price movements with advanced technical indicators. 
                  Upload your data or explore the demo chart below.
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowWelcomeAlert(false)}
                className="h-auto p-1 hover-primary-light"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Enhanced Chart Section */}
        <Card className="chart-container rounded-xl p-6 mb-6 shadow-sm border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-chart-title">NIFTY50 Analysis</h2>
                <p className="text-sm text-muted-foreground mt-1">Real-time technical analysis with Bollinger Bands</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Timeframe:</span>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-24 h-9" data-testid="select-timeframe">
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
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="px-3 py-1 bg-primary/10 border-primary/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium" data-testid="text-indicator-name">Bollinger Bands Active</span>
              </Badge>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 hover-primary-light"
                  onClick={() => setShowSettings(true)}
                  data-testid="button-open-settings"
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 text-muted-foreground hover:text-destructive hover-destructive-light"
                  data-testid="button-remove-indicator"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Chart Component */}
          <div className="relative h-[500px] bg-background border border-border/30 rounded-lg overflow-hidden shadow-inner" data-testid="container-chart">
            <Chart 
              data={chartData}
              bollingerData={bollingerData}
              settings={bollingerSettings}
            />
          </div>
        </Card>

        {/* Enhanced Info Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground" data-testid="text-settings-title">Indicator Settings</h3>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Length:</span>
                <Badge variant="outline" data-testid="text-setting-length">{bollingerSettings.length}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Source:</span>
                <Badge variant="outline" data-testid="text-setting-source">{bollingerSettings.source.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">StdDev:</span>
                <Badge variant="outline" data-testid="text-setting-stddev">{bollingerSettings.stddev}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Offset:</span>
                <Badge variant="outline" data-testid="text-setting-offset">{bollingerSettings.offset}</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground" data-testid="text-performance-title">Chart Info</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Data Points:</span>
                <Badge variant="secondary" data-testid="text-candle-count">{chartData.length.toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Timeframe:</span>
                <Badge variant="secondary" data-testid="text-timeframe">{timeframe}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Render Time:</span>
                <Badge variant="secondary" className="text-green-600" data-testid="text-update-time">~2ms</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground" data-testid="text-band-values-title">Current Values</h3>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Upper Band:</span>
                <span 
                  className="font-mono font-semibold px-2 py-1 rounded text-xs" 
                  style={{ color: bollingerSettings.upperColor, backgroundColor: `${bollingerSettings.upperColor}15` }}
                  data-testid="text-upper-value"
                >
                  {currentBands ? `₹${currentBands.upper.toFixed(2)}` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Basis Line:</span>
                <span 
                  className="font-mono font-semibold px-2 py-1 rounded text-xs" 
                  style={{ color: bollingerSettings.basicColor, backgroundColor: `${bollingerSettings.basicColor}15` }}
                  data-testid="text-basis-value"
                >
                  {currentBands ? `₹${currentBands.basis.toFixed(2)}` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">Lower Band:</span>
                <span 
                  className="font-mono font-semibold px-2 py-1 rounded text-xs" 
                  style={{ color: bollingerSettings.lowerColor, backgroundColor: `${bollingerSettings.lowerColor}15` }}
                  data-testid="text-lower-value"
                >
                  {currentBands ? `₹${currentBands.lower.toFixed(2)}` : '-'}
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
