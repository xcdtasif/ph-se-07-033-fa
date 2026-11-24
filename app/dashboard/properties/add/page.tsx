import type { Metadata } from "next"

import { ApiError } from "@/components/shared/api-error"
import { PageHeader } from "@/components/shared/page-header"
import { getCategories } from "@/lib/categories"

import { createPropertyAction } from "../_actions/property-actions"
import { PropertyForm } from "../_components/property-form"

export const metadata: Metadata = {
  title: "Add property",
}

// Categories are public and cached, so the whole form is in the prerendered shell. As wide as the
// profile page
export default async function AddPropertyPage() {
  const categories = await getCategories()

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <PageHeader title="Add property" />
      {categories.success ? (
        <div className="bg-card rounded-xl border p-4">
          <PropertyForm
            categories={categories.data}
            action={createPropertyAction}
            submitLabel="Add property"
          />
        </div>
      ) : (
        <ApiError error={categories} />
      )}
    </section>
  )
}
