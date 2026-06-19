"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientRegisterSchema } from "@/lib/validations";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Calendar, Phone, Activity } from "lucide-react";

type FormValues = z.infer<typeof patientRegisterSchema>;

export default function RegisterPatient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      fullName: "",
      age: undefined,
      gender: "",
      phone: "",
      symptoms: "",
    },
  });

  const genderValue = watch("gender");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // 1. Create Patient Profile
      const patientResponse = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          age: data.age,
          gender: data.gender,
          phone: data.phone || null,
        }),
      });

      if (!patientResponse.ok) {
        const errData = await patientResponse.json();
        throw new Error(errData.error || "Failed to register patient profile.");
      }

      const patient = await patientResponse.json();

      // 2. Create Visit (Adding to Today's Queue)
      const visitResponse = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          symptoms: data.symptoms,
        }),
      });

      if (!visitResponse.ok) {
        const errData = await visitResponse.json();
        throw new Error(errData.error || "Failed to add patient to queue.");
      }

      // Successful registration
      router.push("/queue");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12 px-4 mx-auto">
      <Card className="shadow-lg border-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Register New Patient</CardTitle>
          <CardDescription>
            Enter patient demographics and symptoms to register them and assign a queue number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg">
                {apiError}
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    {...register("fullName")}
                    placeholder="John Doe"
                    className="pl-9"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      {...register("age")}
                      placeholder="35"
                      className="pl-9"
                    />
                  </div>
                  {errors.age && (
                    <p className="text-xs text-red-600">{errors.age.message}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">Gender</label>
                  <Select
                    value={genderValue}
                    onValueChange={(val) => setValue("gender", val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-red-600">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    {...register("phone")}
                    placeholder="+1 (555) 019-2834"
                    className="pl-9"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Symptoms / Chief Complaint</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    {...register("symptoms")}
                    placeholder="Persistent cough, fever for 3 days..."
                    className="w-full min-h-[100px] pl-9 pr-3 py-2 border rounded-md text-sm border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                {errors.symptoms && (
                  <p className="text-xs text-red-600">{errors.symptoms.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Patient & Queue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
