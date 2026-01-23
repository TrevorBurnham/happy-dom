/**
 * HTML Parser Benchmark Suite
 *
 * Compares HTML parsing performance across different scenarios.
 * Run with: npx tsx benchmark/html-parser-benchmark.ts
 *
 * To compare branches:
 * 1. Run on current branch, save results
 * 2. git checkout master
 * 3. Run again and compare
 */

import { Window } from '../src/index.js';

// ============================================================================
// Benchmark Configuration
// ============================================================================

const WARMUP_ITERATIONS = 3;
const BENCHMARK_ITERATIONS = 50;

// ============================================================================
// Test HTML Samples
// ============================================================================

const HTML_SAMPLES = {
	// Simple HTML - baseline performance
	simple: `
		<div class="container">
			<h1>Hello World</h1>
			<p>This is a simple paragraph.</p>
		</div>
	`,

	// Attributes heavy - tests attribute parsing
	attributesHeavy: `
		<div id="main" class="container fluid responsive" data-testid="main-container" 
			 data-config='{"key": "value", "nested": {"a": 1}}' aria-label="Main content"
			 role="main" tabindex="0" style="display: flex; flex-direction: column;">
			<input type="text" name="username" id="username" class="form-control" 
				   placeholder="Enter username" required autocomplete="username"
				   aria-describedby="username-help" data-validate="true" maxlength="50">
			<button type="submit" class="btn btn-primary btn-lg" disabled 
					data-loading="false" aria-busy="false">Submit</button>
		</div>
	`,

	// Deeply nested - tests tree building performance
	deeplyNested: generateDeeplyNestedHTML(20),

	// Wide tree - many siblings
	wideTree: generateWideTreeHTML(100),

	// Table structure - complex but common pattern
	table: generateTableHTML(50, 10),

	// Form with many inputs
	form: generateFormHTML(30),

	// Mixed content - text nodes, comments, elements
	mixedContent: `
		<article>
			<!-- Header section -->
			<header>
				<h1>Article Title</h1>
				<p class="meta">Published on <time datetime="2024-01-15">January 15, 2024</time></p>
			</header>
			<!-- Main content -->
			<section>
				<p>First paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
				<p>Second paragraph with a <a href="https://example.com">link</a>.</p>
				<!-- Embedded content -->
				<figure>
					<img src="image.jpg" alt="Description" width="800" height="600">
					<figcaption>Image caption here</figcaption>
				</figure>
				<blockquote cite="https://example.com/quote">
					<p>A meaningful quote goes here.</p>
					<footer>— <cite>Author Name</cite></footer>
				</blockquote>
			</section>
			<!-- Footer -->
			<footer>
				<p>Tags: <span class="tag">html</span>, <span class="tag">parsing</span></p>
			</footer>
		</article>
	`,

	// Malformed HTML - tests error recovery
	malformed: `
		<div>
			<p>Unclosed paragraph
			<p>Another paragraph<span>with unclosed span
			<div>Nested div without closing parent
				<ul>
					<li>Item 1
					<li>Item 2
					<li>Item 3
				</ul>
			</div>
			<table>
				<tr><td>Cell 1<td>Cell 2
				<tr><td>Cell 3<td>Cell 4
			</table>
		</div>
		<p>Text after </div> stray end tag
	`,

	// SVG content - namespace handling
	svg: `
		<div class="icon-container">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
				<defs>
					<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
						<stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
					</linearGradient>
				</defs>
				<circle cx="50" cy="50" r="40" fill="url(#grad1)" stroke="black" stroke-width="2"/>
				<text x="50" y="55" text-anchor="middle" fill="white" font-size="12">SVG</text>
			</svg>
		</div>
	`,

	// Template elements
	template: `
		<div id="app">
			<template id="card-template">
				<div class="card">
					<header class="card-header">
						<h3 class="card-title"></h3>
					</header>
					<div class="card-body">
						<p class="card-text"></p>
					</div>
					<footer class="card-footer">
						<button class="btn">Action</button>
					</footer>
				</div>
			</template>
			<div id="cards-container"></div>
		</div>
	`,

	// Script and style tags - raw text handling
	scriptsAndStyles: `
		<html>
		<head>
			<style>
				.container { display: flex; }
				.item { flex: 1; }
				/* Comment with <fake> tags */
				@media (max-width: 768px) {
					.container { flex-direction: column; }
				}
			</style>
			<script>
				const html = '<div class="test">Not parsed</div>';
				if (1 < 2 && 3 > 1) {
					console.log("Script content with < and > symbols");
				}
			</script>
		</head>
		<body>
			<div class="container">
				<div class="item">Content</div>
			</div>
		</body>
		</html>
	`,

	// Full document - realistic page
	fullDocument: generateFullDocumentHTML(),

	// Large document - stress test (reduced size to avoid memory issues)
	largeDocument: generateLargeDocumentHTML(100),
};

// ============================================================================
// HTML Generators
// ============================================================================

function generateDeeplyNestedHTML(depth: number): string {
	let html = '';
	for (let i = 0; i < depth; i++) {
		html += `<div class="level-${i}" data-depth="${i}">`;
	}
	html += '<span>Deepest content</span>';
	for (let i = 0; i < depth; i++) {
		html += '</div>';
	}
	return html;
}

function generateWideTreeHTML(width: number): string {
	let html = '<div class="container">';
	for (let i = 0; i < width; i++) {
		html += `<span class="item item-${i}" data-index="${i}">Item ${i}</span>`;
	}
	html += '</div>';
	return html;
}

function generateTableHTML(rows: number, cols: number): string {
	let html = '<table class="data-table"><thead><tr>';
	for (let c = 0; c < cols; c++) {
		html += `<th>Header ${c}</th>`;
	}
	html += '</tr></thead><tbody>';
	for (let r = 0; r < rows; r++) {
		html += '<tr>';
		for (let c = 0; c < cols; c++) {
			html += `<td data-row="${r}" data-col="${c}">Cell ${r}-${c}</td>`;
		}
		html += '</tr>';
	}
	html += '</tbody></table>';
	return html;
}

function generateFormHTML(fields: number): string {
	let html = '<form id="benchmark-form" action="/submit" method="post">';
	for (let i = 0; i < fields; i++) {
		html += `
			<div class="form-group">
				<label for="field-${i}">Field ${i}</label>
				<input type="text" id="field-${i}" name="field${i}" 
					   class="form-control" placeholder="Enter value ${i}"
					   data-validation="required" aria-describedby="help-${i}">
				<small id="help-${i}" class="form-text">Help text for field ${i}</small>
			</div>
		`;
	}
	html += '<button type="submit" class="btn btn-primary">Submit</button></form>';
	return html;
}

function generateFullDocumentHTML(): string {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta name="description" content="A benchmark test page">
			<title>Benchmark Test Page</title>
			<link rel="stylesheet" href="styles.css">
			<style>
				body { font-family: sans-serif; margin: 0; padding: 20px; }
				.container { max-width: 1200px; margin: 0 auto; }
			</style>
		</head>
		<body>
			<header>
				<nav class="main-nav">
					<ul>
						<li><a href="/">Home</a></li>
						<li><a href="/about">About</a></li>
						<li><a href="/contact">Contact</a></li>
					</ul>
				</nav>
			</header>
			<main class="container">
				<article>
					<h1>Welcome to the Test Page</h1>
					<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
					<section>
						<h2>Section Title</h2>
						<p>Section content goes here.</p>
						<ul>
							<li>List item 1</li>
							<li>List item 2</li>
							<li>List item 3</li>
						</ul>
					</section>
				</article>
				<aside>
					<h3>Sidebar</h3>
					<p>Sidebar content</p>
				</aside>
			</main>
			<footer>
				<p>&copy; 2024 Test Company</p>
			</footer>
			<script src="app.js"></script>
		</body>
		</html>
	`;
}

function generateLargeDocumentHTML(itemCount: number): string {
	let html = `
		<!DOCTYPE html>
		<html>
		<head><title>Large Document</title></head>
		<body>
		<div class="container">
	`;

	for (let i = 0; i < itemCount; i++) {
		html += `
			<article class="item item-${i}" data-id="${i}">
				<header>
					<h2>Article ${i}</h2>
					<p class="meta">By Author ${i % 10} on 2024-01-${(i % 28) + 1}</p>
				</header>
				<div class="content">
					<p>This is the content of article ${i}. It contains some text.</p>
					<p>Another paragraph with <a href="/article/${i}">a link</a>.</p>
				</div>
				<footer>
					<span class="tag">tag${i % 5}</span>
					<span class="tag">tag${(i + 1) % 5}</span>
				</footer>
			</article>
		`;
	}

	html += '</div></body></html>';
	return html;
}

// ============================================================================
// Benchmark Runner
// ============================================================================

interface BenchmarkResult {
	name: string;
	iterations: number;
	totalTime: number;
	avgTime: number;
	minTime: number;
	maxTime: number;
	opsPerSecond: number;
	htmlSize: number;
}

function runBenchmark(name: string, html: string, iterations: number): BenchmarkResult {
	const times: number[] = [];

	// Warmup - use fresh window each time
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		const window = new Window();
		const doc = new window.DOMParser().parseFromString(html, 'text/html');
		doc.body?.childNodes.length;
		window.close();
	}

	// Benchmark - use fresh window each iteration to avoid memory buildup
	for (let i = 0; i < iterations; i++) {
		const window = new Window();
		const start = performance.now();
		const doc = new window.DOMParser().parseFromString(html, 'text/html');
		doc.body?.childNodes.length;
		const end = performance.now();
		times.push(end - start);
		window.close();
	}

	const totalTime = times.reduce((a, b) => a + b, 0);
	const avgTime = totalTime / iterations;
	const minTime = Math.min(...times);
	const maxTime = Math.max(...times);

	return {
		name,
		iterations,
		totalTime,
		avgTime,
		minTime,
		maxTime,
		opsPerSecond: 1000 / avgTime,
		htmlSize: html.length,
	};
}

function runInnerHTMLBenchmark(name: string, html: string, iterations: number): BenchmarkResult {
	const times: number[] = [];

	// Warmup
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		const window = new Window();
		const div = window.document.createElement('div');
		div.innerHTML = html;
		div.childNodes.length;
		window.close();
	}

	// Benchmark
	for (let i = 0; i < iterations; i++) {
		const window = new Window();
		const div = window.document.createElement('div');
		const start = performance.now();
		div.innerHTML = html;
		div.childNodes.length;
		const end = performance.now();
		times.push(end - start);
		window.close();
	}

	const totalTime = times.reduce((a, b) => a + b, 0);
	const avgTime = totalTime / iterations;
	const minTime = Math.min(...times);
	const maxTime = Math.max(...times);

	return {
		name: `${name} (innerHTML)`,
		iterations,
		totalTime,
		avgTime,
		minTime,
		maxTime,
		opsPerSecond: 1000 / avgTime,
		htmlSize: html.length,
	};
}

function formatResult(result: BenchmarkResult): string {
	return [
		`  ${result.name}`,
		`    HTML size: ${result.htmlSize.toLocaleString()} bytes`,
		`    Iterations: ${result.iterations}`,
		`    Avg: ${result.avgTime.toFixed(3)} ms`,
		`    Min: ${result.minTime.toFixed(3)} ms`,
		`    Max: ${result.maxTime.toFixed(3)} ms`,
		`    Ops/sec: ${result.opsPerSecond.toFixed(2)}`,
		'',
	].join('\n');
}

function formatResultsTable(results: BenchmarkResult[]): string {
	const headers = ['Test', 'Size (bytes)', 'Avg (ms)', 'Min (ms)', 'Max (ms)', 'Ops/sec'];
	const rows = results.map((r) => [
		r.name,
		r.htmlSize.toLocaleString(),
		r.avgTime.toFixed(3),
		r.minTime.toFixed(3),
		r.maxTime.toFixed(3),
		r.opsPerSecond.toFixed(2),
	]);

	// Calculate column widths
	const widths = headers.map((h, i) =>
		Math.max(h.length, ...rows.map((r) => r[i].length))
	);

	const separator = widths.map((w) => '-'.repeat(w)).join(' | ');
	const formatRow = (row: string[]) =>
		row.map((cell, i) => cell.padEnd(widths[i])).join(' | ');

	return [
		formatRow(headers),
		separator,
		...rows.map(formatRow),
	].join('\n');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
	console.log('='.repeat(80));
	console.log('HTML Parser Benchmark Suite');
	console.log('='.repeat(80));
	console.log(`Warmup iterations: ${WARMUP_ITERATIONS}`);
	console.log(`Benchmark iterations: ${BENCHMARK_ITERATIONS}`);
	console.log('');

	const results: BenchmarkResult[] = [];

	// Run DOMParser benchmarks
	console.log('Running DOMParser.parseFromString() benchmarks...\n');
	for (const [name, html] of Object.entries(HTML_SAMPLES)) {
		process.stdout.write(`  Testing: ${name}...`);
		const result = runBenchmark(name, html, BENCHMARK_ITERATIONS);
		results.push(result);
		console.log(` done (${result.avgTime.toFixed(3)} ms avg)`);
	}

	console.log('\nRunning innerHTML benchmarks...\n');
	// Run innerHTML benchmarks (subset - skip full documents)
	const innerHTMLTests = ['simple', 'attributesHeavy', 'deeplyNested', 'wideTree', 'mixedContent', 'malformed'];
	for (const name of innerHTMLTests) {
		const html = HTML_SAMPLES[name as keyof typeof HTML_SAMPLES];
		process.stdout.write(`  Testing: ${name} (innerHTML)...`);
		const result = runInnerHTMLBenchmark(name, html, BENCHMARK_ITERATIONS);
		results.push(result);
		console.log(` done (${result.avgTime.toFixed(3)} ms avg)`);
	}

	// Print results
	console.log('\n' + '='.repeat(80));
	console.log('Results Summary');
	console.log('='.repeat(80) + '\n');

	console.log(formatResultsTable(results));

	// Print JSON for easy comparison
	console.log('\n' + '='.repeat(80));
	console.log('JSON Results (for comparison)');
	console.log('='.repeat(80));
	console.log(JSON.stringify(
		results.map((r) => ({
			name: r.name,
			avgMs: parseFloat(r.avgTime.toFixed(3)),
			opsPerSec: parseFloat(r.opsPerSecond.toFixed(2)),
			htmlSize: r.htmlSize,
		})),
		null,
		2
	));
}

main().catch(console.error);
