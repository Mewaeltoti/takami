import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { visitUpdateStatusSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const visitId = parseInt(id, 10);

    if (isNaN(visitId)) {
      return NextResponse.json({ error: "Invalid visit ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = visitUpdateStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { status } = result.data;

    const { data: visit, error } = await supabase
      .from("Visit")
      .update({ status })
      .eq("id", visitId)
      .select("*, patient:Patient(*)")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Visit not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(visit);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
