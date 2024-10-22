export type Node = {
  [key: string]: any;
  children: Node[];
}

export type Tree = Node