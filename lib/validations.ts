import { z } from "zod";
import { VisitStatus } from "@prisma/client";

export const patientSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  age: z.coerce.number().int().positive("Age must be a positive number"),
  gender: z.string().trim().min(1, "Gender is required"),
  phone: z.string().trim().optional().nullable().or(z.literal("")),
});

export const visitCreateSchema = z.object({
  symptoms: z.string().trim().min(1, "Symptoms are required"),
});

export const patientRegisterSchema = patientSchema.merge(visitCreateSchema);

export const visitUpdateStatusSchema = z.object({
  status: z.nativeEnum(VisitStatus),
});
