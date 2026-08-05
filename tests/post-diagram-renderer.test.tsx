// @vitest-environment happy-dom
import { act, cleanup, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PostDiagramRenderer } from "../src/features/post-diagram/post-diagram-renderer"

const CONTAINER_ID = "post-markdown-content-test"
const DIAGRAM_SOURCE = "graph TD;\n  A-->B;"

const mermaidMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  render: vi.fn(async (id: string) => ({ svg: `<svg data-render-id="${id}"></svg>` })),
}))

vi.mock("mermaid", () => ({ default: mermaidMock }))

/** happy-dom 에는 레이아웃이 없어 교차 판정이 일어나지 않는다. 발화 시점을 직접 제어한다. */
class ControllableIntersectionObserver implements IntersectionObserver {
  static instances: ControllableIntersectionObserver[] = []

  readonly root = null
  readonly rootMargin: string
  readonly thresholds = [0]
  readonly observed: Element[] = []
  disconnectCount = 0

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.rootMargin = options?.rootMargin ?? ""
    ControllableIntersectionObserver.instances.push(this)
  }

  observe(target: Element): void {
    this.observed.push(target)
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnectCount += 1
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  enterViewport(): void {
    const entries = this.observed.map(
      (target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry,
    )

    this.callback(entries, this)
  }
}

describe("post diagram rendering", () => {
  beforeEach(() => {
    ControllableIntersectionObserver.instances = []
    mermaidMock.initialize.mockClear()
    mermaidMock.render.mockClear()
    mermaidMock.render.mockImplementation(async (id: string) => ({
      svg: `<svg data-render-id="${id}"></svg>`,
    }))
    vi.stubGlobal("IntersectionObserver", ControllableIntersectionObserver)
    document.documentElement.className = ""
    document.body.innerHTML = ""
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it("Given a diagram below the fold When the page loads Then mermaid is not loaded yet", async () => {
    placeDiagram()
    render(<PostDiagramRenderer containerId={CONTAINER_ID} />)

    await settle()

    expect(mermaidMock.initialize).not.toHaveBeenCalled()
    expect(mermaidMock.render).not.toHaveBeenCalled()
  })

  it("Given a diagram that comes into view When observed Then renders it and stops watching visibility", async () => {
    const diagram = placeDiagram()
    render(<PostDiagramRenderer containerId={CONTAINER_ID} />)

    await enterViewport()

    expect(mermaidMock.render).toHaveBeenCalledTimes(1)
    expect(diagram.innerHTML).toContain("<svg")
    expect(diagram.getAttribute("data-diagram-state")).toBe("rendered")
    expect(diagram.getAttribute("role")).toBe("img")
    expect(diagram.hasAttribute("aria-busy")).toBe(false)
    expect(visibilityObserver().disconnectCount).toBeGreaterThan(0)
  })

  it("Given the observer options When created Then it starts before the diagram reaches the viewport", () => {
    placeDiagram()
    render(<PostDiagramRenderer containerId={CONTAINER_ID} />)

    expect(visibilityObserver().rootMargin).toBe("400px")
  })

  it("Given a rendered diagram When the dark class is toggled Then it renders again with the new theme", async () => {
    placeDiagram()
    render(<PostDiagramRenderer containerId={CONTAINER_ID} />)
    await enterViewport()

    expect(mermaidMock.initialize).toHaveBeenLastCalledWith(
      expect.objectContaining({ theme: "default" }),
    )

    await act(async () => {
      document.documentElement.classList.add("dark")
      await settle()
    })

    expect(mermaidMock.render).toHaveBeenCalledTimes(2)
    expect(mermaidMock.initialize).toHaveBeenLastCalledWith(
      expect.objectContaining({ theme: "dark" }),
    )
  })

  it("Given a rendered diagram When an unrelated class changes Then it does not render again", async () => {
    placeDiagram()
    render(<PostDiagramRenderer containerId={CONTAINER_ID} />)
    await enterViewport()

    await act(async () => {
      document.documentElement.classList.add("some-unrelated-class")
      await settle()
    })

    expect(mermaidMock.render).toHaveBeenCalledTimes(1)
  })

  it("Given invalid diagram syntax When rendering Then keeps the source visible and announces the failure", async () => {
    mermaidMock.render.mockRejectedValue(new Error("Parse error"))
    const diagram = placeDiagram()
    const { container } = render(<PostDiagramRenderer containerId={CONTAINER_ID} />)

    await enterViewport()

    expect(diagram.textContent).toBe(DIAGRAM_SOURCE)
    expect(diagram.getAttribute("data-diagram-state")).toBe("error")
    expect(diagram.getAttribute("role")).toBe("region")
    expect(container.textContent).toContain("일부 다이어그램을 표시하지 못해")
  })

  it("Given a diagram already rendered When a later theme render fails Then the good render is kept", async () => {
    const diagram = placeDiagram()
    render(<PostDiagramRenderer containerId={CONTAINER_ID} />)
    await enterViewport()

    expect(diagram.getAttribute("data-diagram-state")).toBe("rendered")

    mermaidMock.initialize.mockImplementationOnce(() => {
      throw new Error("initialize failed")
    })
    await act(async () => {
      document.documentElement.classList.add("dark")
      await settle()
    })

    expect(diagram.getAttribute("data-diagram-state")).toBe("rendered")
    expect(diagram.innerHTML).toContain("<svg")
  })

  it("Given no diagrams in the container When mounting Then it never observes anything", async () => {
    const container = document.createElement("div")

    container.id = CONTAINER_ID
    document.body.append(container)
    render(<PostDiagramRenderer containerId={CONTAINER_ID} />)

    await settle()

    expect(ControllableIntersectionObserver.instances).toHaveLength(0)
  })
})

function placeDiagram(): HTMLPreElement {
  const container = document.createElement("div")
  const diagram = document.createElement("pre")

  container.id = CONTAINER_ID
  diagram.className = "mermaid"
  diagram.textContent = DIAGRAM_SOURCE
  container.append(diagram)
  document.body.append(container)

  return diagram
}

function visibilityObserver(): ControllableIntersectionObserver {
  const [observer] = ControllableIntersectionObserver.instances

  if (observer === undefined) {
    throw new Error("Expected the renderer to observe diagram visibility")
  }

  return observer
}

async function enterViewport(): Promise<void> {
  await act(async () => {
    visibilityObserver().enterViewport()
    await settle()
  })
}

/**
 * 관찰자 콜백과 렌더 큐가 모두 소진될 때까지 기다린다. 동적 import 가 매크로태스크에서 풀리므로
 * 마이크로태스크만 비우면 렌더가 아직 시작되지 않은 상태를 완료로 오인한다.
 */
async function settle(): Promise<void> {
  for (let round = 0; round < 5; round += 1) {
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
  }
}
