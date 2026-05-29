export default function CardsSkeleton() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {Array.from({ length: 20 }).map((_, id) => (
        <CardSkeleton key={id} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white/10 flex flex-col lg:p-4 gap-3 w-full aspect-[228/280] rounded-3xl overflow-hidden">
      <div className="flex flex-col items-center">
        <span className="mt-6" />
      </div>
    </div>
  );
}
