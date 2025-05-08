import { isNodeLeafNode } from "../src/isNodeLeafNode"
import { Node } from "../src/types"

describe("isNodeLeafNode", () => {
  const childrenKey = "children" as const

  it("returns true for a node with undefined children", () => {
    const node: Node = {}
    expect(isNodeLeafNode(node, { childrenKey })).toBe(true)
  })

  it("returns true for a node with an empty array as children", () => {
    const node: Node = { children: [] }
    expect(isNodeLeafNode(node, { childrenKey })).toBe(true)
  })

  it("returns false for a node with non-empty children array", () => {
    const node: Node = { children: [{}] }
    expect(isNodeLeafNode(node, { childrenKey })).toBe(false)
  })

  it("returns false for a node with a non-array children value", () => {
    const node: Node = { children: "not-an-array" as unknown as Node[] }
    expect(isNodeLeafNode(node, { childrenKey })).toBe(false)
  })

  it("returns true for a custom childrenKey with undefined children", () => {
    const node: Node<"nodes"> = {}
    expect(isNodeLeafNode(node, { childrenKey: "nodes" })).toBe(true)
  })

  it("returns true for a custom childrenKey with empty array", () => {
    const node: Node<"nodes"> = { nodes: [] }
    expect(isNodeLeafNode(node, { childrenKey: "nodes" })).toBe(true)
  })

  it("returns false for a custom childrenKey with children present", () => {
    const node: Node<"nodes"> = { nodes: [{}] }
    expect(isNodeLeafNode(node, { childrenKey: "nodes" })).toBe(false)
  })
})
