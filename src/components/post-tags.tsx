type PostTagsProps = Readonly<{
  ariaLabel: string
  tags: readonly string[]
}>

export function PostTags({ ariaLabel, tags }: PostTagsProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <ul aria-label={ariaLabel} className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <a
            className="inline-flex rounded-sm border border-border bg-muted px-2 py-1 font-mono text-xs font-semibold leading-[1.4] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`/tags/${encodeURIComponent(tag)}/`}
          >
            {tag}
          </a>
        </li>
      ))}
    </ul>
  )
}
