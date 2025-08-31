import { useEffect, useRef } from 'react';
import { init, dispose, registerIndicator } from 'klinecharts';
import { OHLCV, BollingerBandsSettings } from '@/lib/types';

interface ChartProps {
  data: OHLCV[];
  bollingerData: any[];
  settings: BollingerBandsSettings;
}

export default function Chart({ data, bollingerData, settings }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Register custom Bollinger Bands indicator
    registerIndicator({
      name: 'BollingerBands',
      shortName: 'BOLL',
      precision: 2,
      calcParams: [20, 2],
      styles: {
        lines: [
          {
            key: 'up',
            title: 'Upper',
            color: settings.upperColor,
            size: settings.upperWidth,
            style: settings.upperStyle === 'dashed' ? 'dashed' : 'solid',
            show: settings.upperVisible,
          },
          {
            key: 'mid',
            title: 'Basis',
            color: settings.basicColor,
            size: settings.basicWidth,
            style: settings.basicStyle === 'dashed' ? 'dashed' : 'solid',
            show: settings.basicVisible,
          },
          {
            key: 'dn',
            title: 'Lower',
            color: settings.lowerColor,
            size: settings.lowerWidth,
            style: settings.lowerStyle === 'dashed' ? 'dashed' : 'solid',
            show: settings.lowerVisible,
          },
        ],
        areas: settings.fillVisible ? [
          {
            key: 'upDn',
            color: `${settings.upperColor}${Math.round((settings.fillOpacity / 100) * 255).toString(16).padStart(2, '0')}`,
          },
        ] : [],
      },
      calc: (dataList: any[], { params }: any) => {
        const [length, multiplier] = params;
        const offset = settings.offset || 0;
        const sourceKey = settings.source || 'close';
        const result: any[] = [];
        
        // Get source values based on selected source
        const getSourceValue = (candle: any) => {
          switch (sourceKey) {
            case 'open': return candle.open;
            case 'high': return candle.high;
            case 'low': return candle.low;
            case 'close': return candle.close;
            case 'hl2': return (candle.high + candle.low) / 2;
            case 'hlc3': return (candle.high + candle.low + candle.close) / 3;
            case 'ohlc4': return (candle.open + candle.high + candle.low + candle.close) / 4;
            default: return candle.close;
          }
        };
        
        for (let i = 0; i < dataList.length; i++) {
          if (i < length - 1) {
            result.push({ up: null, mid: null, dn: null });
            continue;
          }
          
          // Calculate SMA (basis) using selected source
          let sum = 0;
          for (let j = i - length + 1; j <= i; j++) {
            sum += getSourceValue(dataList[j]);
          }
          const basis = sum / length;
          
          // Calculate standard deviation (population)
          let variance = 0;
          for (let j = i - length + 1; j <= i; j++) {
            variance += Math.pow(getSourceValue(dataList[j]) - basis, 2);
          }
          const stdDev = Math.sqrt(variance / length);
          
          // Calculate bands
          const upper = basis + (multiplier * stdDev);
          const lower = basis - (multiplier * stdDev);
          
          result.push({
            up: upper,
            mid: basis,
            dn: lower,
          });
        }
        
        // Apply offset if specified
        if (offset !== 0) {
          const offsetResult = new Array(result.length);
          for (let i = 0; i < result.length; i++) {
            const sourceIndex = i - offset;
            if (sourceIndex >= 0 && sourceIndex < result.length) {
              offsetResult[i] = result[sourceIndex];
            } else {
              offsetResult[i] = { up: null, mid: null, dn: null };
            }
          }
          return offsetResult;
        }
        
        return result;
      },
      regenerateFigures: () => [],
      createTooltipDataSource: ({ indicator }: any) => {
        return {
          name: 'BOLL',
          calcParamsText: `(${settings.length}, ${settings.stddev})`,
          legends: [
            {
              title: 'Upper: ',
              value: indicator.up ? indicator.up.toFixed(2) : '--',
              color: settings.upperColor,
            },
            {
              title: 'Basis: ',
              value: indicator.mid ? indicator.mid.toFixed(2) : '--',
              color: settings.basicColor,
            },
            {
              title: 'Lower: ',
              value: indicator.dn ? indicator.dn.toFixed(2) : '--',
              color: settings.lowerColor,
            },
          ],
        };
      },
    });

    // Initialize chart
    chartInstance.current = init(chartRef.current);

    // Add Bollinger Bands indicator
    chartInstance.current.createIndicator({
      name: 'BollingerBands',
      calcParams: [settings.length, settings.stddev],
    });

    return () => {
      if (chartInstance.current) {
        dispose(chartRef.current!);
        chartInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstance.current && data.length > 0) {
      // Convert OHLCV data to KLineCharts format
      const klineData = data.map(item => ({
        timestamp: new Date(item.timestamp).getTime(),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));
      
      chartInstance.current.applyNewData(klineData);
    }
  }, [data]);

  useEffect(() => {
    if (chartInstance.current) {
      // Remove existing indicator
      chartInstance.current.removeIndicator('BollingerBands');
      
      // Re-register with updated settings
      registerIndicator({
        name: 'BollingerBands',
        shortName: 'BOLL',
        precision: 2,
        calcParams: [settings.length, settings.stddev],
        styles: {
          lines: [
            {
              key: 'up',
              title: 'Upper',
              color: settings.upperColor,
              size: settings.upperWidth,
              style: settings.upperStyle === 'dashed' ? 'dashed' : 'solid',
              show: settings.upperVisible,
            },
            {
              key: 'mid',
              title: 'Basis',
              color: settings.basicColor,
              size: settings.basicWidth,
              style: settings.basicStyle === 'dashed' ? 'dashed' : 'solid',
              show: settings.basicVisible,
            },
            {
              key: 'dn',
              title: 'Lower',
              color: settings.lowerColor,
              size: settings.lowerWidth,
              style: settings.lowerStyle === 'dashed' ? 'dashed' : 'solid',
              show: settings.lowerVisible,
            },
          ],
          areas: settings.fillVisible ? [
            {
              key: 'upDn',
              color: `${settings.upperColor}${Math.round((settings.fillOpacity / 100) * 255).toString(16).padStart(2, '0')}`,
            },
          ] : [],
        },
        calc: (dataList: any[], { params }: any) => {
          const [length, multiplier] = params;
          const offset = settings.offset || 0;
          const sourceKey = settings.source || 'close';
          const result: any[] = [];
          
          const getSourceValue = (candle: any) => {
            switch (sourceKey) {
              case 'open': return candle.open;
              case 'high': return candle.high;
              case 'low': return candle.low;
              case 'close': return candle.close;
              case 'hl2': return (candle.high + candle.low) / 2;
              case 'hlc3': return (candle.high + candle.low + candle.close) / 3;
              case 'ohlc4': return (candle.open + candle.high + candle.low + candle.close) / 4;
              default: return candle.close;
            }
          };
          
          for (let i = 0; i < dataList.length; i++) {
            if (i < length - 1) {
              result.push({ up: null, mid: null, dn: null });
              continue;
            }
            
            let sum = 0;
            for (let j = i - length + 1; j <= i; j++) {
              sum += getSourceValue(dataList[j]);
            }
            const basis = sum / length;
            
            let variance = 0;
            for (let j = i - length + 1; j <= i; j++) {
              variance += Math.pow(getSourceValue(dataList[j]) - basis, 2);
            }
            const stdDev = Math.sqrt(variance / length);
            
            const upper = basis + (multiplier * stdDev);
            const lower = basis - (multiplier * stdDev);
            
            result.push({ up: upper, mid: basis, dn: lower });
          }
          
          if (offset !== 0) {
            const offsetResult = new Array(result.length);
            for (let i = 0; i < result.length; i++) {
              const sourceIndex = i - offset;
              if (sourceIndex >= 0 && sourceIndex < result.length) {
                offsetResult[i] = result[sourceIndex];
              } else {
                offsetResult[i] = { up: null, mid: null, dn: null };
              }
            }
            return offsetResult;
          }
          
          return result;
        },
        createTooltipDataSource: ({ indicator }: any) => {
          return {
            name: 'BOLL',
            calcParamsText: `(${settings.length}, ${settings.stddev})`,
            legends: [
              {
                title: 'Upper: ',
                value: indicator.up ? indicator.up.toFixed(2) : '--',
                color: settings.upperColor,
              },
              {
                title: 'Basis: ',
                value: indicator.mid ? indicator.mid.toFixed(2) : '--',
                color: settings.basicColor,
              },
              {
                title: 'Lower: ',
                value: indicator.dn ? indicator.dn.toFixed(2) : '--',
                color: settings.lowerColor,
              },
            ],
          };
        },
      });
      
      // Add the indicator back
      chartInstance.current.createIndicator({
        name: 'BollingerBands',
        calcParams: [settings.length, settings.stddev],
      });
    }
  }, [settings]);

  return <div ref={chartRef} className="w-full h-full" data-testid="container-kline-chart" />;
}
