"use client";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { WeeklyTrend } from "@/types";

export default function ActivityChart() {
  const [data, setData] = useState<WeeklyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data.weeklyTrend);
      })
      .finally(() => setLoading(false));
  }, []);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ color: string; name: string; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1117] border border-[#1f2937] rounded-lg p-3 text-xs font-mono">
          <p className="text-gray-400 mb-2">{label}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cisco-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold font-display">
            Activity Trend
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#00bceb]" />
            Logs
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#6cc04a]" />
            Configs
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Critical
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-600 text-sm font-mono">
          Loading chart data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00bceb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00bceb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConfigs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6cc04a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6cc04a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="logs"
              stroke="#00bceb"
              strokeWidth={2}
              fill="url(#colorLogs)"
              name="Logs"
            />
            <Area
              type="monotone"
              dataKey="configs"
              stroke="#6cc04a"
              strokeWidth={2}
              fill="url(#colorConfigs)"
              name="Configs"
            />
            <Area
              type="monotone"
              dataKey="critical"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorCritical)"
              name="Critical"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
