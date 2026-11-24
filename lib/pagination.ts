// A page number from the URL (e.g. `?page=`), 1 for anything that isn't a whole page above 1
export const parsePage = (value: string | string[] | undefined) => {
  const page = Number(value)

  return Number.isInteger(page) && page > 1 ? page : 1
}

// `?search=` as the backend takes it: trimmed, 1 to 100 characters, undefined when empty
export const parseSearch = (value: string | string[] | undefined) => {
  const search = typeof value === "string" ? value.trim().slice(0, 100) : ""

  return search || undefined
}
