/*
Fixed locale and time zone, so the server and the browser format the same
value the same way (a mismatch would break hydration)
*/
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Asia/Dhaka" })

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))

// en-US months, since en-GB writes September as "Sept"
const shortDateFormat = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "2-digit",
  timeZone: "Asia/Dhaka",
})

// "22-Nov-26"
export const formatShortDate = (iso: string) => {
  const parts = shortDateFormat.formatToParts(new Date(iso))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value

  return `${part("day")}-${part("month")}-${part("year")}`
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

const numberFormat = new Intl.NumberFormat(LOCALE)

// 999999 as "9,99,999"
export const formatNumber = (value: number) => numberFormat.format(value)
