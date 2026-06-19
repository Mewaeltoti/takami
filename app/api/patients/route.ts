import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { patientSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    let query = supabase.from("Patient").select("*").order("fullName", { ascending: true });

    if (search) {
      query = query.ilike("fullName", `%${search}%`);
    }

    const { data: patients, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(patients);
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
    const result = patientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { fullName, age, gender, phone } = result.data;

    const { data: patient, error } = await supabase
      .from("Patient")
      .insert({
        fullName,
        age,
        gender,
        phone: phone || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
