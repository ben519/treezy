import { getSignature } from "../src/getSignature"
import { NodeWithId } from "../src/types"

describe("getSignature", () => {
  // Simple test with default options
  test("should generate signature for simple tree with default options", () => {
    const tree: NodeWithId<"children", "id"> = {
      id: "root",
      children: [{ id: "child1" }, { id: "child2" }],
    }

    const result = getSignature(tree, { childrenKey: "children", idKey: "id" })
    expect(result).toBe("root[child1,child2]")
  })

  // Test nested tree structure
  test("should generate signature for nested tree structure", () => {
    const tree: NodeWithId<"children", "id"> = {
      id: "root",
      children: [
        {
          id: "child1",
          children: [{ id: "grandchild1" }, { id: "grandchild2" }],
        },
        { id: "child2" },
      ],
    }

    const result = getSignature(tree, { childrenKey: "children", idKey: "id" })
    expect(result).toBe("root[child1[grandchild1,grandchild2],child2]")
  })

  // Test with custom options
  test("should generate signature with custom options", () => {
    const tree: NodeWithId<"children", "id"> = {
      id: "root",
      children: [{ id: "child1" }, { id: "child2" }],
    }

    const result = getSignature(tree, {
      childrenKey: "children",
      closeChar: "}",
      idKey: "id",
      openChar: "{",
      separatorChar: "|",
    })

    expect(result).toBe("root{child1|child2}")
  })

  // Test with custom children key
  test("should generate signature with custom childrenKey", () => {
    interface CustomNode extends NodeWithId<"items", "id"> {
      id: string
      items?: CustomNode[]
    }

    const tree: CustomNode = {
      id: "root",
      items: [{ id: "item1" }, { id: "item2" }],
    }

    const result = getSignature(tree, { childrenKey: "items", idKey: "id" })
    expect(result).toBe("root[item1,item2]")
  })

  // Test with custom id key
  test("should generate signature with custom idKey", () => {
    interface CustomNode extends NodeWithId<"children", "nodeId"> {
      nodeId: string
      children?: CustomNode[]
    }

    const tree: CustomNode = {
      nodeId: "root",
      children: [{ nodeId: "child1" }, { nodeId: "child2" }],
    }

    const result = getSignature(tree, {
      childrenKey: "children",
      idKey: "nodeId",
    })
    expect(result).toBe("root[child1,child2]")
  })

  // Test with numeric IDs
  test("should handle numeric IDs correctly", () => {
    interface NumericIdNode extends NodeWithId<"children", "id", number> {
      id: number
      children?: NumericIdNode[]
    }

    const tree: NumericIdNode = {
      id: 1,
      children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }],
    }

    const result = getSignature(tree, { childrenKey: "children", idKey: "id" })
    expect(result).toBe("1[2,3[4]]")
  })

  // Test with complex tree and all custom options
  test("should generate signature for complex tree with all custom options", () => {
    interface ComplexNode extends NodeWithId<"subNodes", "uid", string> {
      uid: string
      subNodes?: ComplexNode[]
      extraData?: string
    }

    const tree: ComplexNode = {
      uid: "A",
      extraData: "root node",
      subNodes: [
        {
          uid: "B",
          extraData: "first child",
          subNodes: [{ uid: "D", extraData: "grandchild" }],
        },
        {
          uid: "C",
          extraData: "second child",
          subNodes: [
            { uid: "E", extraData: "another grandchild" },
            { uid: "F", extraData: "yet another grandchild" },
          ],
        },
      ],
    }

    const result = getSignature(tree, {
      idKey: "uid",
      childrenKey: "subNodes",
      openChar: "(",
      closeChar: ")",
      separatorChar: "+",
    })

    expect(result).toBe("A(B(D)+C(E+F))")
  })

  // Test leaf node (no children)
  test("should handle leaf nodes correctly", () => {
    const tree: NodeWithId<"children", "id"> = {
      id: "leaf",
      someData: "extra info",
    }

    const result = getSignature(tree, { childrenKey: "children", idKey: "id" })
    expect(result).toBe("leaf")
  })

  // Test with empty children array
  test("should handle nodes with empty children array", () => {
    const tree: NodeWithId<"children", "id"> = {
      id: "root",
      children: [],
    }

    const result = getSignature(tree, { childrenKey: "children", idKey: "id" })
    expect(result).toBe("root")
  })

  // Test with undefined children
  test("should handle nodes with undefined children", () => {
    const tree: NodeWithId<"children", "id"> = {
      id: "root",
      children: undefined,
    }

    const result = getSignature(tree, { childrenKey: "children", idKey: "id" })
    expect(result).toBe("root")
  })

  // Test with symbol IDs
  test("should handle symbol IDs correctly", () => {
    const ID_1 = Symbol("id1")
    const ID_2 = Symbol("id2")

    interface SymbolIdNode extends NodeWithId<"children", "id", symbol> {
      id: symbol
      children?: SymbolIdNode[]
    }

    const tree: SymbolIdNode = {
      id: ID_1,
      children: [{ id: ID_2 }],
    }

    const result = getSignature(tree, { childrenKey: "children", idKey: "id" })
    expect(result).toBe(`${String(ID_1)}[${String(ID_2)}]`)
  })

  // Test with circular reference
  test("should throw an error for circular reference", () => {
    const tree: NodeWithId<"children", "id"> = {
      id: "root",
      children: [],
    }

    // Create a circular reference: child -> parent
    const child: NodeWithId<"children", "id"> = { id: "child", children: [] }
    tree.children!.push(child)
    child.children!.push(tree as any) // force a circular reference

    expect(() => {
      getSignature(tree, { childrenKey: "children", idKey: "id" })
    }).toThrow("Circular reference detected")
  })

  // Test with deeper circular reference
  test("should throw an error for deep circular reference", () => {
    const tree: NodeWithId<"children", "id"> = {
      id: "root",
      children: [],
    }

    const child1: NodeWithId<"children", "id"> = { id: "child1", children: [] }
    const child2: NodeWithId<"children", "id"> = { id: "child2", children: [] }

    tree.children!.push(child1)
    child1.children!.push(child2)
    child2.children!.push(tree as any) // circular reference back to root

    expect(() => {
      getSignature(tree, { childrenKey: "children", idKey: "id" })
    }).toThrow("Circular reference detected")
  })
})
