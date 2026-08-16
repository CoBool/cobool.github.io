type JsonLdProps = Readonly<{
  data: Record<string, unknown>
}>

export function JsonLd({ data }: JsonLdProps) {
  return (
    // JSON.stringify는 "</script>"를 이스케이프하지 않는다. 값에 그 문자열이 섞이면
    // 브라우저가 스크립트를 거기서 끊어버리므로 "<"를 직접 이스케이프해 둔다.
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD는 마크업이 아니라 직렬화된 데이터라 sanitize 대상이 아니다.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll("<", "\\u003c") }}
      type="application/ld+json"
    />
  )
}
