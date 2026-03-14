"use client";
import { ChartComponentProps } from "@/types/chart";
import { ColorType, createChart, ISeriesApi } from "lightweight-charts";
import { IChartApi } from "lightweight-charts";
import type { Time } from "lightweight-charts";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useTheme } from "next-themes";

export type ChartHandle = {
  fitContent: () => void;
  setVisibleRange: (from: Time, to: Time) => void;
};

export const Chart = forwardRef<ChartHandle, ChartComponentProps>(
  (
    {
      data,
      colors: {
        backgroundColor = "white",
        lineColor = "#2962FF",
        textColor = "black",
        areaTopColor = "#2962FF",
        areaBottomColor = "rgba(41, 98, 255, 0.28)",
      } = {},
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
    const themeColors =
      theme === "dark"
        ? {
            bg: "#0b1220",
            text: "#e5e7eb",
            line: "#60a5fa",
            top: "rgba(96,165,250,0.4)",
            bottom: "rgba(96,165,250,0.1)",
          }
        : {
            bg: backgroundColor,
            text: textColor,
            line: lineColor,
            top: areaTopColor,
            bottom: areaBottomColor,
          };

    const normalizedData = useMemo(() => {
      const toEpoch = (time: Time): number => {
        if (typeof time === "number") return time;
        if (typeof time === "string") {
          const parsed = Date.parse(`${time}T00:00:00Z`);
          return Number.isNaN(parsed) ? 0 : Math.floor(parsed / 1000);
        }
        return 0;
      };

      const sorted = [...data].sort((a, b) => toEpoch(a.time) - toEpoch(b.time));
      const deduped: ChartComponentProps["data"] = [];
      for (const point of sorted) {
        const last = deduped[deduped.length - 1];
        if (!last || toEpoch(last.time) !== toEpoch(point.time)) {
          deduped.push(point);
        } else {
          // If duplicate times are returned, keep the latest point value.
          deduped[deduped.length - 1] = point;
        }
      }
      return deduped;
    }, [data]);

    // Initialize chart once
    useEffect(() => {
      if (!chartContainerRef.current || chartRef.current) return;
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: themeColors.bg },
          textColor: themeColors.text,
          attributionLogo: false as unknown as boolean, // keep silent if lib types differ
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          barSpacing: 3,
          minBarSpacing: 0.2,
        },
      });
      const series = chart.addAreaSeries({
        lineColor: themeColors.line,
        topColor: themeColors.top,
        bottomColor: themeColors.bottom,
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
        seriesRef.current.setData(normalizedData);
        chartRef.current?.timeScale().fitContent();
      }
    }, [normalizedData]);

    // Update theme colors when theme changes
    useEffect(() => {
      if (!chartRef.current || !seriesRef.current) return;
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: themeColors.bg },
          textColor: themeColors.text,
        },
      });
      seriesRef.current.applyOptions({
        lineColor: themeColors.line,
        topColor: themeColors.top,
        bottomColor: themeColors.bottom,
      });
    }, [theme]);

    // Expose imperative API to parent (e.g., for range buttons)
    useImperativeHandle(
      ref,
      () => ({
        fitContent: () => chartRef.current?.timeScale().fitContent(),
        setVisibleRange: (from: Time, to: Time) =>
          chartRef.current?.timeScale().setVisibleRange({ from, to }),
      }),
      [],
    );

    return <div ref={chartContainerRef} />;
  },
);

Chart.displayName = "Chart";
