export type ChartData = {
  time: string;
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
