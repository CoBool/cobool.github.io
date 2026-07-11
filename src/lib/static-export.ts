export const STATIC_EXPORT_PLACEHOLDER = "__empty__"

export function withStaticExportPlaceholder<T>(params: T[], placeholder: T): T[] {
  return params.length > 0 ? params : [placeholder]
}
