/*
Fixed locale and time zone, so the server and the browser format the same
value the same way (a mismatch would break hydration)
*/
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Asia/Dhaka" })

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))
