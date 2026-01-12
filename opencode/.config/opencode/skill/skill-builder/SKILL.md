---
name: skill-builder
description: Create and edit skills. Use when the user wants to create a new skill, edit an existing skill, troubleshoot skill issues, or asks about skill structure/syntax.
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Skill Builder

You help create and edit skills. You know the exact structure, validation rules, and best practices.

## When Creating a New Skill

1. Ask for: skill name, what it should do, when it should trigger
2. Determine location: personal (`~/.opencode/skill/`) or project (`.opencode/skill/`)
3. Create directory and SKILL.md
4. If complex, create supporting reference files

## When Editing a Skill

1. Read the existing SKILL.md first
2. Understand current structure before modifying
3. Preserve working parts, fix/enhance specific sections

## Skill Directory Structure

```
skill-name/
├── SKILL.md              # Required - main instructions
├── reference.md          # Optional - detailed docs (loaded on demand)
├── examples.md           # Optional - usage examples (loaded on demand)
└── scripts/
    └── helper.py         # Optional - utility scripts (executed, not loaded)
```

## Skill Locations (Priority Order)

| Location | Path | Scope |
|----------|------|-------|
| Enterprise | Managed settings | All org users |
| Personal | `~/.opencode/skill/skill-name/SKILL.md` | User across all projects |
| Project | `.opencode/skill/skill-name/SKILL.md` | Anyone in the repo |

## SKILL.md Template

```yaml
---
name: skill-name
description: What it does and when to use it. Include trigger keywords users would say.
---

# Skill Name

## Instructions

[Clear, step-by-step guidance for Agent]

## Examples

[Concrete examples of the skill in action]
```

## Required Frontmatter Fields

| Field | Constraints |
|-------|-------------|
| `name` | Lowercase, numbers, hyphens only. Max 64 chars. Must match directory name. |
| `description` | Max 1024 chars. Agent uses this for semantic matching to user requests. |

## Optional Frontmatter Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `allowed-tools` | Restrict Agent to specific tools | `allowed-tools: Read, Grep, Glob` |
| `model` | Force a specific model | `model: claude-sonnet-4-20250514` |

## Writing Good Descriptions

The description is CRITICAL - Agents uses semantic similarity to match requests.

**Good** (specific, keyword-rich):
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Bad** (vague):
```yaml
description: Helps with documents
```

### Description Checklist
- [ ] Lists specific capabilities (verbs: extract, fill, merge, analyze)
- [ ] Includes keywords users would naturally say
- [ ] Mentions use cases and context
- [ ] Under 1024 characters

## Progressive Disclosure

Keep SKILL.md under 500 lines. Link to supporting files for details:

```markdown
## Additional Resouraces

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)

## Utility Scripts

To validate input:
```bash
python scripts/helper.py input.txt
```
```

Agents load referenced files only when needed. Scripts execute without loading into context.

## allowed-tools Patterns

```yaml
# Read-only skill
allowed-tools: Read, Grep, Glob

# Python execution
allowed-tools: Read, Bash(python:*)

# Full file access
allowed-tools: Read, Write, Edit, Glob

# Web fetching
allowed-tools: WebFetch, WebSearch
```

If omitted, Agents uses standard permission model (asks before using tools).

## Using Skills with Subagents

In `.opencode/agent/agent-name.md`:
```yaml
---
description: Review code for quality
skills: pr-review, security-check
---
```


## Validation Rules

1. YAML frontmatter MUST start on line 1 with `---`
2. Use spaces for indentation, not tabs
3. `name` must match directory name
4. `name` can only contain: lowercase letters, numbers, hyphens
5. File must be named exactly `SKILL.md` (case-sensitive)

## Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| Skill not triggering | Add more trigger keywords to description |
| YAML parse error | Check `---` on line 1, spaces not tabs |
| Wrong path | Must be `SKILL.md` exactly, in correct directory |
| Skill conflicts | Make descriptions more distinct |
| Scripts fail | Run `chmod +x scripts/*.py` |
| Packages not found | Document required packages in SKILL.md |

## Creating a Skill: Step by Step

1. **Gather requirements**: name, purpose, trigger conditions
2. **Choose location**: personal vs project
3. **Create directory**: `mkdir -p ~/.opencode/skill/skill-name`
4. **Write SKILL.md**: frontmatter + instructions
5. **Add supporting files** if needed (reference docs, scripts)
6. **Restart OpenCode** to load the skill
7. **Test**: Ask Agent "What skills are available?" then trigger it

## Skill Templates

See [TEMPLATES.md](TEMPLATES.md) for starter templates for common skill types.

