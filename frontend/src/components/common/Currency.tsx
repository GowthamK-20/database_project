import React from 'react';

interface CurrencyProps {
  amount: number | string;
  currency?: string;
  fractionDigits?: number;
  className?: string;
}

export const Currency: React.FC<CurrencyProps> = ({
  amount,
  currency = 'INR',
  fractionDigits = 2,
  className = '',
}) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const validNum = isNaN(num) ? 0 : num;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(validNum);

  return (
    <span className={`font-mono tabular-nums font-medium ${className}`}>
      {formatted}
    </span>
  );
};
