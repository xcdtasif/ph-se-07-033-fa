import { HomeLink } from "./home-link"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row">
        <HomeLink className="text-foreground text-lg font-semibold" />
        <p>Find and list properties with ease</p>
      </div>
    </footer>
  )
}
