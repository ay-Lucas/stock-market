import type { UTCTimestamp } from "lightweight-charts";

export type ChartData = {
  time: UTCTimestamp | string;
  value: number;
};

export type ChartComponentProps = {
  data: ChartData[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
};
