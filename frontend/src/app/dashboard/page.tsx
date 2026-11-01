"use client";

import { useEffect, useState } from "react";
import { MapPin, CalendarDays, ChevronDown } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import SummaryCard from "@/components/dashboard/SummaryCard";
import TrendChart from "@/components/dashboard/TrendChart";
import CategoryRealization from "@/components/dashboard/CategoryRealization";

import { summaryData } from "@/lib/mock-data";

export default function DashboardPage() {
  const [today, setToday] = useState("");

  // Mengambil tanggal dari perangkat pengguna
  useEffect(() => {
    const updateDate = () => {
      const currentDate = new Date();

      const formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(currentDate);

      setToday(formattedDate);
    };

    updateDate();

    // Memeriksa tanggal secara berkala
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppShell>
      <div className="w-full font-sans">

        {/* JUDUL DAN FILTER DASHBOARD */}
        <div className="mb-[25px] flex flex-wrap items-center justify-between gap-4">

          <h1 className="text-[32px] font-bold text-black">
            Dashboard
          </h1>

          <div className="flex flex-wrap items-center gap-5">

            {/* PILIHAN WILAYAH */}
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg border border-[#4D8DBA] px-4 py-3 text-[#4D8DBA]"
            >
              <MapPin size={18} strokeWidth={1.8} />
              <span className="text-sm font-normal">
                |
              </span>

              <span className="text-sm font-normal">
                Kabupaten Gianyar, Bali
              </span>

              <ChevronDown size={16} strokeWidth={1.8} />
            </button>

            {/* TANGGAL OTOMATIS */}
            <div className="flex items-center gap-3 rounded-lg border border-[#4D8DBA] px-4 py-3 text-[#4D8DBA]">

              <CalendarDays size={18} strokeWidth={1.8} />

              <span className="text-sm font-normal">
                |
              </span>

              <span className="text-sm font-normal">
                {today || "Memuat tanggal..."}
              </span>

            </div>

          </div>
        </div>

        {/* CONTAINER UTAMA DASHBOARD */}
        <div className="rounded-xl bg-[#e7f1fd] p-6">

          {/* SUMMARY CARDS */}
          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {summaryData.map((item, index) => (
              <SummaryCard
                key={index}
                title={item.title}
                value={item.value}
                description={item.description}
              />
            ))}

          </div>

          {/* GRAFIK DAN VARIASI REALISASI */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">

            <div className="lg:col-span-3">
              <TrendChart />
            </div>

            <div className="lg:col-span-1">
              <CategoryRealization />
            </div>

          </div>

        </div>
      </div>
    </AppShell>
  );
}