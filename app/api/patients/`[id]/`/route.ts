import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { patientSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    // Retrieve patient along with their visits
    const { data: patient, error } = await supabase
      .from("Patient")
      .select("*, Visit(*)")
      .eq("id", patientId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map Visit relation back to camelCase visits key to match custom PatientWithVisits type
    const formattedPatient = {
      ...patient,
      visits: patient.Visit || [],
    };
    delete formattedPatient.Visit;

    return NextResponse.json(formattedPatient);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = patientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { fullName, age, gender, phone } = result.data;

    const { data: patient, error } = await supabase
      .from("Patient")
      .update({
        fullName,
        age,
        gender,
        phone: phone || null,
      })
      .eq("id", patientId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("Patient")
      .delete()
      .eq("id", patientId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
