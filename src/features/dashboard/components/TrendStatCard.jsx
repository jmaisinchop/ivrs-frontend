import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

const TrendStatCard = ({ title, metric, isPercentage = false }) => {
  const value = metric?.value !== undefined ? metric.value : 0;
  const change = metric?.change !== undefined ? metric.change : 0;
  
  const displayValue = isPercentage ? `${(value * 100).toFixed(1)}%` : value;

  const getTrend = () => {
    if (title.toLowerCase().includes("en curso")) {
      return {
        icon: <MinusIcon className="h-5 w-5 text-gray-500" />,
        color: 'text-gray-500',
        text: 'En tiempo real',
      };
    }

    if (change === 0 || !isFinite(change)) {
      return {
        icon: <MinusIcon className="h-5 w-5 text-gray-500" />,
        color: 'text-gray-500',
        text: 'Sin cambios',
      };
    }

    const isPositive = change > 0;
    const changeText = `${Math.abs(change).toFixed(1)}% vs. período anterior`;

    if (isPositive) {
      return {
        icon: <ArrowUpIcon className="h-5 w-5 text-green-500" />,
        color: 'text-green-500',
        text: changeText,
      };
    } else {
      return {
        icon: <ArrowDownIcon className="h-5 w-5 text-red-500" />,
        color: 'text-red-500',
        text: changeText,
      };
    }
  };

  const trend = getTrend();

  return (
    <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md flex flex-col justify-between">
      <div>
        <h3 className="text-gray-500 dark:text-slate-400 font-medium truncate">{title}</h3>
        <p className="text-4xl font-bold text-gray-800 dark:text-slate-100 mt-2">{displayValue}</p>
      </div>
      <div className={`flex items-center mt-4 text-sm ${trend.color}`}>
        {trend.icon}
        <span className="ml-1">{trend.text}</span>
      </div>
    </div>
  );
};

export default TrendStatCard;