"use client";
import { ChartComponentProps } from "@/types/chart";
import { ColorType, createChart, ISeriesApi } from "lightweight-charts";
import { IChartApi } from "lightweight-charts";
import { useEffect, useRef } from "react";

export const Chart: React.FC<ChartComponentProps> = ({
  data,
  colors: {
    backgroundColor = "white",
    lineColor = "#2962FF",
    textColor = "black",
    areaTopColor = "#2962FF",
    areaBottomColor = "rgba(41, 98, 255, 0.28)",
  } = {},
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  // Initialize chart once
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
        attributionLogo: false as unknown as boolean, // keep silent if lib types differ
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });
    chart.timeScale().applyOptions({ timeVisible: true, secondsVisible: false });
    const series = chart.addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });
    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          watermark: { visible: false },
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update series data when `data` changes
  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef} />;
};
