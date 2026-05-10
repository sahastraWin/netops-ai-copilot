"use client";
import { useEffect, useState } from "react";
import { DashboardStats } from "@/types";
import { Role } from "@prisma/client";

interface StatsCardsProps {
  userId: string;
  role: Role;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  change?: string;
}

export default function StatsCards({ userId, role }: StatsCardsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="cisco-card p-5 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards: StatCard[] = [
    {
      title: "Total Logs Analyzed",
      value: stats?.totalLogs ?? 0,
      color: "text-[#00bceb]",
      bgColor: "bg-[#00bceb]/10",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Critical Alerts",
      value: stats?.criticalAlerts ?? 0,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      title: "Configs Generated",
      value: stats?.generatedConfigs ?? 0,
      color: "text-[#6cc04a]",
      bgColor: "bg-[#6cc04a]/10",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: "Issues Resolved",
      value: stats?.resolvedIssues ?? 0,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className={`cisco-card p-5 animate-fade-in-up stagger-${i + 1}`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-gray-500 text-xs font-medium leading-tight">
              {card.title}
            </p>
            <div className={`p-2 rounded-lg ${card.bgColor} ${card.color} flex-shrink-0`}>
              {card.icon}
            </div>
          </div>
          <p className={`text-3xl font-bold font-display ${card.color}`}>
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
