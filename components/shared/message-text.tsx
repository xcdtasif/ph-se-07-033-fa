import type { ReactNode } from "react"

/*
Text someone wrote, a request's message or a review's comment, in a grey box; line breaks kept.
The grey is a 5% tint of the text colour, like the skeleton's, so it shows on a white card and on
the page background (a hidden review) alike
*/
export function MessageText({ children }: { children: ReactNode }) {
  return (
    <p className="bg-foreground/5 rounded-lg px-3 py-2 text-sm whitespace-pre-line">{children}</p>
  )
}

// The box while it loads; the text's length isn't known, so it assumes two lines
export function MessageTextSkeleton() {
  return <div className="skeleton h-[calc(2lh+1rem)] rounded-lg text-sm" />
}
