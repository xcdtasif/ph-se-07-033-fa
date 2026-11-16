export type UserRole = "ADMIN" | "LANDLORD" | "TENANT"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  isBanned: boolean
  createdAt: string
  updatedAt: string
}
