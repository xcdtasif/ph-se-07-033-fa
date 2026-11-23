// Rent and deposit are entered and filtered in whole taka; the backend also takes paisa
export const MAX_AMOUNT = 999_999

// Digits only, capped at the max amount's length; a pasted 9.56 keeps the whole part, not 956
export const toAmountDigits = (value: string) =>
  value.split(".")[0].replace(/\D/g, "").slice(0, String(MAX_AMOUNT).length)
