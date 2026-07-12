"use client"

import { useEffect, useId, useState } from "react"

type PostDiagramRendererProps = Readonly<{
  containerId: string
}>

type DiagramSource = Readonly<{
  element: HTMLPreElement
  source: string
}>

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
    let renderQueue = Promise.resolve()

    const render = async () => {
      const { default: mermaid } = await import("mermaid")
      const theme = document.documentElement.classList.contains("dark") ? "dark" : "default"
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
          diagram.element.textContent = diagram.source
          diagram.element.setAttribute("data-diagram-state", "error")
          diagram.element.setAttribute("aria-label", "Mermaid diagram source; rendering failed")
          diagram.element.setAttribute("role", "region")
        } finally {
          diagram.element.removeAttribute("aria-busy")
        }
      }

      if (active) {
        setHasError(failed)
      }
    }

    const scheduleRender = () => {
      renderQueue = renderQueue.then(render).catch(() => {
        if (!active) {
          return
        }

        for (const diagram of diagrams) {
          diagram.element.textContent = diagram.source
          diagram.element.setAttribute("data-diagram-state", "error")
          diagram.element.setAttribute("aria-label", "Mermaid diagram source; rendering failed")
          diagram.element.setAttribute("role", "region")
          diagram.element.removeAttribute("aria-busy")
        }

        setHasError(true)
      })
    }

    const observer = new MutationObserver(() => {
      scheduleRender()
    })

    observer.observe(document.documentElement, { attributeFilter: ["class"], attributes: true })
    scheduleRender()

    return () => {
      active = false
      observer.disconnect()
    }
  }, [containerId, idPrefix])

  return (
    <p className="sr-only" data-diagram-renderer="true" role="status">
      {hasError ? "일부 다이어그램을 표시하지 못해 원문을 유지했습니다." : null}
    </p>
  )
}
