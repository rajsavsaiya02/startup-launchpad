import React from "react";
import ReactECharts from "echarts-for-react";
import { TrendingUp, Lock, ExternalLink, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatCurrency = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
};

export function FinanceChartWidget({ financeData }) {
  const navigate = useNavigate();

  // Restricted state for non-admin members
  if (!financeData) {
    return (
      <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm h-full flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 border border-border-light dark:border-border-dark">
          <Lock className="w-7 h-7 text-text-tertiary" />
        </div>
        <h4 className="font-black text-text-primary dark:text-white text-sm mb-1">Finance Overview</h4>
        <p className="text-xs text-text-tertiary max-w-[220px] leading-relaxed">
          Financial data is only visible to Founders and Admins.
        </p>
        <button
          onClick={() => navigate("/org/finances")}
          className="mt-4 text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Request Access <ExternalLink size={11} />
        </button>
      </div>
    );
  }

  const { totalRevenue, totalExpenses, netCashflow, healthScore, monthlyChart = [] } = financeData;

  const months = monthlyChart.map((d) => d.month);
  const incomeData = monthlyChart.map((d) => d.income);
  const expenseData = monthlyChart.map((d) => d.expenses);

  const cashflowPositive = netCashflow >= 0;

  const options = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(17, 24, 39, 0.92)",
      textStyle: { color: "#fff", fontSize: 12, fontFamily: "Inter, sans-serif" },
      borderWidth: 0,
      borderRadius: 10,
      padding: [10, 14],
      formatter: (params) => {
        let html = `<div style="font-weight:700;margin-bottom:6px;font-size:11px;opacity:0.7;letter-spacing:0.05em;text-transform:uppercase">${params[0]?.axisValue}</div>`;
        params.forEach((p) => {
          const color = p.color;
          html += `<div style="display:flex;align-items:center;gap:8px;margin:3px 0">
            <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
            <span style="opacity:0.8;font-size:11px">${p.seriesName}</span>
            <span style="font-weight:700;margin-left:auto;padding-left:16px">${formatCurrency(p.value)}</span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      show: false,
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "4%",
      top: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: months.length > 0 ? months : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#9CA3AF", fontSize: 11, fontWeight: 700 },
    },
    yAxis: {
      type: "value",
      splitLine: {
        lineStyle: { color: "rgba(156, 163, 175, 0.08)", type: "dashed" },
      },
      axisLabel: {
        color: "#9CA3AF",
        fontSize: 10,
        formatter: (v) => formatCurrency(v),
      },
    },
    series: [
      {
        name: "Income",
        type: "line",
        smooth: true,
        data: incomeData,
        lineStyle: { color: "#10B981", width: 3 },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.25)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.02)" },
            ],
          },
        },
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#10B981", borderColor: "#ffffff", borderWidth: 2 },
      },
      {
        name: "Expenses",
        type: "line",
        smooth: true,
        data: expenseData,
        lineStyle: { color: "#F97316", width: 3 },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(249, 115, 22, 0.2)" },
              { offset: 1, color: "rgba(249, 115, 22, 0.02)" },
            ],
          },
        },
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#F97316", borderColor: "#ffffff", borderWidth: 2 },
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-text-primary dark:text-white flex items-center gap-2">
            Financial Overview
            <span
              className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                healthScore >= 80
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                  : healthScore >= 60
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                  : "bg-red-50 dark:bg-red-900/20 text-red-600"
              }`}
            >
              Health {healthScore}%
            </span>
          </h3>
          <p className="text-[11px] text-text-tertiary mt-0.5">Last 6 months income vs expenses</p>
        </div>
        <button
          onClick={() => navigate("/org/finances")}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-2.5 py-1.5 rounded-lg border border-primary/10"
        >
          Finances <ExternalLink size={10} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-[11px] font-bold text-text-tertiary">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
          <span className="text-[11px] font-bold text-text-tertiary">Expenses</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[180px]">
        <ReactECharts
          option={options}
          style={{ height: "100%", width: "100%", minHeight: "180px" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
        <div className="text-center">
          <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Total Income</p>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="text-center border-x border-border-light dark:border-border-dark">
          <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Total Expenses</p>
          <p className="text-sm font-black text-orange-600 dark:text-orange-400 tabular-nums mt-0.5">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Net Cashflow</p>
          <p
            className={`text-sm font-black tabular-nums mt-0.5 flex items-center justify-center gap-0.5 ${
              cashflowPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {cashflowPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {formatCurrency(Math.abs(netCashflow))}
          </p>
        </div>
      </div>
    </div>
  );
}
