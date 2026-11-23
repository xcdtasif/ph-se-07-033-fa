import { SkeletonText } from "@/components/shared/skeleton-text"

// A label and its control while the form loads
function FieldSkeleton({ control }: { control: string }) {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonText className="w-24 text-sm leading-snug" />
      <div className={`skeleton rounded-lg ${control}`} />
    </div>
  )
}

// The form's card with its fields in place, so nothing moves when it arrives
export function PropertyFormSkeleton() {
  return (
    <div className="bg-card flex flex-col gap-5 rounded-xl border p-4" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <FieldSkeleton key={index} control="h-8" />
      ))}
      <FieldSkeleton control="h-28" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton aspect-3/2 rounded-lg" />
      </div>
    </div>
  )
}
