export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-dashed border-line rounded-lg py-10 px-6 text-center">
      <p className="font-medium text-ink text-[15px]">{title}</p>
      <p className="text-subtle text-[14px] mt-1.5 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}
