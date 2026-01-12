# Skill Templates

Starter templates for common skill types. Copy and customize.

## Minimal Skill

```yaml
---
name: my-skill
description: Does X when user asks about Y. Use when user mentions Z.
---

# My Skill

## Instructions

1. Step one
2. Step two
3. Step three
```

## Read-Only Analysis Skill

```yaml
---
name: code-analyzer
description: Analyzes code for patterns, complexity, and issues. Use when user asks to analyze, review, or examine code quality.
allowed-tools: Read, Grep, Glob
---

# Code Analyzer

Analyze code without making changes.

## Process

1. Use Glob to find relevant files
2. Use Read to examine contents
3. Use Grep to search for patterns
4. Report findings in structured format

## Output Format

- Summary of findings
- Specific issues with file:line references
- Recommendations
```

## Code Generation Skill

```yaml
---
name: component-generator
description: Generates React components following team conventions. Use when user asks to create, generate, or scaffold a component.
allowed-tools: Read, Write, Glob
---

# Component Generator

Generate React components following project patterns.

## Before Generating

1. Check existing components for patterns: `src/components/**/*.tsx`
2. Read the style guide if it exists
3. Match existing naming conventions

## Component Template

[Your component template here]

## Output

1. Create component file
2. Create test file
3. Export from index if pattern exists
```

## Script Execution Skill

```yaml
---
name: data-processor
description: Processes data files using Python scripts. Use when user wants to transform, analyze, or process data files.
allowed-tools: Read, Bash(python:*)
---

# Data Processor

Process data files with bundled Python scripts.

## Available Scripts

- `scripts/transform.py` - Transform data formats
- `scripts/analyze.py` - Generate statistics
- `scripts/validate.py` - Check data integrity

## Usage

To transform data:
```bash
python scripts/transform.py input.csv output.json
```

## Requirements

```bash
pip install pandas numpy
```
```

## Documentation Skill

```yaml
---
name: doc-generator
description: Generates documentation from code. Use when user asks to document, create docs, or generate README.
allowed-tools: Read, Grep, Glob
---

# Documentation Generator

Generate documentation by analyzing code.

## Process

1. Find entry points and public APIs
2. Extract function signatures and docstrings
3. Identify usage patterns
4. Generate markdown documentation

## Output Format

Return documentation in chat as markdown for easy copying.
```

## Multi-File Skill with References

```yaml
---
name: api-builder
description: Builds REST APIs following company standards. Use when creating endpoints, routes, or API handlers.
allowed-tools: Read, Write, Edit, Glob
---

# API Builder

Build REST APIs following our standards.

## Quick Start

1. Define endpoint: method, path, request/response
2. Generate handler, validation, tests
3. Register route

## References

- For database patterns, see [database.md](database.md)
- For auth patterns, see [auth.md](auth.md)
- For testing patterns, see [testing.md](testing.md)
```

## Web Research Skill

```yaml
---
name: tech-researcher
description: Researches technical topics, libraries, and best practices. Use when user asks to research, compare options, or find documentation.
allowed-tools: WebSearch, WebFetch, Read
---

# Tech Researcher

Research technical topics and summarize findings.

## Process

1. Search for authoritative sources
2. Fetch and analyze documentation
3. Compare options if applicable
4. Summarize with recommendations

## Output Format

- Summary of findings
- Pros/cons if comparing options
- Links to sources
- Recommendation with rationale
```

## Workflow Automation Skill

```yaml
---
name: pr-reviewer
description: Reviews pull requests for code quality, tests, and documentation. Use when user asks to review a PR or check changes.
allowed-tools: Read, Grep, Glob, Bash
---

# PR Reviewer

Review pull requests systematically.

## Review Checklist

1. **Code Quality**: Style, complexity, naming
2. **Tests**: Coverage, edge cases
3. **Documentation**: Updated if needed
4. **Security**: No secrets, safe inputs

## Process

1. Get changed files: `git diff --name-only main`
2. Read each changed file
3. Check for test coverage
4. Report findings

## Output Format

### Summary
[Overall assessment]

### Issues
- [ ] Issue 1 (file:line)
- [ ] Issue 2 (file:line)

### Suggestions
- Suggestion 1
- Suggestion 2
```

## Subagent-Compatible Skill

For use with custom subagents in `.claude/agents/`:

```yaml
---
name: security-check
description: Checks code for security vulnerabilities. Use when reviewing security-sensitive code.
allowed-tools: Read, Grep, Glob
---

# Security Checker

Check for common security vulnerabilities.

## Patterns to Check

- SQL injection: raw queries with string concatenation
- XSS: unescaped user input in HTML
- Secrets: hardcoded API keys, passwords
- Auth: missing authentication checks

## Output

Report each finding with:
- Severity (critical/high/medium/low)
- File and line number
- Description
- Recommended fix
```

Then reference in agent:
```yaml
# .claude/agents/code-reviewer/AGENT.md
---
name: code-reviewer
description: Reviews code for quality and security
skills: security-check, style-check
---
```
