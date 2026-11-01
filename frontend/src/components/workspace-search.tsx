"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { BIDANG, slugify } from "@/lib/demo-data";

const pages = [
  { label: "Dashboard", hint: "Ringkasan indikator anggaran", href: "/dashboard" },
  { label: "Anggaran", hint: "Telusuri bidang dan jenis belanja", href: "/anggaran" },
  { label: "Analisis Kebutuhan", hint: "Bandingkan dengan kabupaten lain", href: "/analisis" },
  { label: "Simulasi Alokasi", hint: "Susun skenario anggaran", href: "/simulasi" },
  { label: "Sumber Data", hint: "Asal, cakupan, dan catatan pengolahan", href: "/sumber-data" },
];

const index = pages.concat(
  BIDANG.map((name) => ({
    label: name,
    hint: "Bidang belanja",
    href: `/anggaran/${slugify(name)}`,
  })),
);

export function WorkspaceSearch() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return index
      .filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(term))
      .slice(0, 6);
  }, [query]);

  return (
    <form className="wsearch" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="wsearch-box">
        <Search size={16} aria-hidden="true" />
        <span className="sr">Cari bidang, halaman, atau istilah</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setQuery("");
          }}
          placeholder="Cari bidang, halaman, atau istilah"
          autoComplete="off"
        />
      </label>

      {query.trim() ? (
        <div className="wsearch-pop" role="listbox" aria-label="Hasil pencarian">
          {matches.length ? (
            matches.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="wsearch-item"
                role="option"
                aria-selected="false"
                onClick={() => setQuery("")}
              >
                <b>{item.label}</b>
                <span>{item.hint}</span>
              </Link>
            ))
          ) : (
            <div className="wsearch-empty">Tidak ada hasil untuk “{query.trim()}”.</div>
          )}
        </div>
      ) : null}
    </form>
  );
}
