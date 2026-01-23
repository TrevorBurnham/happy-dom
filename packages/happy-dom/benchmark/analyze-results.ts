/**
 * Benchmark Results Analyzer
 *
 * Compares benchmark results between two branches.
 * Run after compare-branches.sh or with manual result files.
 *
 * Usage: npx tsx benchmark/analyze-results.ts [current-file] [base-file]
 */

import * as fs from 'fs';
import * as path from 'path';

interface BenchmarkResult {
	name: string;
	avgMs: number;
	opsPerSec: number;
	htmlSize: number;
}

interface Comparison {
	name: string;
	htmlSize: number;
	currentAvgMs: number;
	baseAvgMs: number;
	diffMs: number;
	diffPercent: number;
	currentOps: number;
	baseOps: number;
	opsImprovement: number;
}

function extractJsonFromFile(filePath: string): BenchmarkResult[] {
	const content = fs.readFileSync(filePath, 'utf-8');

	// Find JSON array in the output
	const jsonMatch = content.match(/\[\s*\{[\s\S]*?\}\s*\]/);
	if (!jsonMatch) {
		throw new Error(`Could not find JSON results in ${filePath}`);
	}

	return JSON.parse(jsonMatch[0]);
}

function compareResults(current: BenchmarkResult[], base: BenchmarkResult[]): Comparison[] {
	const baseMap = new Map(base.map((r) => [r.name, r]));
	const comparisons: Comparison[] = [];

	for (const curr of current) {
		const baseResult = baseMap.get(curr.name);
		if (!baseResult) {
			console.warn(`Warning: No base result for "${curr.name}"`);
			continue;
		}

		const diffMs = curr.avgMs - baseResult.avgMs;
		const diffPercent = ((curr.avgMs - baseResult.avgMs) / baseResult.avgMs) * 100;
		const opsImprovement = ((curr.opsPerSec - baseResult.opsPerSec) / baseResult.opsPerSec) * 100;

		comparisons.push({
			name: curr.name,
			htmlSize: curr.htmlSize,
			currentAvgMs: curr.avgMs,
			baseAvgMs: baseResult.avgMs,
			diffMs,
			diffPercent,
			currentOps: curr.opsPerSec,
			baseOps: baseResult.opsPerSec,
			opsImprovement,
		});
	}

	return comparisons;
}

function formatComparison(comparisons: Comparison[]): string {
	const lines: string[] = [];

	// Header
	lines.push('');
	lines.push('='.repeat(100));
	lines.push('Performance Comparison: Current Branch vs Base Branch');
	lines.push('='.repeat(100));
	lines.push('');

	// Summary
	const improvements = comparisons.filter((c) => c.diffPercent < -1);
	const regressions = comparisons.filter((c) => c.diffPercent > 1);
	const unchanged = comparisons.filter((c) => Math.abs(c.diffPercent) <= 1);

	lines.push('Summary:');
	lines.push(`  ✅ Improvements (>1% faster): ${improvements.length}`);
	lines.push(`  ❌ Regressions (>1% slower): ${regressions.length}`);
	lines.push(`  ➖ Unchanged (±1%): ${unchanged.length}`);
	lines.push('');

	// Calculate overall change
	const totalCurrentTime = comparisons.reduce((sum, c) => sum + c.currentAvgMs, 0);
	const totalBaseTime = comparisons.reduce((sum, c) => sum + c.baseAvgMs, 0);
	const overallChange = ((totalCurrentTime - totalBaseTime) / totalBaseTime) * 100;

	lines.push(`Overall Performance Change: ${overallChange > 0 ? '+' : ''}${overallChange.toFixed(2)}%`);
	if (overallChange < 0) {
		lines.push(`  → Current branch is ${Math.abs(overallChange).toFixed(2)}% FASTER overall`);
	} else if (overallChange > 0) {
		lines.push(`  → Current branch is ${overallChange.toFixed(2)}% SLOWER overall`);
	}
	lines.push('');

	// Detailed results table
	lines.push('-'.repeat(100));
	lines.push('Detailed Results:');
	lines.push('-'.repeat(100));
	lines.push('');

	const headers = ['Test', 'Size', 'Current (ms)', 'Base (ms)', 'Diff (ms)', 'Change', 'Status'];
	const colWidths = [30, 12, 14, 14, 12, 10, 8];

	const formatRow = (cells: string[]) =>
		cells.map((cell, i) => cell.slice(0, colWidths[i]).padEnd(colWidths[i])).join(' | ');

	lines.push(formatRow(headers));
	lines.push(colWidths.map((w) => '-'.repeat(w)).join('-+-'));

	// Sort by performance change (worst regressions first)
	const sorted = [...comparisons].sort((a, b) => b.diffPercent - a.diffPercent);

	for (const c of sorted) {
		let status = '➖';
		if (c.diffPercent < -1) status = '✅';
		else if (c.diffPercent > 1) status = '❌';

		const changeStr = `${c.diffPercent > 0 ? '+' : ''}${c.diffPercent.toFixed(1)}%`;

		lines.push(
			formatRow([
				c.name,
				c.htmlSize.toLocaleString(),
				c.currentAvgMs.toFixed(3),
				c.baseAvgMs.toFixed(3),
				`${c.diffMs > 0 ? '+' : ''}${c.diffMs.toFixed(3)}`,
				changeStr,
				status,
			])
		);
	}

	lines.push('');

	// Highlight significant changes
	if (regressions.length > 0) {
		lines.push('-'.repeat(100));
		lines.push('⚠️  Regressions (tests that got slower):');
		lines.push('-'.repeat(100));
		for (const r of regressions.sort((a, b) => b.diffPercent - a.diffPercent)) {
			lines.push(
				`  ${r.name}: ${r.baseAvgMs.toFixed(3)}ms → ${r.currentAvgMs.toFixed(3)}ms (+${r.diffPercent.toFixed(1)}%)`
			);
		}
		lines.push('');
	}

	if (improvements.length > 0) {
		lines.push('-'.repeat(100));
		lines.push('🎉 Improvements (tests that got faster):');
		lines.push('-'.repeat(100));
		for (const i of improvements.sort((a, b) => a.diffPercent - b.diffPercent)) {
			lines.push(
				`  ${i.name}: ${i.baseAvgMs.toFixed(3)}ms → ${i.currentAvgMs.toFixed(3)}ms (${i.diffPercent.toFixed(1)}%)`
			);
		}
		lines.push('');
	}

	return lines.join('\n');
}

async function main() {
	const args = process.argv.slice(2);
	const resultsDir = path.join(import.meta.dirname || '.', 'results');

	const currentFile = args[0] || path.join(resultsDir, 'current-branch.txt');
	const baseFile = args[1] || path.join(resultsDir, 'base-branch.txt');

	console.log('Analyzing benchmark results...');
	console.log(`  Current: ${currentFile}`);
	console.log(`  Base: ${baseFile}`);

	if (!fs.existsSync(currentFile)) {
		console.error(`Error: Current results file not found: ${currentFile}`);
		console.error('Run the benchmark first: npx tsx benchmark/html-parser-benchmark.ts');
		process.exit(1);
	}

	if (!fs.existsSync(baseFile)) {
		console.error(`Error: Base results file not found: ${baseFile}`);
		console.error('Run compare-branches.sh or provide both result files.');
		console.error('');
		console.error('To run benchmark on current branch only:');
		console.error('  npx tsx benchmark/html-parser-benchmark.ts');
		process.exit(1);
	}

	try {
		const currentResults = extractJsonFromFile(currentFile);
		const baseResults = extractJsonFromFile(baseFile);

		const comparisons = compareResults(currentResults, baseResults);
		console.log(formatComparison(comparisons));
	} catch (error) {
		console.error('Error analyzing results:', error);
		process.exit(1);
	}
}

main();
