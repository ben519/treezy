import { apply } from "../src/apply"
import { Node, UniformNode } from "../src/types"

describe("apply function", () => {
  // Basic test with a simple tree
  test("basic functionality with generic Node", () => {
    const tree: Node = {
      value: 1,
      children: [{ value: 2 }, { value: 3, children: [{ value: 4 }] }],
    }

    const multiplier = 2
    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        if (typeof node.value === "number") {
          node.value = node.value * multiplier
        }
      },
    })

    expect(result.value).toBe(2) // 1 * 2
    expect(result.children?.[0].value).toBe(4) // 2 * 2
    expect(result.children?.[1].value).toBe(6) // 3 * 2
    expect(result.children?.[1].children?.[0].value).toBe(8) // 4 * 2
  })

  // Test with UniformNode type
  test("functionality with UniformNode", () => {
    interface MyNodeProps {
      name: string
      count: number
    }

    const tree: UniformNode<"items", MyNodeProps> = {
      name: "root",
      count: 0,
      items: [
        { name: "item1", count: 1 },
        {
          name: "item2",
          count: 2,
          items: [{ name: "subitem1", count: 3 }],
        },
      ],
    }

    const result = apply(tree, {
      applyFn: (node) => {
        node.count += 10
      },
      childrenKey: "items",
    })

    expect(result.count).toBe(10) // 0 + 10
    expect(result.items?.[0].count).toBe(11) // 1 + 10
    expect(result.items?.[1].count).toBe(12) // 2 + 10
    expect(result.items?.[1].items?.[0].count).toBe(13) // 3 + 10
  })

  // Test with a custom test function
  test("test function filters nodes to be modified", () => {
    const tree: Node = {
      value: 1,
      children: [{ value: 2 }, { value: 3, children: [{ value: 4 }] }],
    }

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        if (typeof node.value === "number") {
          node.value = node.value * 2
        }
      },
      testFn: (node) => typeof node.value === "number" && node.value > 2,
    })

    expect(result.value).toBe(1) // Not modified (value <= 2)
    expect(result.children?.[0].value).toBe(2) // Not modified (value <= 2)
    expect(result.children?.[1].value).toBe(6) // Modified: 3 * 2
    expect(result.children?.[1].children?.[0].value).toBe(8) // Modified: 4 * 2
  })

  // Test with depth parameter
  test("depth parameter works correctly", () => {
    const tree: Node = {
      level: 0,
      children: [
        { level: 0 },
        {
          level: 0,
          children: [{ level: 0 }],
        },
      ],
    }

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node, _, depth = 0) => {
        node.level = depth
      },
    })

    expect(result.level).toBe(0)
    expect(result.children?.[0].level).toBe(1)
    expect(result.children?.[1].level).toBe(1)
    expect(result.children?.[1].children?.[0].level).toBe(2)
  })

  // Test with parent parameter
  test("parent parameter works correctly", () => {
    const tree: Node = {
      id: "root",
      parentId: null,
      children: [
        { id: "child1", parentId: null },
        {
          id: "child2",
          parentId: null,
          children: [{ id: "grandchild", parentId: null }],
        },
      ],
    }

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node, parent) => {
        node.parentId = parent ? parent.id : null
      },
    })

    expect(result.parentId).toBeNull()
    expect(result.children?.[0].parentId).toBe("root")
    expect(result.children?.[1].parentId).toBe("root")
    expect(result.children?.[1].children?.[0].parentId).toBe("child2")
  })

  // Test with copy option
  test("copy option creates a deep clone", () => {
    const tree: Node = {
      value: 1,
      children: [{ value: 2 }, { value: 3, children: [{ value: 4 }] }],
    }

    const originalTree = structuredClone(tree)

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        if (typeof node.value === "number") {
          node.value = node.value * 2
        }
      },
      copy: true,
    })

    // Check original tree remains unchanged
    expect(tree).toEqual(originalTree)

    // Check result tree is modified
    expect(result.value).toBe(2)
    expect(result.children?.[0].value).toBe(4)
    expect(result.children?.[1].value).toBe(6)
    expect(result.children?.[1].children?.[0].value).toBe(8)
  })

  // Test with custom children key
  test("custom children key works correctly", () => {
    const tree = {
      value: "root",
      items: [
        { value: "item1" },
        {
          value: "item2",
          items: [{ value: "subitem" }],
        },
      ],
    }

    const result = apply(tree, {
      applyFn: (node) => {
        node.value = `modified-${node.value}`
      },
      childrenKey: "items",
    })

    expect(result.value).toBe("modified-root")
    expect(result.items?.[0].value).toBe("modified-item1")
    expect(result.items?.[1].value).toBe("modified-item2")
    expect(result.items?.[1].items?.[0].value).toBe("modified-subitem")
  })

  // Test with empty tree
  test("handles leaf nodes correctly", () => {
    const tree: Node = {
      value: "leaf",
      // No children
    }

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        node.processed = true
      },
    })

    expect(result.value).toBe("leaf")
    expect(result.processed).toBe(true)
  })

  // Test with empty children array
  test("handles empty children array", () => {
    const tree: Node = {
      value: "parent",
      children: [], // Empty array
    }

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        node.processed = true
      },
    })

    expect(result.value).toBe("parent")
    expect(result.processed).toBe(true)
    expect(result.children).toEqual([])
  })

  // Test with complex nested structure
  test("handles complex nested structure", () => {
    const tree: Node = {
      id: "root",
      children: [
        {
          id: "branch1",
          children: [
            { id: "leaf1" },
            {
              id: "subbranch1",
              children: [{ id: "leaf2" }, { id: "leaf3" }],
            },
          ],
        },
        {
          id: "branch2",
          children: [{ id: "leaf4" }],
        },
      ],
    }

    let nodeCount = 0

    apply(tree, {
      childrenKey: "children",
      applyFn: () => {
        nodeCount++
      },
    })

    expect(nodeCount).toBe(8) // Total number of nodes in the tree
  })
})
