"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { realizationTrend } from "@/lib/mock-data";

const categories = [
  { key: "category1", name: "Kategori 1", color: "#086288" },
  { key: "category2", name: "Kategori 2", color: "#E69A38" },
  { key: "category3", name: "Kategori 3", color: "#39A77A" },
  { key: "category4", name: "Kategori 4", color: "#9675C9" },
  { key: "category5", name: "Kategori 5", color: "#D56E87" },
];

export default function TrendChart() {
  return (
    <div className="h-full rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#0B2643]">
          Grafik Tren Realisasi
        </h2>

        <p className="mt-1 text-xs text-[#526B82]">
          Perkembangan realisasi anggaran berdasarkan kategori tahun 2010–2025
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={realizationTrend}
            margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5EDF5"
            />

            <XAxis
              dataKey="year"
              interval={0}
              tick={{ fill: "#526B82", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(value) => `${value}`}
              tick={{ fill: "#526B82", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #E5EDF5",
                fontSize: "12px",
              }}
              formatter={(value) => [
                `Rp${value} juta`,
                "Realisasi",
              ]}
            />

            {categories.map((category) => (
              <Line
                key={category.key}
                type="monotone"
                dataKey={category.key}
                name={category.name}
                stroke={category.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {categories.map((category) => (
          <div key={category.key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: category.color }}
            />

            <span className="text-xs text-[#526B82]">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}