"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/types";
import { Users, ClipboardList, CheckCircle, RefreshCw, Activity, ArrowRight, UserPlus } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    waitingCount: 0,
    seenTodayCount: 0,
    totalTodayCount: 0,
    inProgressCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to load statistics.");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const cardConfig = [
    {
      title: "Patients Waiting",
      value: stats.waitingCount,
      description: "Patients queued for consultation",
      icon: ClockIcon,
      colorClass: "text-amber-600 bg-amber-50 dark:bg-amber-950/20",
    },
    {
      title: "Active Consultations",
      value: stats.inProgressCount,
      description: "Patients currently with doctor",
      icon: Activity,
      colorClass: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Seen Today",
      value: stats.seenTodayCount,
      description: "Completed consultations",
      icon: CheckCircle,
      colorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      title: "Total Visits Today",
      value: stats.totalTodayCount,
      description: "Cumulative registrations",
      icon: Users,
      colorClass: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20",
    },
  ];

  return (
    <div className="container py-8 px-4 md:px-8 mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinic Overview</h1>
          <p className="text-slate-500">Live summary of today's registrations and consultations.</p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="shadow-sm border-slate-100 transition-all hover:scale-[1.01] hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-sm font-medium text-slate-500">{card.title}</span>
                <div className={`p-2 rounded-full ${card.colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{card.value}</div>
                <p className="text-xs text-slate-400 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action and Workflow Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-100 p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Reception Desk</h3>
            <p className="text-sm text-slate-500">
              Register new patients, record details, describe symptoms, and automatically place them in the queue.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/patients/new">
              <Button className="w-full sm:w-auto gap-2">
                <UserPlus className="h-4 w-4" />
                Register New Patient
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="shadow-sm border-slate-100 p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Doctor Console</h3>
            <p className="text-sm text-slate-500">
              Access the live patient queue. Start patient checkups, track active consultations, and check out completed visits.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/queue">
              <Button variant="outline" className="w-full sm:w-auto gap-2 border-slate-200">
                <ClipboardList className="h-4 w-4" />
                Open Queue Console
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Simple clock icon replacement to avoid extra lucide exports if it is called Clock
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
