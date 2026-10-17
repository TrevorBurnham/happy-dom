import Window from '../../src/window/Window.js';
import type Document from '../../src/nodes/document/Document.js';
import NodeFilter from '../../src/tree-walker/NodeFilter.js';
import Element from '../../src/nodes/element/Element.js';
import Comment from '../../src/nodes/comment/Comment.js';
import Node from '../../src/nodes/node/Node.js';
import type NodeIterator from '../../src/tree-walker/NodeIterator.js';
import TreeWalkerHTML from './data/TreeWalkerHTML.js';
import { beforeEach, describe, it, expect } from 'vitest';

const NODE_TO_STRING = (node: Node): string => {
	if (node instanceof Element) {
		return node.outerHTML;
	} else if (node instanceof Comment) {
		return '<!--' + node.textContent + '-->';
	}
	return node['textContent'];
};

describe('NodeIterator', () => {
	let window: Window;
	let document: Document;

	beforeEach(() => {
		window = new Window();
		document = window.document;
		document.write(TreeWalkerHTML);
	});

	describe('nextNode()', () => {
		it('Walks into each node in the DOM tree.', () => {
			const nodeIterator = document.createNodeIterator(document.body);
			const html: string[] = [];
			let currentNode;

			while ((currentNode = nodeIterator.nextNode())) {
				html.push(NODE_TO_STRING(currentNode));
			}

			expect(html).toEqual([
				'<body>\n\t\t\t<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>\n\t\t\t<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>\n\t\t\n\t</body>',
				'\n\t\t\t',
				'<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>',
				'\n\t\t\t\t',
				'<!-- Comment 1 !-->',
				'\n\t\t\t\t',
				'<b>Bold</b>',
				'Bold',
				'\n\t\t\t\t',
				'<!-- Comment 2 !-->',
				'\n\t\t\t\t',
				'<span>Span</span>',
				'Span',
				'\n\t\t\t',
				'\n\t\t\t',
				'<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>',
				'\n\t\t\t\t',
				'<!-- Comment 1 !-->',
				'\n\t\t\t\t',
				'<b>Bold</b>',
				'Bold',
				'\n\t\t\t\t',
				'<!-- Comment 2 !-->',
				'\n\t\t\t',
				'\n\t\t\n\t'
			]);
		});

		it('Walks into each HTMLElement in the DOM tree when whatToShow is set to NodeFilter.SHOW_ELEMENT.', () => {
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);
			const html: string[] = [];
			let currentNode;

			while ((currentNode = nodeIterator.nextNode())) {
				html.push(currentNode.outerHTML);
			}

			expect(html).toEqual([
				'<body>\n\t\t\t<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>\n\t\t\t<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>\n\t\t\n\t</body>',
				'<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>',
				'<b>Bold</b>',
				'<span>Span</span>',
				'<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>',
				'<b>Bold</b>'
			]);
		});

		it('Walks into each HTMLElement and Comment in the DOM tree when whatToShow is set to NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_COMMENT.', () => {
			const nodeIterator = document.createNodeIterator(
				document.body,
				NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_COMMENT
			);
			const html: string[] = [];
			let currentNode;

			while ((currentNode = nodeIterator.nextNode())) {
				html.push(NODE_TO_STRING(currentNode));
			}

			expect(html).toEqual([
				'<body>\n\t\t\t<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>\n\t\t\t<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>\n\t\t\n\t</body>',
				'<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>',
				'<!-- Comment 1 !-->',
				'<b>Bold</b>',
				'<!-- Comment 2 !-->',
				'<span>Span</span>',
				'<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>',
				'<!-- Comment 1 !-->',
				'<b>Bold</b>',
				'<!-- Comment 2 !-->'
			]);
		});

		it('Walks into each HTMLElement in the DOM tree when whatToShow is set to NodeFilter.SHOW_ALL and provided filter function returns NodeFilter.FILTER_SKIP if not an HTMLElement and NodeFilter.FILTER_ACCEPT if it is.', () => {
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ALL, {
				acceptNode: (node: Node) =>
					node.nodeType === Node.ELEMENT_NODE ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
			});
			const html: string[] = [];
			let currentNode;

			while ((currentNode = nodeIterator.nextNode())) {
				html.push(NODE_TO_STRING(currentNode));
			}

			expect(html).toEqual([
				'<body>\n\t\t\t<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>\n\t\t\t<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>\n\t\t\n\t</body>',
				'<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>',
				'<b>Bold</b>',
				'<span>Span</span>',
				'<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>',
				'<b>Bold</b>'
			]);
		});

		it('Rejects the two first nodes when provided filter function returns NodeFilter.FILTER_REJECT on the two first nodes.', () => {
			let rejected = 0;
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ALL, {
				acceptNode: () => {
					if (rejected < 2) {
						rejected++;
						return NodeFilter.FILTER_REJECT;
					}
					return NodeFilter.FILTER_ACCEPT;
				}
			});
			const html: string[] = [];
			let currentNode;

			while ((currentNode = nodeIterator.nextNode())) {
				html.push(NODE_TO_STRING(currentNode));
			}

			expect(html).toEqual([
				'<div class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t\t<span>Span</span>\n\t\t\t</div>',
				'\n\t\t\t\t',
				'<!-- Comment 1 !-->',
				'\n\t\t\t\t',
				'<b>Bold</b>',
				'Bold',
				'\n\t\t\t\t',
				'<!-- Comment 2 !-->',
				'\n\t\t\t\t',
				'<span>Span</span>',
				'Span',
				'\n\t\t\t',
				'\n\t\t\t',
				'<article class="class1 class2" id="id">\n\t\t\t\t<!-- Comment 1 !-->\n\t\t\t\t<b>Bold</b>\n\t\t\t\t<!-- Comment 2 !-->\n\t\t\t</article>',
				'\n\t\t\t\t',
				'<!-- Comment 1 !-->',
				'\n\t\t\t\t',
				'<b>Bold</b>',
				'Bold',
				'\n\t\t\t\t',
				'<!-- Comment 2 !-->',
				'\n\t\t\t',
				'\n\t\t\n\t'
			]);
		});
	});

	describe('previousNode()', () => {
		it('Returns the previous node when executed after a nextNode() call.', () => {
			const nodeIterator = document.createNodeIterator(document.body);
			let expectedPreviousNode: Node | null = null;
			let previousNode: Node | null = null;
			let currentNode: Node | null = null;

			while ((currentNode = nodeIterator.nextNode())) {
				if (previousNode) {
					previousNode = nodeIterator.previousNode();
					expect(previousNode === expectedPreviousNode).toBe(true);
					nodeIterator.nextNode();
				}
				expectedPreviousNode = currentNode;
			}
		});

		it('Returns the reference node when changing direction, as the pointer moves past it.', () => {
			document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
			const a = document.getElementById('a');
			const b = document.getElementById('b');
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			expect(nodeIterator.nextNode()).toBe(document.body);
			expect(nodeIterator.nextNode()).toBe(a);
			expect(nodeIterator.nextNode()).toBe(b);
			expect(nodeIterator.nextNode()).toBe(null);
			expect(nodeIterator.previousNode()).toBe(b);
			expect(nodeIterator.previousNode()).toBe(a);
			expect(nodeIterator.previousNode()).toBe(document.body);
			expect(nodeIterator.previousNode()).toBe(null);
			expect(nodeIterator.nextNode()).toBe(document.body);
		});
	});

	describe('FILTER_REJECT', () => {
		it('Skips only the rejected node and not its descendants.', () => {
			document.body.innerHTML = '<p><b></b></p><i></i>';
			const nodeIterator = document.createNodeIterator(
				document.body,
				NodeFilter.SHOW_ELEMENT,
				(node: Node) =>
					node.nodeName === 'P' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
			);
			const visited: string[] = [];
			let node;

			while ((node = nodeIterator.nextNode())) {
				visited.push(node.nodeName);
			}

			expect(visited).toEqual(['BODY', 'B', 'I']);

			const reversed: string[] = [];

			while ((node = nodeIterator.previousNode())) {
				reversed.push(node.nodeName);
			}

			expect(reversed).toEqual(['I', 'B', 'BODY']);
		});
	});

	describe('referenceNode', () => {
		it('Returns the root before iterating.', () => {
			const nodeIterator = document.createNodeIterator(document.body);
			expect(nodeIterator.referenceNode).toBe(document.body);
		});

		it('Returns the last node returned by nextNode() or previousNode().', () => {
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);
			const first = nodeIterator.nextNode();
			const second = nodeIterator.nextNode();

			expect(second).not.toBe(first);
			expect(nodeIterator.referenceNode).toBe(second);
			expect(nodeIterator.previousNode()).toBe(second);
			expect(nodeIterator.referenceNode).toBe(second);
			expect(nodeIterator.previousNode()).toBe(first);
			expect(nodeIterator.referenceNode).toBe(first);
		});

		it("Doesn't change when there is no next node.", () => {
			document.body.innerHTML = '';
			const nodeIterator = document.createNodeIterator(document.body);

			expect(nodeIterator.nextNode()).toBe(document.body);
			expect(nodeIterator.nextNode()).toBe(null);
			expect(nodeIterator.referenceNode).toBe(document.body);
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(false);
		});
	});

	describe('pointerBeforeReferenceNode', () => {
		it('Returns true before iterating.', () => {
			const nodeIterator = document.createNodeIterator(document.body);
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(true);
		});

		it('Returns false after nextNode() and true after previousNode().', () => {
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			nodeIterator.nextNode();
			nodeIterator.nextNode();
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(false);

			nodeIterator.previousNode();
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(true);
		});
	});

	describe('detach()', () => {
		it('Has no effect.', () => {
			const nodeIterator = document.createNodeIterator(document.body);
			nodeIterator.detach();
			expect(nodeIterator.nextNode()).toBe(document.body);
		});
	});

	describe('filter', () => {
		it('Throws an InvalidStateError if the filter calls nextNode() on the same iterator.', () => {
			let error: Error | null = null;
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ALL, () => {
				try {
					nodeIterator.nextNode();
				} catch (e) {
					error = e;
				}
				return NodeFilter.FILTER_ACCEPT;
			});

			expect(nodeIterator.nextNode()).toBe(document.body);
			expect(error).toBeInstanceOf(window.DOMException);
			expect(error!.name).toBe('InvalidStateError');
			expect(nodeIterator.nextNode()).toBe(document.body.firstChild);
		});

		it('Can be used again after the filter throws.', () => {
			let shouldThrow = true;
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ALL, () => {
				if (shouldThrow) {
					shouldThrow = false;
					throw new Error('Test');
				}
				return NodeFilter.FILTER_ACCEPT;
			});

			expect(() => nodeIterator.nextNode()).toThrow('Test');
			expect(nodeIterator.referenceNode).toBe(document.body);
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(true);
			expect(nodeIterator.nextNode()).toBe(document.body);
		});
	});

	describe('Node removal', () => {
		const iterate = (nodeIterator: NodeIterator, callback: (node: Element) => void): string[] => {
			const visited: string[] = [];
			let node;

			while ((node = <Element>nodeIterator.nextNode())) {
				visited.push(node.id || node.nodeName);
				callback(node);
			}

			return visited;
		};

		it('Continues with the following node after the reference node is removed.', () => {
			document.body.innerHTML =
				'<div><x-bad id="bad1"><b id="b"></b></x-bad><i id="i"></i><x-bad id="bad2"></x-bad><u id="u"></u></div>';
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			const visited = iterate(nodeIterator, (node) => {
				if (node.nodeName === 'X-BAD') {
					node.remove();
				}
			});

			expect(visited).toEqual(['BODY', 'DIV', 'bad1', 'i', 'bad2', 'u']);
		});

		it('Visits children that were moved after the reference node before it was removed.', () => {
			// This is what DOMPurify does with KEEP_CONTENT (see #2310).
			document.body.innerHTML =
				'<div id="outer"><div id="inner"><strong id="leaf">x</strong></div></div>';
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			const visited = iterate(nodeIterator, (node) => {
				if (node.id === 'outer') {
					const childNodes = node.childNodes;
					for (let i = childNodes.length - 1; i >= 0; i--) {
						node.parentNode!.insertBefore(childNodes[i], node.nextSibling);
					}
					node.parentNode!.removeChild(node);
				}
			});

			expect(visited).toEqual(['BODY', 'outer', 'inner', 'leaf']);
		});

		it("Doesn't visit children that were moved before the reference node before it was removed.", () => {
			document.body.innerHTML =
				'<div id="outer"><div id="inner"><strong id="leaf">x</strong></div></div>';
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			const visited = iterate(nodeIterator, (node) => {
				if (node.id === 'outer') {
					for (const child of Array.from(node.childNodes)) {
						node.parentNode!.insertBefore(child, node);
					}
					node.remove();
				}
			});

			expect(visited).toEqual(['BODY', 'outer']);
		});

		it('Continues after an ancestor of the reference node is removed.', () => {
			document.body.innerHTML =
				'<div id="wrap"><div id="a"></div><div id="b"></div></div><div id="c"></div>';
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			const visited = iterate(nodeIterator, (node) => {
				if (node.id === 'a') {
					document.getElementById('wrap')!.remove();
				}
			});

			expect(visited).toEqual(['BODY', 'wrap', 'a', 'c']);
		});

		it('Moves the reference node to the preceding node when the pointer is after it.', () => {
			document.body.innerHTML = '<div id="a"><span id="a1"></span></div><div id="b"></div>';
			const a1 = document.getElementById('a1');
			const b = document.getElementById('b')!;
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			while (nodeIterator.nextNode() !== b) {}

			b.remove();

			expect(nodeIterator.referenceNode).toBe(a1);
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(false);
			expect(nodeIterator.nextNode()).toBe(null);
			expect(nodeIterator.previousNode()).toBe(a1);
		});

		it('Moves the reference node to the parent when the pointer is after it and it has no previous sibling.', () => {
			document.body.innerHTML = '<div id="a"><span id="a1"></span></div>';
			const a = document.getElementById('a');
			const a1 = document.getElementById('a1')!;
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			while (nodeIterator.nextNode() !== a1) {}

			a1.remove();

			expect(nodeIterator.referenceNode).toBe(a);
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(false);
		});

		it('Moves the reference node to the following node when the pointer is before it.', () => {
			document.body.innerHTML =
				'<div id="a"></div><div id="b"><span id="b1"></span></div><div id="c"></div>';
			const b = document.getElementById('b')!;
			const b1 = document.getElementById('b1');
			const c = document.getElementById('c');
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			while (nodeIterator.nextNode() !== b1) {}
			nodeIterator.previousNode();

			b.remove();

			expect(nodeIterator.referenceNode).toBe(c);
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(true);
			expect(nodeIterator.nextNode()).toBe(c);
		});

		it('Moves the pointer after the preceding node when the pointer is before the reference node and there is no following node.', () => {
			document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
			const a = document.getElementById('a');
			const b = document.getElementById('b')!;
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			while (nodeIterator.nextNode() !== b) {}
			nodeIterator.previousNode();

			b.remove();

			expect(nodeIterator.referenceNode).toBe(a);
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(false);
			expect(nodeIterator.previousNode()).toBe(a);
		});

		it("Isn't affected by removing nodes that don't contain the reference node.", () => {
			document.body.innerHTML = '<div id="a"></div><div id="b"></div><div id="c"></div>';
			const b = document.getElementById('b')!;
			const nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT);

			nodeIterator.nextNode();
			document.getElementById('c')!.remove();

			expect(nodeIterator.nextNode()).toBe(document.getElementById('a'));
			expect(nodeIterator.nextNode()).toBe(b);
		});

		it("Isn't affected by removing the root or an ancestor of the root.", () => {
			document.body.innerHTML =
				'<div id="wrap"><div id="root"><span id="child"></span></div></div>';
			const wrap = document.getElementById('wrap')!;
			const root = document.getElementById('root')!;
			const child = document.getElementById('child');
			const nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);

			nodeIterator.nextNode();
			nodeIterator.nextNode();
			root.remove();
			document.body.appendChild(root);
			wrap.remove();

			expect(nodeIterator.referenceNode).toBe(child);
			expect(nodeIterator.pointerBeforeReferenceNode).toBe(false);
			expect(nodeIterator.previousNode()).toBe(child);
			expect(nodeIterator.previousNode()).toBe(root);
		});

		it('Continues when the filter removes the node it is given.', () => {
			document.body.innerHTML = '<p id="a"></p><x-bad><b></b></x-bad><p id="c"></p>';
			const nodeIterator = document.createNodeIterator(
				document.body,
				NodeFilter.SHOW_ELEMENT,
				(node: Node) => {
					if (node.nodeName === 'X-BAD') {
						(<Element>node).remove();
						return NodeFilter.FILTER_REJECT;
					}
					return NodeFilter.FILTER_ACCEPT;
				}
			);

			expect(iterate(nodeIterator, () => {})).toEqual(['BODY', 'a', 'c']);
		});

		it('Works with iterators in documents created by DOMParser.', () => {
			const parsedDocument = new window.DOMParser().parseFromString(
				'<div id="a"></div><div id="b"></div>',
				'text/html'
			);
			const nodeIterator = parsedDocument.createNodeIterator(
				parsedDocument.body,
				NodeFilter.SHOW_ELEMENT
			);

			const visited = iterate(nodeIterator, (node) => {
				if (node.id === 'a') {
					node.remove();
				}
			});

			expect(visited).toEqual(['BODY', 'a', 'b']);
		});
	});
});
