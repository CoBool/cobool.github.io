import { PLACEHOLDER_TEXT } from "./home-placeholder"
import { ThemeModeControls } from "./theme-mode-controls"

export default function HomePage() {
  return (
    <main className="home-surface">
      <section className="home-panel" aria-labelledby="home-title">
        <div>
          <p className="home-kicker">True Log Foundation</p>
          <h1 className="home-title" id="home-title">
            {PLACEHOLDER_TEXT}
          </h1>
          <p className="home-copy">Next.js App Router is ready for the next implementation task.</p>
        </div>
        <ThemeModeControls />
      </section>
    </main>
  )
}
