/*
Fixed locale and time zone, so the server and the browser format the same
value the same way (a mismatch would break hydration)
*/
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Asia/Dhaka" })

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))

// "BDT 28,000", or "BDT 18,500.50" when there are paisa
const moneyFormat = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
  trailingZeroDisplay: "stripIfInteger",
})

// Takes the decimal string the backend sends
export const formatMoney = (amount: string) => moneyFormat.format(Number(amount))
