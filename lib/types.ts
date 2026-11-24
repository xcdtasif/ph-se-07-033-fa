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

// In lifecycle order, as the status filter lists them
export const PROPERTY_STATUSES = ["AVAILABLE", "RESERVED", "RENTED", "UNAVAILABLE"] as const

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number]

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

// A property as the admin reads it: the landlord's email and ban too, no rating
export type AdminProperty = Omit<Property, "landlord" | "reviewCount" | "averageRating"> & {
  landlord: Pick<User, "id" | "name" | "email" | "isBanned">
}

// A review as the public property reviews list returns it: the tenant's name only
export type PropertyReview = {
  id: string
  propertyId: string
  // 1 to 5
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  tenant: { name: string }
}

// One of the signed-in tenant's own reviews, hidden ones included
export type TenantReview = Omit<PropertyReview, "tenant"> & {
  tenantId: string
  requestId: string
  // Hidden by an admin: left out of the property's reviews and rating
  isHidden: boolean
  property: Pick<Property, "id" | "name" | "location" | "images">
}

// A review of one of the signed-in landlord's properties: visible ones only, with the tenant's name
export type LandlordReview = TenantReview & Pick<PropertyReview, "tenant">

// Any review, hidden ones too, as the admin reads it: with the tenant's id and email
export type AdminReview = TenantReview & { tenant: Pick<User, "id" | "name" | "email"> }

// In lifecycle order, as the status filter lists them
export const REQUEST_STATUSES = [
  "PENDING",
  "APPROVED",
  "ACTIVE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
] as const

export type RequestStatus = (typeof REQUEST_STATUSES)[number]

// A rental request as the tenant reads it, with a summary of its property
export type RentalRequest = {
  id: string
  tenantId: string
  propertyId: string
  message: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
  property: Pick<
    Property,
    | "id"
    | "landlordId"
    | "name"
    | "location"
    | "images"
    | "rent"
    | "deposit"
    | "status"
    | "reviewCount"
    | "averageRating"
  >
  isReviewed: boolean
}

// A rental request as the admin reads it: the tenant instead of the review flag, no rating
export type AdminRequest = Omit<RentalRequest, "isReviewed" | "property"> & {
  property: Omit<RentalRequest["property"], "reviewCount" | "averageRating">
  tenant: Pick<User, "id" | "name" | "email">
}

// As the landlord reads it: also the deposit the tenant paid, as a decimal string; null until paid
export type LandlordRequest = AdminRequest & {
  paidDeposit: string | null
}

// Set by the Stripe webhook only: COMPLETED when paid, FAILED when the checkout expired
export const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED"] as const

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

// What the payment is for; the deposit is the only one so far
export type PaymentType = "DEPOSIT"

// A payment as the tenant reads it, with its request and a summary of the property
export type Payment = {
  id: string
  requestId: string
  stripeSessionId: string
  // Decimal string
  amount: string
  // Lowercase ISO code, as Stripe takes it ("bdt")
  currency: string
  type: PaymentType
  status: PaymentStatus
  createdAt: string
  updatedAt: string
  request: {
    id: string
    tenantId: string
    status: RequestStatus
    property: Pick<Property, "id" | "name" | "location">
  }
}
