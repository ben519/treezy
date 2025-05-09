import { getValues } from "../src/getValues"
import { UniformNode } from "../src/types"

describe("getValues function", () => {
  // Basic tree structure for testing
  const basicTree = {
    id: 1,
    name: "root",
    children: [
      {
        id: 2,
        name: "child1",
        children: [
          {
            id: 4,
            name: "grandchild1",
          },
          {
            id: 5,
            name: "grandchild2",
          },
        ],
      },
      {
        id: 3,
        name: "child2",
      },
    ],
  }

  // Tree with custom children key
  const customKeyTree = {
    id: 1,
    name: "root",
    items: [
      {
        id: 2,
        name: "child1",
        items: [
          {
            id: 4,
            name: "grandchild1",
          },
        ],
      },
    ],
  }

  // Define a uniform node type for type testing
  type MyUniformNode = UniformNode<"children", { id: number; name: string }>

  const typedTree: MyUniformNode = {
    id: 1,
    name: "root",
    children: [
      {
        id: 2,
        name: "child1",
      },
    ],
  }

  // Empty tree and single node tree for edge cases
  const emptyTree = {}
  const singleNodeTree = { id: 1, name: "single" }

  test("collects all nodes by default", () => {
    const result = getValues(basicTree, { childrenKey: "children" })
    expect(result).toHaveLength(5)
    expect(result).toEqual([
      basicTree,
      basicTree.children![0],
      basicTree.children![0].children![0],
      basicTree.children![0].children![1],
      basicTree.children![1],
    ])
  })

  test("applies testFn to filter nodes", () => {
    const result = getValues(basicTree, {
      childrenKey: "children",
      testFn: (x) => x.id % 2 === 1,
    })
    expect(result).toHaveLength(3)
    expect(result.map((node) => node.id)).toEqual([1, 5, 3])
  })

  test("applies getFn to transform nodes", () => {
    const result = getValues(basicTree, {
      childrenKey: "children",
      getFn: (node) => node.name,
    })

    expect(result).toEqual([
      "root",
      "child1",
      "grandchild1",
      "grandchild2",
      "child2",
    ])
  })

  test("combines testFn and getFn", () => {
    const result = getValues(basicTree, {
      childrenKey: "children",
      testFn: (x) => x.id % 2 === 0, // Only even IDs
      getFn: (node) => node.name,
    })
    expect(result).toEqual(["child1", "grandchild1"])
  })

  test("works with custom children key", () => {
    const result = getValues(customKeyTree, {
      childrenKey: "items",
      getFn: (node) => node.name,
    })
    expect(result).toEqual(["root", "child1", "grandchild1"])
  })

  test("handles empty tree", () => {
    const result = getValues(emptyTree, { childrenKey: "children" })
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(emptyTree)
  })

  test("handles single node tree (no children)", () => {
    const result = getValues(singleNodeTree, { childrenKey: "children" })
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(singleNodeTree)
  })

  test("provides parent in testFn and getFn", () => {
    const parents: any[] = []
    getValues(basicTree, {
      childrenKey: "children",
      testFn: (node, parent) => {
        if (parent) parents.push({ child: node.id, parent: parent.id })
        return false
      },
    })
    expect(parents).toHaveLength(4)
    expect(parents).toContainEqual({ child: 2, parent: 1 })
    expect(parents).toContainEqual({ child: 3, parent: 1 })
    expect(parents).toContainEqual({ child: 4, parent: 2 })
    expect(parents).toContainEqual({ child: 5, parent: 2 })
  })

  test("provides depth in testFn and getFn", () => {
    const depths: any[] = []
    getValues(basicTree, {
      childrenKey: "children",
      testFn: (node, parent, depth) => {
        depths.push({ id: node.id, depth })
        return false
      },
    })
    expect(depths).toEqual([
      { id: 1, depth: 0 },
      { id: 2, depth: 1 },
      { id: 4, depth: 2 },
      { id: 5, depth: 2 },
      { id: 3, depth: 1 },
    ])
  })

  test("creates deep copy when copy option is true", () => {
    const original = { ...basicTree }
    const result = getValues(basicTree, { childrenKey: "children", copy: true })

    // Modify the first result
    if (result[0].children && result[0].children.length > 0) {
      result[0].children[0].name = "modified"
    }

    // Original should not be affected
    expect(basicTree.children![0].name).toBe("child1")
  })

  test("does not create copy by default", () => {
    const result = getValues(basicTree, { childrenKey: "children" })

    // Modify the first result
    if (result[0].children && result[0].children.length > 0) {
      result[0].children[0].name = "modified"
    }

    // Original should be affected
    expect(basicTree.children![0].name).toBe("modified")

    // Reset for other tests
    basicTree.children![0].name = "child1"
  })

  // Type-specific tests
  test("works with TypeScript UniformNode type", () => {
    const result = getValues<"children", { id: number; name: string }>(
      typedTree,
      { childrenKey: "children" }
    )
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(1)
    expect(result[1].id).toBe(2)
  })

  test("handles tree with empty children array", () => {
    const treeWithEmptyChildren = {
      id: 1,
      name: "root",
      children: [],
    }

    const result = getValues(treeWithEmptyChildren, { childrenKey: "children" })
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(treeWithEmptyChildren)
  })

  test("throws error on direct circular reference", () => {
    // Create a tree with a direct circular reference
    const circularTree: any = {
      id: 1,
      name: "root",
      children: [],
    }

    // Create a circular reference by adding the tree to itself
    circularTree.children.push(circularTree)

    expect(() => {
      getValues(circularTree, { childrenKey: "children" })
    }).toThrow("Circular reference detected")
  })

  test("throws error on indirect circular reference", () => {
    // Create a tree with an indirect circular reference
    const circularTree: any = {
      id: 1,
      name: "root",
      children: [
        {
          id: 2,
          name: "child1",
          children: [],
        },
      ],
    }

    // Create a circular reference by making a child point back to its ancestor
    circularTree.children[0].children.push(circularTree)

    expect(() => {
      getValues(circularTree, { childrenKey: "children" })
    }).toThrow("Circular reference detected")
  })

  test("throws error on deeper circular reference", () => {
    // Create a more complex tree with a deeper circular reference
    const circularTree: any = {
      id: 1,
      name: "root",
      children: [
        {
          id: 2,
          name: "child1",
          children: [
            {
              id: 3,
              name: "grandchild1",
              children: [],
            },
          ],
        },
        {
          id: 4,
          name: "child2",
          children: [],
        },
      ],
    }

    // Create a circular reference by making a grandchild point back to child2
    circularTree.children[0].children[0].children.push(circularTree.children[1])
    // Create another circular reference where child2 points back to root
    circularTree.children[1].children.push(circularTree)

    expect(() => {
      getValues(circularTree, { childrenKey: "children" })
    }).toThrow("Circular reference detected")
  })

  test("throws error with custom children key in circular reference", () => {
    // Create a tree with a circular reference using a custom children key
    const customKeyCircularTree: any = {
      id: 1,
      name: "root",
      items: [
        {
          id: 2,
          name: "child1",
          items: [],
        },
      ],
    }

    // Create a circular reference
    customKeyCircularTree.items[0].items.push(customKeyCircularTree)

    expect(() => {
      getValues(customKeyCircularTree, { childrenKey: "items" })
    }).toThrow("Circular reference detected")
  })

  test("circular reference detection works with testFn", () => {
    // Create a tree with a circular reference
    const circularTree: any = {
      id: 1,
      name: "root",
      children: [
        {
          id: 2,
          name: "child1",
          children: [],
        },
      ],
    }

    // Create a circular reference
    circularTree.children[0].children.push(circularTree)

    expect(() => {
      getValues(circularTree, {
        childrenKey: "children",
        testFn: (node) => node.id % 2 === 0,
      })
    }).toThrow("Circular reference detected")
  })

  test("circular reference detection works with getFn", () => {
    // Create a tree with a circular reference
    const circularTree: any = {
      id: 1,
      name: "root",
      children: [
        {
          id: 2,
          name: "child1",
          children: [],
        },
      ],
    }

    // Create a circular reference
    circularTree.children[0].children.push(circularTree)

    expect(() => {
      getValues(circularTree, {
        childrenKey: "children",
        getFn: (node) => node.name,
      })
    }).toThrow("Circular reference detected")
  })

  test("circular reference detection works with copy option", () => {
    // Create a tree with a circular reference
    const circularTree: any = {
      id: 1,
      name: "root",
      children: [
        {
          id: 2,
          name: "child1",
          children: [],
        },
      ],
    }

    // Create a circular reference
    circularTree.children[0].children.push(circularTree)

    expect(() => {
      getValues(circularTree, {
        childrenKey: "children",
        copy: true,
      })
    }).toThrow("Circular reference detected")
  })

  test("does not falsely detect circular reference in similar but distinct nodes", () => {
    // Create nodes with the same structure but different identities
    const tree: any = {
      id: 1,
      name: "root",
      children: [
        {
          id: 2,
          name: "child1",
          children: [
            {
              id: 3,
              name: "grandchild",
              children: [],
            },
          ],
        },
        {
          id: 4,
          name: "child2",
          children: [
            {
              id: 5,
              name: "grandchild",
              children: [],
            },
          ],
        },
      ],
    }

    // This should not throw as there's no actual circular reference
    expect(() => {
      getValues(tree, { childrenKey: "children" })
    }).not.toThrow()
  })
})
