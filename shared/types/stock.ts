export interface StockData {
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  timestamp: string;
}

export interface HistoricalData {
  meta?: {
    currency?: string;
    symbol: string;
    exchangeName?: string;
    instrumentType?: string;
    firstTradeDate?: Date | null;
    timezone?: string;
    regularMarketPrice?: number;
  };
  results: Candlestick[];
  ticker?: string;
  status?: string;
  errors?: string[];
}

export interface Candlestick {
  close?: number;
  high?: number;
  low?: number;
  open?: number;
  timestamp: number;
  volume?: number;
}
