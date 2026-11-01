type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function SummaryCard({
  title,
  value,
  description,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#E5EDF5] bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-[#526B82]">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-[#0B2643]">
        {value}
      </p>

      <p className="mt-2 text-[11px] text-[#526B82]">
        {description}
      </p>
    </div>
  );
}
