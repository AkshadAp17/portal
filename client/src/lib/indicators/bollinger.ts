import { OHLCV, BollingerBandsSettings, BollingerBandsResult } from '@/lib/types';

/**
 * Simple Moving Average calculation
 */
function calculateSMA(values: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += values[j];
      }
      result.push(sum / period);
    }
  }
  
  return result;
}

/**
 * Standard deviation calculation (population standard deviation)
 */
function calculateStandardDeviation(values: number[], period: number, smaValues: number[]): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1 || isNaN(smaValues[i])) {
      result.push(NaN);
    } else {
      let variance = 0;
      const mean = smaValues[i];
      
      for (let j = i - period + 1; j <= i; j++) {
        variance += Math.pow(values[j] - mean, 2);
      }
      
      // Using population standard deviation (dividing by N, not N-1)
      const stdDev = Math.sqrt(variance / period);
      result.push(stdDev);
    }
  }
  
  return result;
}

/**
 * Get source values from OHLCV data based on source type
 */
function getSourceValues(data: OHLCV[], source: string): number[] {
  return data.map(candle => {
    switch (source) {
      case 'open':
        return candle.open;
      case 'high':
        return candle.high;
      case 'low':
        return candle.low;
      case 'close':
        return candle.close;
      case 'hl2':
        return (candle.high + candle.low) / 2;
      case 'hlc3':
        return (candle.high + candle.low + candle.close) / 3;
      case 'ohlc4':
        return (candle.open + candle.high + candle.low + candle.close) / 4;
      default:
        return candle.close;
    }
  });
}

/**
 * Apply offset to a data series
 */
function applyOffset<T>(data: T[], offset: number): T[] {
  if (offset === 0) return data;
  
  const result = new Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    const sourceIndex = i - offset;
    if (sourceIndex >= 0 && sourceIndex < data.length) {
      result[i] = data[sourceIndex];
    } else {
      result[i] = null;
    }
  }
  
  return result;
}

/**
 * Compute Bollinger Bands for given OHLCV data and settings
 * 
 * Formula:
 * - Basis (middle band) = SMA(source, length)
 * - StdDev = standard deviation of the last length values of source (population standard deviation)
 * - Upper = Basis + (StdDev multiplier * StdDev)
 * - Lower = Basis - (StdDev multiplier * StdDev)
 * - Offset: shift the three series by offset bars on the chart
 */
export function computeBollingerBands(
  data: OHLCV[], 
  settings: BollingerBandsSettings
): BollingerBandsResult[] {
  if (data.length === 0) return [];
  
  const { length, source, stddev: multiplier, offset } = settings;
  
  // Get source values
  const sourceValues = getSourceValues(data, source);
  
  // Calculate SMA (basis)
  const basisValues = calculateSMA(sourceValues, length);
  
  // Calculate standard deviation
  const stdDevValues = calculateStandardDeviation(sourceValues, length, basisValues);
  
  // Calculate upper and lower bands
  const upperValues = basisValues.map((basis, i) => 
    isNaN(basis) || isNaN(stdDevValues[i]) ? NaN : basis + (multiplier * stdDevValues[i])
  );
  
  const lowerValues = basisValues.map((basis, i) => 
    isNaN(basis) || isNaN(stdDevValues[i]) ? NaN : basis - (multiplier * stdDevValues[i])
  );
  
  // Apply offset if specified
  const finalBasis = applyOffset(basisValues, offset);
  const finalUpper = applyOffset(upperValues, offset);
  const finalLower = applyOffset(lowerValues, offset);
  
  // Combine into result format
  const result: BollingerBandsResult[] = data.map((candle, i) => ({
    timestamp: candle.timestamp,
    basis: finalBasis[i],
    upper: finalUpper[i],
    lower: finalLower[i],
  }));
  
  return result;
}
