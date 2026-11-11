import { NextResponse } from "next/server";
import { getCachedBudget } from "@/lib/budget-cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kodeDjpk = searchParams.get("kode")?.trim() ?? "";
  const yearParam = searchParams.get("tahun");
  const tahun = yearParam === null ? undefined : Number(yearParam);

  if (!/^\d{2}\.\d{2}$/.test(kodeDjpk)) {
    return NextResponse.json({ error: "Kode daerah tidak valid." }, { status: 400 });
  }
  if (
    tahun !== undefined &&
    (!Number.isInteger(tahun) || tahun < 2020 || tahun > 2026)
  ) {
    return NextResponse.json({ error: "Tahun tidak valid." }, { status: 400 });
  }

  const bundle = await getCachedBudget(kodeDjpk, tahun ?? 0);
  return NextResponse.json(bundle, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
