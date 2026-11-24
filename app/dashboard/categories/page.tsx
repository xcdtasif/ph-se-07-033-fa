import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { SearchBox } from "@/components/shared/search-box"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { categoriesHref } from "@/lib/dashboard"
import { parsePage, parseSearch } from "@/lib/pagination"

import { AddCategoryForm } from "./_components/add-category-form"
import { CategoriesList, CategoriesListSkeleton } from "./_components/categories-list"

export const metadata: Metadata = {
  title: "Categories",
}

/*
Reads the URL, so it renders at request time. A new search or page keeps the current rows,
faded, until the next ones swap in (a transition), so nothing above them moves.
*/
async function CategoriesView({
  searchParams,
}: Pick<PageProps<"/dashboard/categories">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const search = parseSearch(query.search)

  return (
    <div className="flex flex-col gap-6">
      <SearchBox
        id="category-search"
        label="Search categories"
        placeholder="Search by name"
        href={categoriesHref()}
        search={search}
        listId="categories"
        className="max-w-none"
      />
      {/* A page change jumps here, to the first row */}
      <div id="categories" className="jump-target-4">
        <Suspense fallback={<CategoriesListSkeleton />}>
          <CategoriesList page={page} search={search} />
        </Suspense>
      </div>
    </div>
  )
}

// The first load: the search box's row too, so the list doesn't move down
function CategoriesViewSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="skeleton h-8 w-full rounded-lg" />
      <CategoriesListSkeleton />
    </div>
  )
}

/*
The admin's categories, as wide as the profile's cards and centred: an Add category card like
the profile's edit card, then the search and the list
*/
export default function CategoriesPage({ searchParams }: PageProps<"/dashboard/categories">) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <PageHeader title="Categories" />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Add category</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddCategoryForm />
        </CardContent>
      </Card>
      <Suspense fallback={<CategoriesViewSkeleton />}>
        <CategoriesView searchParams={searchParams} />
      </Suspense>
    </section>
  )
}
