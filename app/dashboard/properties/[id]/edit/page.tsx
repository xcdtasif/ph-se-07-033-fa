import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache, Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { authFetch } from "@/lib/auth-fetch"
import { getCategories } from "@/lib/categories"
import type { Property } from "@/lib/types"

import { updatePropertyAction } from "../../_actions/property-actions"
import { DeletePropertyDialog } from "../../_components/delete-property-dialog"
import { PropertyForm } from "../../_components/property-form"
import { PropertyFormSkeleton } from "../../_components/property-form-skeleton"

export const metadata: Metadata = {
  title: "Edit property",
}

type EditPageProps = Pick<PageProps<"/dashboard/properties/[id]/edit">, "params">

/*
The landlord's own property, hidden ones included, fetched once for the heading's Delete and the
form. Another landlord's property, a missing one or a malformed id is a 404.
*/
const getOwnProperty = cache(async (id: string) => {
  const result = await authFetch<Property>(`/api/landlord/properties/${encodeURIComponent(id)}`)

  if (!result.success && [400, 403, 404].includes(result.statusCode)) {
    notFound()
  }

  return result
})

// Only an available or unavailable property can be deleted; the backend still refuses one with requests
async function DeleteButton({ params }: EditPageProps) {
  const result = await getOwnProperty((await params).id)

  return result.success &&
    (result.data.status === "AVAILABLE" || result.data.status === "UNAVAILABLE") ? (
    <DeletePropertyDialog propertyId={result.data.id} />
  ) : null
}

// A reserved property can't be edited, so it gets a note instead of the form
async function EditProperty({ params }: EditPageProps) {
  const { id } = await params
  const [result, categories] = await Promise.all([getOwnProperty(id), getCategories()])

  if (!result.success) {
    return <ApiError error={result} />
  }

  if (!categories.success) {
    return <ApiError error={categories} />
  }

  if (result.data.status === "RESERVED") {
    return (
      <p className="text-muted-foreground empty-state">
        A reserved property can&apos;t be edited until its approved request is paid or rejected.
      </p>
    )
  }

  return (
    <div className="bg-card rounded-xl border p-4">
      <PropertyForm
        categories={categories.data}
        property={result.data}
        action={updatePropertyAction.bind(null, id)}
        submitLabel="Save changes"
      />
    </div>
  )
}

// As wide as the profile page
export default function EditPropertyPage({ params }: PageProps<"/dashboard/properties/[id]/edit">) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit property</h1>
        <Suspense fallback={<div className="skeleton h-7 w-28 rounded-lg" aria-hidden="true" />}>
          <DeleteButton params={params} />
        </Suspense>
      </div>
      <Suspense fallback={<PropertyFormSkeleton />}>
        <EditProperty params={params} />
      </Suspense>
    </section>
  )
}
