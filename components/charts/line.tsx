import { ColorType, createChart, CrosshairMode, LineStyle } from "lightweight-charts";
import { useAggregates } from "@/hooks/use-aggregates";
import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Timespan } from "@/app/api/aggregates/route";
import { useXrpPrice } from "@/hooks/use-xrp-price";
import { Skeleton } from "../ui/skeleton";
import { Loader } from "lucide-react";

type LineChartProps = {
  currency: string;
  issuer: string;
  range: Timespan;
};

export const LineChart = ({ currency, issuer, range }: LineChartProps) => {
  const { data, isLoading } = useAggregates(currency, issuer, range);
  const { data: xrpPrice } = useXrpPrice();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    const chart = createChart(containerRef.current);
    const areaSeries = chart.addAreaSeries({
      lineColor: "#ffffff",
      // lineColor: data[0].value > data[data.length - 1]?.value ? "#00FF00" : "#FF0000",
      topColor: "rgba(255, 255, 255, 0.3)",
      bottomColor: "rgba(255, 255, 255, 0.05)",
      lineWidth: 2,
      priceLineVisible: false,
    });
    const dataArray = Object.values(data).map((point) => ({
      time: (point as any).time,
      value: parseFloat((point as any).value),
    }));
    areaSeries.setData(dataArray);
    chart.applyOptions({
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#A1A1AA",
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        borderColor: "#27272A",
        fixLeftEdge: true,
        fixRightEdge: true,
        barSpacing: 0,
        timeVisible: true,
        allowBoldLabels: false,
        tickMarkFormatter: (time: number) => {
          return format(
            new Date(time * 1000),
            range === "1h" || range === "1d" ? "h:mm a" : "MMM d",
          );
        },
      },
      localization: { priceFormatter: (price: number) => price.toFixed(2) },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          labelVisible: false,
          color: "rgba(255, 255, 255, 0.2)",
          style: LineStyle.Dashed,
        },
        horzLine: {
          visible: false,
          color: "rgba(255, 255, 255, 0.2)",
          style: LineStyle.Dashed,
        },
      },
    });
    chart.subscribeCrosshairMove((param) => {
      if (param.time && tooltipRef.current && param.point && containerRef.current) {
        const price = param.seriesData.get(areaSeries) as { value: number; time: number };
        const formattedPrice = (price.value * (xrpPrice || 0)).toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });

        const tooltipWidth = tooltipRef.current.offsetWidth;
        const containerWidth = containerRef.current.offsetWidth;

        // Constrain to container bounds
        const x = Math.min(
          Math.max(tooltipWidth / 2, param.point.x),
          containerWidth - tooltipWidth / 2,
        );

        tooltipRef.current.style.display = "block";
        tooltipRef.current.style.left = `${x}px`;
        tooltipRef.current.style.transform = `translateX(-50%)`;
        tooltipRef.current.innerHTML = `<p>${formattedPrice}</p><p class="text-muted-foreground text-nowrap">${format(new Date(price.time * 1000), "MMM d yyyy hh:mm a")}</p>`;
      } else {
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = "";
          tooltipRef.current.style.display = "none";
        }
      }
    });

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
