---
title: "Next App Router Foundation"
description: "The App Router gives the blog a static-first page model while keeping room for future post routes."
date: "2026-06-24"
tags: ["nextjs", "architecture", "static-export"]
category: "engineering"
draft: false
pinned: false
---

The App Router works well for this project because the blog is mostly static and can be generated from local content.

Server components can read the post index directly, which keeps the client bundle small.

## Route map

| Route | Responsibility | Rendering |
| --- | --- | --- |
| `/` | Home and latest posts | Static |
| `/posts` | Full post list | Static |
| `/posts/[slug]` | Post detail | Static params |

The route tree should stay small until the content model proves it needs more surfaces.

```tsx
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = findPostBySlug(slug)

  if (post === undefined) {
    notFound()
  }

  return <MarkdownContent html={await renderMarkdownToHtml(post.content)} />
}
```

The page can remain a server component because the Markdown rendering does not need client-side state.
