import { SkeletonText } from "@/components/shared/skeleton-text"
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"

// A label and its control while the form loads
function FieldSkeleton({ control }: { control: string }) {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonText className="w-24 text-sm leading-snug" />
      <div className={`skeleton rounded-lg ${control}`} />
    </div>
  )
}

/*
The form's card with its fields in place, so nothing moves when it arrives. The images part is
built from the form's own field parts, so its legend and note keep their exact spacing. The
description box is as tall as an empty one (it grows with its text in Chrome)
*/
export function PropertyFormSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-4" aria-hidden="true">
      <FieldGroup>
        {Array.from({ length: 5 }, (_, index) => (
          <FieldSkeleton key={index} control="h-8" />
        ))}
        <FieldSkeleton control="h-16" />
        <FieldSet className="gap-2">
          <FieldLegend variant="label">
            <SkeletonText className="w-14" />
          </FieldLegend>
          <FieldDescription>
            <SkeletonText className="w-48" />
          </FieldDescription>
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton aspect-3/2 rounded-lg" />
          </div>
        </FieldSet>
        <div className="flex justify-center gap-2">
          <div className="skeleton h-7 w-16 rounded-lg" />
          <div className="skeleton h-7 w-28 rounded-lg" />
        </div>
      </FieldGroup>
    </div>
  )
}
