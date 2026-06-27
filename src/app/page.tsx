import { getLatestPosts } from "../lib/posts"
import { PLACEHOLDER_TEXT } from "./home-placeholder"
import { ThemeModeControls } from "./theme-mode-controls"

export default function HomePage() {
  const latestPosts = getLatestPosts(5)

  return (
    <main className="home-surface">
      <section className="home-panel" aria-labelledby="home-title">
        <div className="home-panel__content">
          <div>
            <p className="home-kicker">True Log Foundation</p>
            <h1 className="home-title" id="home-title">
              {PLACEHOLDER_TEXT}
            </h1>
            <p className="home-copy">
              Markdown posts now flow from local files into the static homepage.
            </p>
          </div>

          <section className="latest-posts" aria-labelledby="latest-posts-title">
            <div className="latest-posts__header">
              <p className="home-kicker">Latest Posts</p>
              <h2 className="latest-posts__title" id="latest-posts-title">
                Fresh from the content folder
              </h2>
            </div>

            <ol className="latest-posts__list">
              {latestPosts.map((post) => (
                <li className="latest-posts__item" key={post.slug}>
                  <article>
                    <div className="latest-posts__meta">
                      <time dateTime={post.date}>{post.date}</time>
                      <span>{post.readingTime}</span>
                      <span>{post.category}</span>
                      {post.pinned ? <span>Pinned</span> : null}
                    </div>
                    <h3 className="latest-posts__item-title">{post.title}</h3>
                    <p className="latest-posts__description">{post.description}</p>
                    <ul className="latest-posts__tags" aria-label={`${post.title} tags`}>
                      {post.tags.map((tag) => (
                        <li key={`${post.slug}-${tag}`}>
                          <span className="latest-posts__tag">{tag}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <ThemeModeControls />
      </section>
    </main>
  )
}
