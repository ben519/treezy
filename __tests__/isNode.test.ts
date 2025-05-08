import { isNode } from "../src/isNode"

describe("isNode (with type narrowing)", () => {
  const options = { childrenKey: "children" }

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
})
