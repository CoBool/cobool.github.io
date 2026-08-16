import { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize"
import { MERMAID_CLASS_NAME } from "../diagrams"
import { MATH_CODE_FENCE_MARKER } from "./math"

const mathClassAttribute: [string, string, string] = ["className", "math-inline", "math-display"]
const mathCodeFenceMarkerAttribute: [string] = [MATH_CODE_FENCE_MARKER]
const { code: defaultCodeAttributes = [] } = defaultSchema.attributes ?? {}
const { pre: defaultPreAttributes = [] } = defaultSchema.attributes ?? {}

/**
 * 마크다운 HTML 새니타이즈 스키마
 * KaTeX 수식 클래스, Mermaid 다이어그램 클래스 및 수식 코드 펜스 마커를 허용합니다.
 */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...defaultCodeAttributes, mathClassAttribute, mathCodeFenceMarkerAttribute],
    pre: [...defaultPreAttributes, ["className", MERMAID_CLASS_NAME]],
  },
  // raw HTML 이 트리에 없어 clobber 가 지킬 대상이 없고, 접두하면 각주 앵커가 어긋난다.
  clobber: [],
} satisfies SanitizeSchema
