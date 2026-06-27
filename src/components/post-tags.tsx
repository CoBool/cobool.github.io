type PostTagsProps = Readonly<{
  labelledBy: string
  tags: readonly string[]
}>

export function PostTags({ labelledBy, tags }: PostTagsProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <ul aria-label={labelledBy} className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <span className="inline-flex rounded-sm border border-border bg-muted px-2 py-1 font-mono text-xs font-semibold leading-[1.4] text-muted-foreground">
            {tag}
          </span>
        </li>
      ))}
    </ul>
  )
}
