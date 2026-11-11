import { NextResponse } from "next/server";
import { getCachedAnalysis } from "@/lib/analysis-cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kodeDjpk = searchParams.get("kode")?.trim() ?? "";
  const yearParam = searchParams.get("tahun");
  const tahun = yearParam === null ? 0 : Number(yearParam);

  if (!/^\d{2}\.\d{2}$/.test(kodeDjpk)) {
    return NextResponse.json({ error: "Kode daerah tidak valid." }, { status: 400 });
  }
  if (yearParam !== null && (!Number.isInteger(tahun) || tahun < 2020 || tahun > 2026)) {
    return NextResponse.json({ error: "Tahun tidak valid." }, { status: 400 });
  }

  const snapshot = await getCachedAnalysis(kodeDjpk, tahun);
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
