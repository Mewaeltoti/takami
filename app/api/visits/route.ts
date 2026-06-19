import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { visitCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data: visits, error } = await supabase
      .from("Visit")
      .select("*, patient:Patient(*)")
      .gte("createdAt", startOfToday.toISOString())
      .order("queueNumber", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(visits);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, symptoms } = body;

    if (!patientId || isNaN(parseInt(patientId, 10))) {
      return NextResponse.json({ error: "Invalid or missing patient ID" }, { status: 400 });
    }

    const validationResult = visitCreateSchema.safeParse({ symptoms });
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
    }

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from("Patient")
      .select("id")
      .eq("id", patientId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Compute next queue number for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("Visit")
      .select("id", { count: "exact", head: true })
      .gte("createdAt", startOfToday.toISOString());

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const queueNumber = (count || 0) + 1;

    // Create the visit
    const { data: visit, error: visitError } = await supabase
      .from("Visit")
      .insert({
        patientId: parseInt(patientId, 10),
        queueNumber,
        symptoms: validationResult.data.symptoms,
        status: "WAITING",
      })
      .select("*, patient:Patient(*)")
      .single();

    if (visitError) {
      return NextResponse.json({ error: visitError.message }, { status: 500 });
    }

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
