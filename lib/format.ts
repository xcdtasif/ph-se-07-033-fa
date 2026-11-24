/*
Fixed locale and time zone, so the server and the browser format the same
value the same way (a mismatch would break hydration)
*/
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Asia/Dhaka" })

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))

const shortDateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Dhaka",
})

// Reads one part, e.g. the day, of the short date and time
const shortParts = (iso: string) => {
  const parts = shortDateTimeFormat.formatToParts(new Date(iso))
  return (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value
}

// "31-12-99"
export const formatShortDate = (iso: string) => {
  const part = shortParts(iso)
  return `${part("day")}-${part("month")}-${part("year")}`
}

// "31-12-99 09:09", on a 24-hour clock
export const formatShortDateTime = (iso: string) => {
  const part = shortParts(iso)
  return `${formatShortDate(iso)} ${part("hour")}:${part("minute")}`
}

/*
Lakh and crore grouping (9,99,99,999), as taka are written in Bangladesh.
en-IN, because ICU's en-BD groups in thousands; en-IN keeps Latin digits, unlike bn-BD.
*/
const LOCALE = "en-IN"

// "BDT 28,000", or "BDT 1,18,500.50" when there are paisa
const moneyFormat = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
  trailingZeroDisplay: "stripIfInteger",
})

// Takes the decimal string the backend sends
export const formatMoney = (amount: string) => moneyFormat.format(Number(amount))

const amountFormat = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 2,
  trailingZeroDisplay: "stripIfInteger",
})

// "28,000" or "1,18,500.50", where the currency is shown apart; takes the backend's decimal string
export const formatAmount = (amount: string) => amountFormat.format(Number(amount))

const numberFormat = new Intl.NumberFormat(LOCALE)

// 999999 as "9,99,999"
export const formatNumber = (value: number) => numberFormat.format(value)
