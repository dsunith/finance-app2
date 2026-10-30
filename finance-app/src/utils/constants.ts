import { CompanyInfo } from '../types/market';

export const TRACKED_COMPANIES: Record<string, CompanyInfo> = {
  IBM: {
    symbol: 'IBM',
    name: 'International Business Machines',
    sector: 'Technology & Cloud',
    color: '#0f62fe', // IBM Blue
    isPrimary: true,
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corp',
    sector: 'Cloud & Software',
    color: '#00a4ef',
  },
  ORCL: {
    symbol: 'ORCL',
    name: 'Oracle Corp',
    sector: 'Database & Cloud',
    color: '#f80000',
  },
  SAP: {
    symbol: 'SAP',
    name: 'SAP SE',
    sector: 'Enterprise Software',
    color: '#e59c00',
  },
  CRM: {
    symbol: 'CRM',
    name: 'Salesforce Inc',
    sector: 'CRM & Cloud Apps',
    color: '#00a1e0',
  },
};

export const DEFAULT_TICKERS = ['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM'];

export const TIME_WINDOW_LABELS: Record<string, { label: string; description: string }> = {
  '1D': { label: 'Current Day', description: 'Intraday 5-min intervals' },
  '7D': { label: 'Last 7 Days', description: 'Daily close % comparison' },
  '1Q': { label: 'Last Quarter', description: '90-day trend & volatility' },
};
