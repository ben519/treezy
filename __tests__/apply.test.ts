import { apply } from "../src/apply"
import { Node, UniformNode } from "../src/types"

describe("apply function", () => {
  // Basic test with a simple tree
  test("basic functionality with generic Node", () => {
    const tree: Node<"children"> = {
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
        return node
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
        return node
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
    const tree: Node<"children"> = {
      value: 1,
      children: [{ value: 2 }, { value: 3, children: [{ value: 4 }] }],
    }

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        if (typeof node.value === "number") {
          node.value = node.value * 2
        }
        return node
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
    const tree: Node<"children"> = {
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
        return node
      },
    })

    expect(result.level).toBe(0)
    expect(result.children?.[0].level).toBe(1)
    expect(result.children?.[1].level).toBe(1)
    expect(result.children?.[1].children?.[0].level).toBe(2)
  })

  // Test with parent parameter
  test("parent parameter works correctly", () => {
    const tree: Node<"children"> = {
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
        return node
      },
    })

    expect(result.parentId).toBeNull()
    expect(result.children?.[0].parentId).toBe("root")
    expect(result.children?.[1].parentId).toBe("root")
    expect(result.children?.[1].children?.[0].parentId).toBe("child2")
  })

  // Test with copy option
  test("copy option creates a deep clone", () => {
    const tree: Node<"children"> = {
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
        return node
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
        return node
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
    const tree: Node<"children"> = {
      value: "leaf",
      // No children
    }

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        node.processed = true
        return node
      },
    })

    expect(result.value).toBe("leaf")
    expect(result.processed).toBe(true)
  })

  // Test with empty children array
  test("handles empty children array", () => {
    const tree: Node<"children"> = {
      value: "parent",
      children: [], // Empty array
    }

    const result = apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        node.processed = true
        return node
      },
    })

    expect(result.value).toBe("parent")
    expect(result.processed).toBe(true)
    expect(result.children).toEqual([])
  })

  // Test with complex nested structure
  test("handles complex nested structure", () => {
    const tree: Node<"children"> = {
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

    // This example annoys me. It should be possible to do
    // applyFn: () => { nodeCount++ }
    // In general, when the applyFn returns void, its arguments
    // should be immutable and the return value of apply() should be
    // type TInputNode. But getting this to work properly with TS
    // is hard, particularly because function overload ignores
    // a parameter function's return type in picking a matching signature
    apply(tree, {
      childrenKey: "children",
      applyFn: (node) => {
        nodeCount++
        return node
      },
    })

    expect(nodeCount).toBe(8) // Total number of nodes in the tree
  })

  // Test with direct circular reference (parent to child and back)
  test("throws error with direct circular reference", () => {
    const parent: Node<"children"> = {
      value: "parent",
      children: [],
    }

    const child: Node<"children"> = {
      value: "child",
      children: [],
    }

    // Create circular reference
    parent.children = [child]
    child.children = [parent] // This creates a circle

    expect(() => {
      apply(parent, {
        childrenKey: "children",
        applyFn: (node) => {
          node.processed = true
          return node
        },
      })
    }).toThrow("Circular reference detected")
  })

  // Test with indirect circular reference (longer cycle)
  test("throws error with indirect circular reference", () => {
    const node1: Node<"children"> = {
      value: "node1",
      children: [],
    }

    const node2: Node<"children"> = {
      value: "node2",
      children: [],
    }

    const node3: Node<"children"> = {
      value: "node3",
      children: [],
    }

    // Create a longer cycle: node1 -> node2 -> node3 -> node1
    node1.children = [node2]
    node2.children = [node3]
    node3.children = [node1] // This completes the circle

    expect(() => {
      apply(node1, {
        childrenKey: "children",
        applyFn: (node) => {
          node.processed = true
          return node
        },
      })
    }).toThrow("Circular reference detected")
  })

  // Test that copy option doesn't help with circular references
  test("throws error with circular reference even with copy option", () => {
    const parent: Node<"children"> = {
      value: "parent",
      children: [],
    }

    const child: Node<"children"> = {
      value: "child",
      children: [parent], // Circular reference
    }

    parent.children = [child]

    expect(() => {
      apply(parent, {
        childrenKey: "children",
        applyFn: (node) => node,
        copy: true, // Even with copy option
      })
    }).toThrow("Circular reference detected")
  })

  describe("apply function with firstOnly option", () => {
    // Test firstOnly parameter with testFn
    test("firstOnly applies transformation only to first matching node", () => {
      const tree: Node<"children"> = {
        value: 1,
        children: [{ value: 2 }, { value: 3, children: [{ value: 4 }] }],
      }

      let modificationCount = 0

      const result = apply(tree, {
        childrenKey: "children",
        applyFn: (node) => {
          if (typeof node.value === "number") {
            node.value = node.value * 10
            modificationCount++
          }
          return node
        },
        testFn: (node) => typeof node.value === "number" && node.value > 1,
        firstOnly: true,
      })

      // Only the first node with value > 1 should be modified
      expect(modificationCount).toBe(1)
      expect(result.value).toBe(1) // Root not modified (value = 1)
      expect(result.children?.[0].value).toBe(20) // Modified: 2 * 10
      expect(result.children?.[1].value).toBe(3) // Not modified
      expect(result.children?.[1].children?.[0].value).toBe(4) // Not modified
    })

    // Test firstOnly parameter without testFn (should modify only root node)
    test("firstOnly without testFn applies transformation only to root node", () => {
      const tree: Node<"children"> = {
        value: "root",
        children: [
          { value: "child1" },
          { value: "child2", children: [{ value: "grandchild" }] },
        ],
      }

      let modificationCount = 0

      const result = apply(tree, {
        childrenKey: "children",
        applyFn: (node) => {
          node.modified = true
          modificationCount++
          return node
        },
        firstOnly: true,
      })

      expect(modificationCount).toBe(1)
      expect(result.modified).toBe(true)
      expect(result.children?.[0].modified).toBeUndefined()
      expect(result.children?.[1].modified).toBeUndefined()
      expect(result.children?.[1].children?.[0].modified).toBeUndefined()
    })

    // Test firstOnly with depth-first traversal
    test("firstOnly respects depth-first traversal", () => {
      const tree: UniformNode<
        "children",
        { id: string; level: number; modified?: boolean }
      > = {
        id: "root",
        level: 0,
        children: [
          {
            id: "branch1",
            level: 1,
            children: [
              { id: "leaf1", level: 2 },
              { id: "leaf2", level: 2 },
            ],
          },
          {
            id: "branch2",
            level: 1,
            children: [{ id: "leaf3", level: 2 }],
          },
        ],
      }

      let lastModifiedId: string | null = null

      const result = apply<
        "children",
        { id: string; level: number },
        UniformNode<
          "children",
          { id: string; level: number; modified?: boolean }
        >,
        UniformNode<
          "children",
          {
            id: string
            level: number
            modified?: boolean
          }
        >
      >(tree, {
        childrenKey: "children",
        applyFn: (node) => {
          node["modified"] = true
          lastModifiedId = node.id
          return node
        },
        testFn: (node) => node.level === 2,
        firstOnly: true,
      })

      // The first level-2 node in depth-first traversal is "leaf1"
      expect(lastModifiedId).toBe("leaf1")

      // Only "leaf1" should be modified
      // @ts-ignore
      expect(result.modified).toBeUndefined()
      // @ts-ignore
      expect(result.children?.[0].modified).toBeUndefined()
      // @ts-ignore
      expect(result.children?.[0].children?.[0].modified).toBe(true)
      // @ts-ignore
      expect(result.children?.[0].children?.[1].modified).toBeUndefined()
      // @ts-ignore
      expect(result.children?.[1].children?.[0].modified).toBeUndefined()
    })

    // Test firstOnly with copy option
    test("firstOnly works with copy option", () => {
      const tree = {
        value: 5,
        children: [{ value: 10 }, { value: 15, children: [{ value: 20 }] }],
      }

      const originalTree = structuredClone(tree)

      const result = apply(tree, {
        childrenKey: "children",
        applyFn: (node) => {
          if (typeof node.value === "number") {
            node.value = node.value * 2
          }
          return node
        },
        testFn: (node) => typeof node.value === "number" && node.value > 5,
        firstOnly: true,
        copy: true,
      })

      // Original tree should be unchanged
      expect(tree).toEqual(originalTree)

      // Only the first node with value > 5 should be modified
      expect(result.value).toBe(5)
      expect(result.children?.[0].value).toBe(20) // Modified: 10 * 2
      expect(result.children?.[1].value).toBe(15) // Not modified
      expect(result.children?.[1].children?.[0].value).toBe(20) // Not modified
    })

    // Test with no matching nodes
    test("firstOnly works correctly when no nodes match testFn", () => {
      const tree = {
        value: 1,
        children: [{ value: 2 }, { value: 3, children: [{ value: 4 }] }],
      }

      let modificationCount = 0

      const result = apply(tree, {
        childrenKey: "children",
        applyFn: (node) => {
          if (typeof node.value === "number") {
            node.value = node.value * 10
            modificationCount++
          }
          return node
        },
        testFn: (node) => typeof node.value === "number" && node.value > 100,
        firstOnly: true,
      })

      // No nodes should be modified
      expect(modificationCount).toBe(0)
      expect(result.value).toBe(1)
      expect(result.children?.[0].value).toBe(2)
      expect(result.children?.[1].value).toBe(3)
      expect(result.children?.[1].children?.[0].value).toBe(4)
    })

    // Test with firstOnly false behaves like original function
    test("function behaves normally when firstOnly is false", () => {
      const tree = {
        value: 1,
        children: [{ value: 2 }, { value: 3, children: [{ value: 4 }] }],
      }

      let modificationCount = 0

      const result = apply(tree, {
        childrenKey: "children",
        applyFn: (node) => {
          if (typeof node.value === "number" && node.value > 1) {
            node.value = node.value * 10
            modificationCount++
          }
          return node
        },
        firstOnly: false, // Explicitly set to false
      })

      // All matching nodes should be modified
      expect(modificationCount).toBe(3)
      expect(result.value).toBe(1)
      expect(result.children?.[0].value).toBe(20)
      expect(result.children?.[1].value).toBe(30)
      expect(result.children?.[1].children?.[0].value).toBe(40)
    })
  })
})
