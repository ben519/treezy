import { isNode } from "../src/isNode"
import { Node } from "../src/types"

describe("isNode", () => {
  const childrenKey = "children" as const
  const baseOptions = { childrenKey }
  const options = { childrenKey: "children" }
  type TestNode = Node<typeof childrenKey>

  it("narrows the type of a valid leaf node", () => {
    const maybeNode: unknown = { name: "Leaf" }

    if (isNode(maybeNode, options)) {
      // Now TypeScript knows maybeNode is a Node<"children">
      expect(typeof maybeNode.name).toBe("string")
      expect(maybeNode.children).toBeUndefined()
    } else {
      fail("Expected value to be a Node")
    }
  })

  it("narrows the type of a node with children", () => {
    const maybeNode: unknown = {
      name: "Parent",
      children: [{ name: "Child" }],
    }

    if (isNode(maybeNode, options)) {
      expect(Array.isArray(maybeNode.children)).toBe(true)
      expect(maybeNode.children?.[0]).toHaveProperty("name", "Child")
    } else {
      fail("Expected value to be a Node")
    }
  })

  it("narrows correctly with custom childrenKey", () => {
    const customOptions = { childrenKey: "nodes" }
    const maybeNode: unknown = {
      name: "CustomRoot",
      nodes: [{ name: "CustomChild" }],
    }

    if (isNode(maybeNode, customOptions)) {
      expect(maybeNode.nodes?.[0]).toHaveProperty("name", "CustomChild")
    } else {
      fail("Expected value to be a Node with custom key")
    }
  })

  it("rejects an invalid node and avoids unsafe access", () => {
    const maybeNode: unknown = {
      name: "BadNode",
      children: "not-an-array",
    }

    expect(isNode(maybeNode, options)).toBe(false)

    // TypeScript will not narrow the type here,
    // so we don't accidentally access maybeNode.children as an array
    if (isNode(maybeNode, options)) {
      fail("Invalid node should not have passed the type guard")
    }
  })

  it("returns true for a valid node without children", () => {
    const node = { name: "Root" }
    expect(isNode(node, baseOptions)).toBe(true)
  })

  it("returns true for a valid node with valid children", () => {
    const node: TestNode = {
      name: "Root",
      children: [{ name: "Child" }],
    }
    expect(isNode(node, baseOptions)).toBe(true)
  })

  it("returns false if children is not an array", () => {
    const node = {
      name: "Root",
      children: "not-an-array",
    }
    expect(isNode(node, baseOptions)).toBe(false)
  })

  it("returns false for a child that is not a valid node", () => {
    const node = {
      name: "Root",
      children: [null, { name: "Valid Child" }],
    }
    expect(isNode(node, baseOptions)).toBe(false)
  })

  it("detects circular reference and throws by default (checkForCircularReference = true)", () => {
    const a: any = { name: "A" }
    const b: any = { name: "B", children: [a] }
    a.children = [b] // Circular reference

    expect(() => isNode(a, baseOptions)).toThrow(
      "Circular reference detected in tree."
    )
  })

  it("returns false for non-object input", () => {
    expect(isNode(null, baseOptions)).toBe(false)
    expect(isNode("string", baseOptions)).toBe(false)
    expect(isNode(123, baseOptions)).toBe(false)
  })
})
