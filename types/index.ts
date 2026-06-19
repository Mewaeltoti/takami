export type VisitStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED";

export interface Patient {
  id: number;
  fullName: string;
  age: number;
  gender: string;
  phone: string | null;
  createdAt: string;
}

export interface Visit {
  id: number;
  patientId: number;
  queueNumber: number;
  symptoms: string;
  status: VisitStatus;
  createdAt: string;
}

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
