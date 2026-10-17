import type { TNodeFilter } from './TNodeFilter.js';
import Node from '../nodes/node/Node.js';
import type Document from '../nodes/document/Document.js';
import * as PropertySymbol from '../PropertySymbol.js';
import NodeFilter from './NodeFilter.js';
import NodeFilterMask from './NodeFilterMask.js';
import NodeTypeEnum from '../nodes/node/NodeTypeEnum.js';
import NodeUtility from '../nodes/node/NodeUtility.js';
import DOMException from '../exception/DOMException.js';
import DOMExceptionNameEnum from '../exception/DOMExceptionNameEnum.js';

/**
 * The NodeIterator object represents the nodes of a document subtree and a position within them.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeIterator
 * @see https://dom.spec.whatwg.org/#interface-nodeiterator
 */
export default class NodeIterator {
	#root: Node;
	#whatToShow = -1;
	#filter: TNodeFilter | null = null;
	#referenceNode: Node;
	#pointerBeforeReferenceNode = true;
	// The node being examined during traversal. Like browsers, we adjust it when nodes are removed, so that a filter removing the node it is given doesn't end the traversal.
	#candidateNode: Node | null = null;
	#candidatePointerBeforeNode = true;
	#isActive = false;

	/**
	 * Constructor.
	 *
	 * @param root Root.
	 * @param [whatToShow] What to show.
	 * @param [filter] Filter.
	 */
	constructor(root: Node, whatToShow = -1, filter: TNodeFilter | null = null) {
		if (!(root instanceof Node)) {
			throw new DOMException('Parameter 1 was not of type Node.');
		}

		this.#root = root;
		this.#whatToShow = whatToShow;
		this.#filter = filter;
		this.#referenceNode = root;

		const document =
			root[PropertySymbol.nodeType] === NodeTypeEnum.documentNode
				? <Document>root
				: root[PropertySymbol.ownerDocument];

		document?.[PropertySymbol.nodeIterators].add(new WeakRef(this));
	}

	/**
	 * Returns root.
	 *
	 * @returns Root.
	 */
	public get root(): Node {
		return this.#root;
	}

	/**
	 * Returns what to show.
	 *
	 * @returns What to show.
	 */
	public get whatToShow(): number {
		return this.#whatToShow;
	}

	/**
	 * Returns filter.
	 *
	 * @returns Filter.
	 */
	public get filter(): TNodeFilter | null {
		return this.#filter;
	}

	/**
	 * Returns the node to which the iterator is anchored.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeIterator/referenceNode
	 * @returns Reference node.
	 */
	public get referenceNode(): Node {
		return this.#referenceNode;
	}

	/**
	 * Returns whether the iterator is anchored before the reference node.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeIterator/pointerBeforeReferenceNode
	 * @returns "true" if anchored before the reference node.
	 */
	public get pointerBeforeReferenceNode(): boolean {
		return this.#pointerBeforeReferenceNode;
	}

	/**
	 * Moves the current Node to the next visible node in the document order.
	 *
	 * @returns Current node.
	 */
	public nextNode(): Node | null {
		return this.#traverse(true);
	}

	/**
	 * Moves the current Node to the previous visible node in the document order, and returns the found node. It also moves the current node to this one. If no such node exists, or if it is before that the root node defined at the object construction, returns null and the current node is not changed.
	 *
	 * @returns Current node.
	 */
	public previousNode(): Node | null {
		return this.#traverse(false);
	}

	/**
	 * Legacy method that no longer has any effect.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeIterator/detach
	 * @deprecated
	 */
	public detach(): void {
		// Do nothing, as per spec.
	}

	/**
	 * Adjusts the iterator before a node is removed from its document.
	 *
	 * @see https://dom.spec.whatwg.org/#nodeiterator-pre-removing-steps
	 * @param toBeRemovedNode Node to be removed.
	 */
	public [PropertySymbol.preRemove](toBeRemovedNode: Node): void {
		// Unlike the spec, which only checks for the root, we also ignore removal of the root's ancestors (as browsers do), as the iterator would otherwise move outside of the root.
		if (NodeUtility.isInclusiveAncestor(toBeRemovedNode, this.#root)) {
			return;
		}

		[this.#referenceNode, this.#pointerBeforeReferenceNode] = this.#getAdjustedPointer(
			toBeRemovedNode,
			this.#referenceNode,
			this.#pointerBeforeReferenceNode
		);

		if (this.#candidateNode) {
			[this.#candidateNode, this.#candidatePointerBeforeNode] = this.#getAdjustedPointer(
				toBeRemovedNode,
				this.#candidateNode,
				this.#candidatePointerBeforeNode
			);
		}
	}

	/**
	 * Traverses to the next or previous accepted node.
	 *
	 * @see https://dom.spec.whatwg.org/#concept-nodeiterator-traverse
	 * @param next "true" to traverse to the next node, "false" to traverse to the previous node.
	 * @returns Accepted node, or null if there is none.
	 */
	#traverse(next: boolean): Node | null {
		// A filter may call this method on the same iterator, which must not affect the outer traversal.
		const outerCandidateNode = this.#candidateNode;
		const outerCandidatePointerBeforeNode = this.#candidatePointerBeforeNode;

		this.#candidateNode = this.#referenceNode;
		this.#candidatePointerBeforeNode = this.#pointerBeforeReferenceNode;

		try {
			while (true) {
				if (next) {
					if (!this.#candidatePointerBeforeNode) {
						const following = NodeUtility.following(this.#candidateNode, this.#root);
						if (!following) {
							return null;
						}
						this.#candidateNode = following;
					}
					this.#candidatePointerBeforeNode = false;
				} else {
					if (this.#candidatePointerBeforeNode) {
						const preceding = this.#getPreceding(this.#candidateNode);
						if (!preceding) {
							return null;
						}
						this.#candidateNode = preceding;
					}
					this.#candidatePointerBeforeNode = true;
				}

				const node = this.#candidateNode;

				if (this.#filterNode(node) === NodeFilter.FILTER_ACCEPT) {
					// The filter may have removed nodes, in which case the candidate has been adjusted. We still return the node that was accepted, as browsers do.
					this.#referenceNode = this.#candidateNode;
					this.#pointerBeforeReferenceNode = this.#candidatePointerBeforeNode;
					return node;
				}
			}
		} finally {
			this.#candidateNode = outerCandidateNode;
			this.#candidatePointerBeforeNode = outerCandidatePointerBeforeNode;
		}
	}

	/**
	 * Filters a node. In contrast to TreeWalker, FILTER_REJECT is treated the same as FILTER_SKIP.
	 *
	 * @see https://dom.spec.whatwg.org/#concept-node-filter
	 * @param node Node.
	 * @returns Filter result.
	 */
	#filterNode(node: Node): number {
		if (this.#isActive) {
			throw new this.#root[PropertySymbol.window].DOMException(
				"Failed to execute 'nextNode' on 'NodeIterator': The NodeIterator is already filtering a node.",
				DOMExceptionNameEnum.invalidStateError
			);
		}

		const mask = NodeFilterMask[<1>node[PropertySymbol.nodeType]];

		if (mask && (this.#whatToShow & mask) == 0) {
			return NodeFilter.FILTER_SKIP;
		}

		if (!this.#filter) {
			return NodeFilter.FILTER_ACCEPT;
		}

		this.#isActive = true;

		try {
			if (typeof this.#filter === 'function') {
				return this.#filter(node);
			}
			return this.#filter.acceptNode(node);
		} finally {
			this.#isActive = false;
		}
	}

	/**
	 * Returns a pointer adjusted for the removal of a node.
	 *
	 * @see https://dom.spec.whatwg.org/#nodeiterator-pre-removing-steps
	 * @param toBeRemovedNode Node to be removed.
	 * @param node Node the pointer is anchored to.
	 * @param pointerBeforeNode Whether the pointer is before the node.
	 * @returns Adjusted node and whether the pointer is before it.
	 */
	#getAdjustedPointer(
		toBeRemovedNode: Node,
		node: Node,
		pointerBeforeNode: boolean
	): [Node, boolean] {
		if (!NodeUtility.isInclusiveAncestor(toBeRemovedNode, node)) {
			return [node, pointerBeforeNode];
		}

		if (pointerBeforeNode) {
			let current: Node = toBeRemovedNode;
			while (current !== this.#root) {
				if (current.nextSibling) {
					return [current.nextSibling, true];
				}
				current = current[PropertySymbol.parentNode]!;
			}
		}

		const previousSibling = toBeRemovedNode.previousSibling;

		return [
			previousSibling
				? this.#getLastInclusiveDescendant(previousSibling)
				: toBeRemovedNode[PropertySymbol.parentNode]!,
			false
		];
	}

	/**
	 * Returns the node preceding a node in tree order, within the root.
	 *
	 * @param node Node.
	 * @returns Preceding node, or null if there is none.
	 */
	#getPreceding(node: Node): Node | null {
		if (node === this.#root) {
			return null;
		}

		const previousSibling = node.previousSibling;

		if (previousSibling) {
			return this.#getLastInclusiveDescendant(previousSibling);
		}

		return node[PropertySymbol.parentNode];
	}

	/**
	 * Returns the last inclusive descendant of a node in tree order.
	 *
	 * @param node Node.
	 * @returns Last inclusive descendant.
	 */
	#getLastInclusiveDescendant(node: Node): Node {
		while (node.lastChild) {
			node = node.lastChild;
		}
		return node;
	}
}
