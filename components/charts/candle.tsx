import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface Candlestick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandleChartProps {
  candlesticks: Candlestick[];
  height?: number;
}

export function CandleChart({ candlesticks, height = 500 }: CandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart with TradingView-like styling
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {type: ColorType.Solid, color: '#000000'},
        textColor: '#333',
      },
      // grid: {
      //   vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
      //   horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
      // },
      // rightPriceScale: {
      //   borderVisible: false,
      // },
      // timeScale: {
      //   borderVisible: false,
      //   timeVisible: true,
      //   secondsVisible: false,
      // },
      // crosshair: {
      //   mode: 1,
      //   vertLine: {
      //     width: 1,
      //     color: 'rgba(42, 46, 57, 0.5)',
      //     style: 1,
      //   },
      //   horzLine: {
      //     width: 1,
      //     color: 'rgba(42, 46, 57, 0.5)',
      //     style: 1,
      //   },
      // },
      // width: chartContainerRef.current.clientWidth,
      height: 250,
      width: chartContainerRef.current.clientWidth
    });

    // Create candlestick series with TradingView-like styling
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Format data for the chart
    const formattedData = candlesticks.map(stick => ({
      time: (stick.time as number) as UTCTimestamp,
      open: stick.open,
      high: stick.high,
      low: stick.low,
      close: stick.close,
    }));

    // Set the data
    candlestickSeries.setData(formattedData);

    // Add volume series below the candlesticks
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as an overlay
    });

    // Set the margins after creation
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
    
        bottom: 0,
      },
    });

    // Fit content and add margin
    chart.timeScale().fitContent();

    // Store refs for cleanup
    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Cleanup
    return () => {
      chart.remove();
    };
  }, [candlesticks, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="tradingview-wrapper">
      <div ref={chartContainerRef} />
      {/* <style jsx>{`
        .tradingview-wrapper {
          border-radius: 8px;
          border: 1px solid #e0e3eb;
          overflow: hidden;
        }
      `}</style> */}
    </div>
  );
}
