"use client"

import { useEffect, useId, useState } from "react"
import { getResolvedTheme, observeResolvedTheme } from "@/features/theme/theme-controller"

type PostDiagramRendererProps = Readonly<{
  containerId: string
}>

type DiagramSource = Readonly<{
  element: HTMLPreElement
  source: string
}>

type MermaidTheme = "dark" | "default"

/** 다이어그램이 화면에 들어오기 전에 미리 시작해, 커진 뒤의 모습으로 도착하게 한다. */
const DIAGRAM_PRELOAD_MARGIN = "400px"

export function PostDiagramRenderer({ containerId }: PostDiagramRendererProps) {
  const idPrefix = useId().replaceAll(":", "")
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const container = document.getElementById(containerId)

    if (container === null) {
      return
    }

    const diagrams = Array.from(
      container.querySelectorAll<HTMLPreElement>("pre.mermaid"),
      (element) =>
        ({
          element,
          source: element.textContent ?? "",
        }) satisfies DiagramSource,
    )

    if (diagrams.length === 0) {
      return
    }

    let active = true
    let renderSequence = 0
    let renderedTheme: MermaidTheme | undefined
    let renderQueue = Promise.resolve()
    let stopObservingTheme: (() => void) | undefined

    // mermaid 는 "light" 대신 "default" 라는 이름을 쓰므로 여기서만 이름을 바꾼다.
    const currentTheme = (): MermaidTheme => (getResolvedTheme() === "dark" ? "dark" : "default")

    const markAsFailed = (diagram: DiagramSource) => {
      diagram.element.textContent = diagram.source
      diagram.element.setAttribute("data-diagram-state", "error")
      diagram.element.setAttribute("aria-label", "Mermaid diagram source; rendering failed")
      diagram.element.setAttribute("role", "region")
      diagram.element.removeAttribute("aria-busy")
    }

    const render = async () => {
      const { default: mermaid } = await import("mermaid")
      const theme = currentTheme()
      let failed = false

      mermaid.initialize({
        securityLevel: "strict",
        startOnLoad: false,
        suppressErrorRendering: true,
        theme,
      })

      for (const diagram of diagrams) {
        renderSequence += 1
        diagram.element.setAttribute("aria-busy", "true")

        try {
          const { bindFunctions, svg } = await mermaid.render(
            `${idPrefix}-diagram-${renderSequence}`,
            diagram.source,
          )

          if (!active) {
            return
          }

          diagram.element.innerHTML = svg
          diagram.element.setAttribute("data-diagram-state", "rendered")
          diagram.element.setAttribute("aria-label", "Mermaid diagram")
          diagram.element.setAttribute("role", "img")
          bindFunctions?.(diagram.element)
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error
          }

          failed = true
          markAsFailed(diagram)
        } finally {
          diagram.element.removeAttribute("aria-busy")
        }
      }

      if (active) {
        renderedTheme = theme
        setHasError(failed)
      }
    }

    const scheduleRender = () => {
      renderQueue = renderQueue.then(render).catch(() => {
        if (!active) {
          return
        }

        // 테마 전환 중 실패했다면 이미 그려진 다이어그램은 그대로 두고 나머지만 원문으로 되돌린다.
        for (const diagram of diagrams) {
          if (diagram.element.getAttribute("data-diagram-state") !== "rendered") {
            markAsFailed(diagram)
          }
        }

        setHasError(true)
      })
    }

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return
        }

        visibilityObserver.disconnect()
        stopObservingTheme = observeResolvedTheme(() => {
          if (currentTheme() !== renderedTheme) {
            scheduleRender()
          }
        })
        scheduleRender()
      },
      { rootMargin: DIAGRAM_PRELOAD_MARGIN },
    )

    for (const diagram of diagrams) {
      visibilityObserver.observe(diagram.element)
    }

    return () => {
      active = false
      visibilityObserver.disconnect()
      stopObservingTheme?.()
    }
  }, [containerId, idPrefix])

  return (
    <p className="sr-only" data-diagram-renderer="true" role="status">
      {hasError ? "일부 다이어그램을 표시하지 못해 원문을 유지했습니다." : null}
    </p>
  )
}
