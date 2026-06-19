import { Patient, Visit } from "@prisma/client";

export type PatientWithVisits = Patient & {
  visits: Visit[];
};

export type VisitWithPatient = Visit & {
  patient: Patient;
};

export interface DashboardStats {
  waitingCount: number;
  seenTodayCount: number;
  totalTodayCount: number;
  inProgressCount: number;
}
