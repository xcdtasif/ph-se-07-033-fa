export const USER_ROLES = ["ADMIN", "LANDLORD", "TENANT"] as const

export type UserRole = (typeof USER_ROLES)[number]

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  isBanned: boolean
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type PropertyStatus = "AVAILABLE" | "UNAVAILABLE" | "RESERVED" | "RENTED"

// As returned by the public reads, which add the rating summary
export type Property = {
  id: string
  landlordId: string
  categoryId: string
  name: string
  description: string
  location: string
  images: string[]
  // Decimals arrive as strings
  rent: string
  deposit: string
  status: PropertyStatus
  isHidden: boolean
  createdAt: string
  updatedAt: string
  landlord: { id: string; name: string }
  category: Category
  reviewCount: number
  // One decimal, null when there are no reviews
  averageRating: number | null
}
