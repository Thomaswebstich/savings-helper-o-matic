
import { Currency } from './types';

export const EXCHANGE_RATES: Record<Currency, number> = {
  THB: 1,      // Base currency
  USD: 0.028,  // 1 THB = 0.028 USD
  EUR: 0.026   // 1 THB = 0.026 EUR
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  THB: "฿",
  USD: "$",
  EUR: "€"
};

export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const amountInTHB = fromCurrency === "THB" ? amount : amount / EXCHANGE_RATES[fromCurrency];
  
  return toCurrency === "THB" ? amountInTHB : amountInTHB * EXCHANGE_RATES[toCurrency];
};

export const formatCurrency = (amount: number, currency: Currency = "THB"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === "THB" ? 0 : 2,
    maximumFractionDigits: currency === "THB" ? 0 : 2
  }).format(amount);
};
