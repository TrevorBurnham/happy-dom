#!/bin/bash

# HTML Parser Branch Comparison Script
# 
# Usage: ./compare-branches.sh [base-branch]
# Default base branch: master
#
# This script:
# 1. Runs benchmarks on the current branch
# 2. Stashes changes, switches to base branch
# 3. Runs benchmarks on base branch
# 4. Switches back and shows comparison

set -e

BASE_BRANCH="${1:-master}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BENCHMARK_DIR="packages/happy-dom/benchmark"
RESULTS_DIR="$BENCHMARK_DIR/results"

echo "========================================"
echo "HTML Parser Branch Comparison"
echo "========================================"
echo "Current branch: $CURRENT_BRANCH"
echo "Base branch: $BASE_BRANCH"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Run benchmark on current branch
echo "Running benchmark on $CURRENT_BRANCH..."
npx tsx "$BENCHMARK_DIR/html-parser-benchmark.ts" > "$RESULTS_DIR/current-branch.txt" 2>&1

# Extract JSON results
grep -A 1000 '"name":' "$RESULTS_DIR/current-branch.txt" | head -n -1 > "$RESULTS_DIR/current-branch.json" 2>/dev/null || true

echo "Results saved to $RESULTS_DIR/current-branch.txt"
echo ""

# Check if we need to compare
if [ "$CURRENT_BRANCH" = "$BASE_BRANCH" ]; then
    echo "Already on $BASE_BRANCH, skipping comparison."
    cat "$RESULTS_DIR/current-branch.txt"
    exit 0
fi

# Stash any uncommitted changes
STASH_RESULT=$(git stash push -m "benchmark-temp-stash" 2>&1) || true

# Switch to base branch
echo "Switching to $BASE_BRANCH..."
git checkout "$BASE_BRANCH" --quiet

# Compile if needed
echo "Compiling $BASE_BRANCH..."
npm run compile --workspace=happy-dom --silent 2>/dev/null || npm run compile --workspace=happy-dom

# Run benchmark on base branch
echo "Running benchmark on $BASE_BRANCH..."
npx tsx "$BENCHMARK_DIR/html-parser-benchmark.ts" > "$RESULTS_DIR/base-branch.txt" 2>&1 || {
    echo "Note: Benchmark script may not exist on $BASE_BRANCH"
    echo "Copying benchmark script..."
    git checkout "$CURRENT_BRANCH" -- "$BENCHMARK_DIR/html-parser-benchmark.ts"
    npx tsx "$BENCHMARK_DIR/html-parser-benchmark.ts" > "$RESULTS_DIR/base-branch.txt" 2>&1
}

echo "Results saved to $RESULTS_DIR/base-branch.txt"

# Switch back to original branch
echo ""
echo "Switching back to $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH" --quiet

# Restore stashed changes if any
if [[ "$STASH_RESULT" != *"No local changes"* ]]; then
    git stash pop --quiet 2>/dev/null || true
fi

# Recompile current branch
echo "Recompiling $CURRENT_BRANCH..."
npm run compile --workspace=happy-dom --silent 2>/dev/null || npm run compile --workspace=happy-dom

echo ""
echo "========================================"
echo "Comparison Complete"
echo "========================================"
echo ""
echo "Results files:"
echo "  Current ($CURRENT_BRANCH): $RESULTS_DIR/current-branch.txt"
echo "  Base ($BASE_BRANCH): $RESULTS_DIR/base-branch.txt"
echo ""
echo "Run the comparison analyzer:"
echo "  npx tsx $BENCHMARK_DIR/analyze-results.ts"
