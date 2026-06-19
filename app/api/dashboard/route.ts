import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data: visits, error } = await supabase
      .from("Visit")
      .select("status")
      .gte("createdAt", startOfToday.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stats = {
      waitingCount: visits.filter((v) => v.status === "WAITING").length,
      seenTodayCount: visits.filter((v) => v.status === "COMPLETED").length,
      inProgressCount: visits.filter((v) => v.status === "IN_PROGRESS").length,
      totalTodayCount: visits.length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
