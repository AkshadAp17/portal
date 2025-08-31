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
      series: 'normal',
      precision: 2,
      calcParams: [20, 2],
      shouldOhlc: false,
      shouldFormatBigNumber: false,
      visible: true,
      zLevel: 0,
      styles: {
        lines: [
          {
            key: 'up',
            title: 'Upper',
            type: 'line',
            baseValue: 0,
            color: '#2962ff',
            size: 1,
            style: 1,
            smooth: false,
            show: true,
          },
          {
            key: 'mid',
            title: 'Basis',
            type: 'line',
            baseValue: 0,
            color: '#f7c52d',
            size: 1,
            style: 1,
            smooth: false,
            show: true,
          },
          {
            key: 'dn',
            title: 'Lower',
            type: 'line',
            baseValue: 0,
            color: '#c84bc7',
            size: 1,
            style: 1,
            smooth: false,
            show: true,
          },
        ],
      },
      calc: (dataList: any[], { params }: any) => {
        const [length, multiplier] = params;
        const result: any[] = [];
        
        for (let i = 0; i < dataList.length; i++) {
          if (i < length - 1) {
            result.push({ up: null, mid: null, dn: null });
            continue;
          }
          
          // Calculate SMA (basis)
          let sum = 0;
          for (let j = i - length + 1; j <= i; j++) {
            sum += dataList[j].close;
          }
          const basis = sum / length;
          
          // Calculate standard deviation
          let variance = 0;
          for (let j = i - length + 1; j <= i; j++) {
            variance += Math.pow(dataList[j].close - basis, 2);
          }
          const stdDev = Math.sqrt(variance / length); // Population standard deviation
          
          // Calculate bands
          const upper = basis + (multiplier * stdDev);
          const lower = basis - (multiplier * stdDev);
          
          result.push({
            up: upper,
            mid: basis,
            dn: lower,
          });
        }
        
        return result;
      },
      regenerateFigures: () => [],
      createTooltipDataSource: ({ indicator }: any) => {
        const tooltipData: any[] = [];
        
        tooltipData.push({
          title: 'Upper: ',
          value: indicator.up,
          color: '#2962ff',
        });
        
        tooltipData.push({
          title: 'Basis: ',
          value: indicator.mid,
          color: '#f7c52d',
        });
        
        tooltipData.push({
          title: 'Lower: ',
          value: indicator.dn,
          color: '#c84bc7',
        });
        
        return tooltipData;
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
      // Update indicator parameters when settings change
      chartInstance.current.overrideIndicator({
        name: 'BollingerBands',
        calcParams: [settings.length, settings.stddev],
      });
    }
  }, [settings]);

  return <div ref={chartRef} className="w-full h-full" data-testid="container-kline-chart" />;
}
