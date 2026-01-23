# HTML Parser Benchmarks

Performance benchmarks for Happy DOM's HTML parser.

## Quick Start

### Run benchmarks on current branch

```bash
# From repository root
npx tsx packages/happy-dom/benchmark/html-parser-benchmark.ts

# Or from packages/happy-dom directory
npx tsx benchmark/html-parser-benchmark.ts
```

### Compare current branch to master

**Option 1: Manual comparison**

```bash
# Run on current branch and save results
npx tsx packages/happy-dom/benchmark/html-parser-benchmark.ts > packages/happy-dom/benchmark/results/current-branch.txt

# Switch to master, compile, and run
git stash
git checkout master
npm run compile --workspace=happy-dom
npx tsx packages/happy-dom/benchmark/html-parser-benchmark.ts > packages/happy-dom/benchmark/results/base-branch.txt

# Switch back
git checkout -
git stash pop
npm run compile --workspace=happy-dom

# Analyze
npx tsx packages/happy-dom/benchmark/analyze-results.ts
```

**Option 2: Use the comparison script**

```bash
./packages/happy-dom/benchmark/compare-branches.sh master
npx tsx packages/happy-dom/benchmark/analyze-results.ts
```

## Benchmark Tests

The benchmark suite tests various HTML parsing scenarios:

| Test | Description |
|------|-------------|
| `simple` | Basic HTML with a few elements |
| `attributesHeavy` | Elements with many attributes |
| `deeplyNested` | 20 levels of nested divs |
| `wideTree` | 100 sibling elements |
| `table` | 50x10 table structure |
| `form` | Form with 30 input fields |
| `mixedContent` | Text, comments, and elements |
| `malformed` | Intentionally broken HTML |
| `svg` | SVG content with namespaces |
| `template` | Template elements |
| `scriptsAndStyles` | Script and style tags |
| `fullDocument` | Complete HTML document |
| `largeDocument` | 500 article elements |

## Output

The benchmark outputs:
- Per-test timing (avg, min, max in milliseconds)
- Operations per second
- JSON results for programmatic comparison

## Manual Comparison

If you want to compare specific result files:

```bash
npx tsx benchmark/analyze-results.ts path/to/current.txt path/to/base.txt
```

## Interpreting Results

- **Avg (ms)**: Average time to parse the HTML (lower is better)
- **Ops/sec**: Parses per second (higher is better)
- **Change %**: Negative = faster, Positive = slower

A change within ±1% is considered noise and marked as unchanged.
