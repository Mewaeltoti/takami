"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisitWithPatient } from "@/types";
import { Play, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

export default function QueuePage() {
  const [visits, setVisits] = useState<VisitWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/visits");
      if (!response.ok) {
        throw new Error("Failed to load today's queue.");
      }
      const data = await response.json();
      setVisits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh the queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (visitId: number, status: "IN_PROGRESS" | "COMPLETED") => {
    try {
      const response = await fetch(`/api/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status.");
      }

      // Optimistically or synchronously update local state
      const updatedVisit = await response.json();
      setVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, status: updatedVisit.status } : v)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING":
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Waiting</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container py-8 px-4 md:px-8 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today's Queue</h1>
          <p className="text-slate-500">Manage real-time clinic patient consultations and queue workflow.</p>
        </div>
        <Button onClick={fetchQueue} variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="shadow-sm border-slate-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center font-bold">Queue #</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Demographics</TableHead>
                <TableHead className="max-w-xs">Symptoms / Chief Complaint</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No patients in the queue for today.
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => (
                  <TableRow key={visit.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-bold text-lg text-slate-900">
                      {visit.queueNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {visit.patient?.fullName || "Unknown Patient"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {visit.patient ? `${visit.patient.age} y/o • ${visit.patient.gender}` : "-"}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate text-sm" title={visit.symptoms}>
                      {visit.symptoms}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(visit.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {visit.status === "WAITING" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(visit.id, "IN_PROGRESS")}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Start
                          </Button>
                        )}
                        {visit.status === "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(visit.id, "COMPLETED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Complete
                          </Button>
                        )}
                        {visit.status === "COMPLETED" && (
                          <span className="text-xs text-slate-400 italic pr-2">Checked Out</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
