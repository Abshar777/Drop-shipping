// Pure helpers over the flat category list. Safe to import from client components.
import type { Category } from "./types";

export type CategoryNode = Category & { children: CategoryNode[] };

const byOrder = (a: Category, b: Category) => a.order - b.order;

/** Nest the flat list into a tree. With enabledOnly, disabled nodes and their descendants are dropped. */
export function buildCategoryTree(categories: Category[], opts?: { enabledOnly?: boolean }): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  for (const c of categories) nodes.set(c.id, { ...c, children: [] });

  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortDeep = (list: CategoryNode[]) => {
    list.sort(byOrder);
    list.forEach((n) => sortDeep(n.children));
  };
  sortDeep(roots);

  if (!opts?.enabledOnly) return roots;
  const prune = (list: CategoryNode[]): CategoryNode[] =>
    list.filter((n) => n.enabled).map((n) => ({ ...n, children: prune(n.children) }));
  return prune(roots);
}

/** The id plus every descendant id. */
export function descendantIds(categories: Category[], id: string): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const c of categories) {
    if (!c.parentId) continue;
    const list = childrenOf.get(c.parentId) ?? [];
    list.push(c.id);
    childrenOf.set(c.parentId, list);
  }
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    if (out.has(cur)) continue;
    out.add(cur);
    for (const child of childrenOf.get(cur) ?? []) stack.push(child);
  }
  return out;
}

/** Root-to-node chain, e.g. [Men, Top Wear, Shirts]. */
export function categoryPath(categories: Category[], id: string): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const chain: Category[] = [];
  let cur = byId.get(id);
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    chain.unshift(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return chain;
}

/** True only if the node and every ancestor are enabled. */
export function isEffectivelyEnabled(categories: Category[], id: string): boolean {
  const chain = categoryPath(categories, id);
  return chain.length > 0 && chain.every((c) => c.enabled);
}

/** Flat list in tree order with depth, handy for indented <select> options and admin rows. */
export function flattenTree(tree: CategoryNode[], depth = 0): Array<{ node: CategoryNode; depth: number }> {
  const out: Array<{ node: CategoryNode; depth: number }> = [];
  for (const node of tree) {
    out.push({ node, depth });
    out.push(...flattenTree(node.children, depth + 1));
  }
  return out;
}
