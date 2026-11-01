import { categoryRealization } from "@/lib/mock-data";

export default function CategoryRealization() {
  return (
    <div className="h-full rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#0B2643]">
          Variasi Realisasi Anggaran
        </h2>

        <p className="mt-1 text-xs text-[#526B82]">
          Persentase penggunaan anggaran berdasarkan kategori
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {categoryRealization.map((item) => (
          <div key={item.category}>
            {/* Nama Kategori */}
            <p className="mb-2 text-sm font-semibold text-[#0B2643]">
              {item.category}
            </p>

            {/* Progress Bar */}
            <div
              className="h-3 w-full overflow-hidden rounded-full"
              style={{
                backgroundColor: `${item.color}33`,
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>

            {/* Informasi Realisasi */}
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-[#526B82]">
                Rp{item.actual} juta digunakan
              </p>

              <p className="text-[11px] font-semibold text-[#526B82]">
                {item.percentage}% dari Rp{item.budget} juta
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}