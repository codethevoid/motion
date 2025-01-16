import { ColorType, createChart, CrosshairMode, LineStyle } from "lightweight-charts";
import { useAggregates } from "@/hooks/use-aggregates";
import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Timespan } from "@/app/api/aggregates/route";
import { useXrpPrice } from "@/hooks/use-xrp-price";
import { Loader } from "lucide-react";

type LineChartProps = {
  currency: string;
  issuer: string;
  range: Timespan;
};

export const CandleChart = ({ currency, issuer, range }: LineChartProps) => {
  const { data, isLoading } = useAggregates(currency, issuer, range);
  const { data: xrpPrice } = useXrpPrice();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  console.log("chart data", data);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    const chart = createChart(containerRef.current);
    // const areaSeries = chart.addAreaSeries({
    //   lineColor: "#ffffff",
    //   // lineColor: data[0].value > data[data.length - 1]?.value ? "#00FF00" : "#FF0000",
    //   topColor: "rgba(255, 255, 255, 0.3)",
    //   bottomColor: "rgba(255, 255, 255, 0.05)",
    //   lineWidth: 2,
    //   priceLineVisible: false,
    // });
    const areaSeries = chart.addCandlestickSeries({
      upColor: "#26a69a", // Green color for up candles
      downColor: "#ef5350", // Red color for down candles
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a", // Wick colors
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 8,
        minMove: 0.00000001,
      },
    });

    const dataArray = data.candles;
    console.log("dataArray", dataArray);
    areaSeries.setData(dataArray);
    chart.applyOptions({
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#A1A1AA",
      },

      rightPriceScale: {
        // visible: false,
        borderColor: "#27272A",
      },
      timeScale: {
        borderColor: "#27272A",
        // fixLeftEdge: true,
        // fixRightEdge: true,
        rightBarStaysOnScroll: true,
        rightOffset: 10,
        barSpacing: 3,
        timeVisible: range === "1d" || range === "1w" || range === "1m",
        secondsVisible: false,
        allowBoldLabels: false,
        tickMarkFormatter: (time: number) => {
          return format(
            new Date(time * 1000),
            range === "1h" || range === "1d" ? "h:mm a" : "MMM d",
          );
        },
      },
      localization: {
        priceFormatter: (price: number) => {
          if (price >= 1) {
            return price.toFixed(2); // 1.23
          } else if (price >= 0.01) {
            return price.toFixed(4); // 0.1234
          } else if (price >= 0.0001) {
            return price.toFixed(6); // 0.000123
          } else {
            return price.toFixed(8); // 0.00001234
          }
        },
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false, color: "#27272A" } },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          labelVisible: true,
          labelBackgroundColor: "#27272a",
          color: "rgba(255, 255, 255, 0.2)",
          style: LineStyle.Dashed,
        },
        horzLine: {
          visible: true,
          labelBackgroundColor: "#27272a",

          color: "rgba(255, 255, 255, 0.2)",
          style: LineStyle.Dashed,
        },
      },
    });
    // chart.subscribeCrosshairMove((param) => {
    //   if (param.time && tooltipRef.current && param.point && containerRef.current) {
    //     const price = param.seriesData.get(areaSeries) as { value: number; time: number };
    //     // const formattedPrice = (price.value * (xrpPrice || 0)).toLocaleString("en-us", {
    //     //   style: "currency",
    //     //   currency: "USD",
    //     //   minimumFractionDigits: 2,
    //     //   maximumFractionDigits: 6,
    //     // });
    //     const formattedPrice = `${price.value.toLocaleString("en-us", {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 6,
    //     })} XRP`;

    //     const tooltipWidth = tooltipRef.current.offsetWidth;
    //     const containerWidth = containerRef.current.offsetWidth;

    //     // Constrain to container bounds
    //     const x = Math.min(
    //       Math.max(tooltipWidth / 2, param.point.x),
    //       containerWidth - tooltipWidth / 2,
    //     );

    //     tooltipRef.current.style.display = "block";
    //     tooltipRef.current.style.left = `${x}px`;
    //     tooltipRef.current.style.transform = `translateX(-50%)`;
    //     tooltipRef.current.innerHTML = `<p>${formattedPrice}</p><p class="text-muted-foreground text-nowrap">${format(new Date(price.time * 1000), "MMM d yyyy hh:mm a")}</p>`;
    //   } else {
    //     if (tooltipRef.current) {
    //       tooltipRef.current.innerHTML = "";
    //       tooltipRef.current.style.display = "none";
    //     }
    //   }
    // });

    return () => chart.remove();
  }, [data, containerRef]);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="flex h-full w-full items-center justify-center">
          <Loader className="size-4 animate-spin" />
        </div>
      )}
      {data && xrpPrice && (
        <>
          <div ref={containerRef} className="h-full w-full" />
          <div
            ref={tooltipRef}
            className="pointer-events-none absolute top-0 z-10 hidden rounded-md border border-border/80 bg-secondary/40 px-2 py-1 text-center text-xs backdrop-blur-sm"
          />
        </>
      )}
    </div>
  );
};
