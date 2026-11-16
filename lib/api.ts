import { env } from "@/config/env"

export type ApiMeta = {
  page: number
  limit: number
  total: number
}

export type ApiSuccess<T> = {
  success: true
  statusCode: number
  message: string
  data: T
  meta?: ApiMeta
}

export type ApiFailure = {
  success: false
  // HTTP status from the backend, or 0 when no usable response arrived
  statusCode: number
  message: string
  errorDetails?: unknown
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  // Sent as JSON
  body?: unknown
}

const NETWORK_ERROR_MESSAGE = "Can't reach the server. Check your connection and try again."
const BAD_RESPONSE_MESSAGE = "The server sent an unexpected response. Please try again."

const isApiResponse = (value: unknown): value is ApiResponse<unknown> =>
  typeof value === "object" &&
  value !== null &&
  "success" in value &&
  typeof value.success === "boolean" &&
  "message" in value &&
  typeof value.message === "string"

/*
Calls the backend from the server and always resolves to its response envelope.
A network failure or a non-JSON reply becomes an `ApiFailure`, so callers handle
every error the same way: check `success`, show `message`.

`path` is a backend path starting with `/api/`, including any query string.
*/
export const apiFetch = async <T>(
  path: string,
  { body, headers, ...init }: ApiFetchOptions = {},
): Promise<ApiResponse<T>> => {
  let res: Response

  try {
    res = await fetch(`${env.API_URL}${path}`, {
      ...init,
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    return { success: false, statusCode: 0, message: NETWORK_ERROR_MESSAGE }
  }

  const json: unknown = await res.json().catch(() => null)

  if (!isApiResponse(json)) {
    return { success: false, statusCode: res.status, message: BAD_RESPONSE_MESSAGE }
  }

  return json as ApiResponse<T>
}
