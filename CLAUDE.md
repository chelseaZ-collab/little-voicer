# LLM Wiki Schema — 少儿原版英语资源库

## Purpose

This schema defines how the LLM should maintain the wiki for a children's native English learning resource knowledge base. The user is a former English teacher (New Oriental, TOEFL/IELTS, children's interpreting) and Hong Kong Chinese University Translation graduate, now a mom of an 8-year-old. She runs a part-time Xiaohongshu (Little Red Book) blog and is building a product that curates YouTube/native resources for kids' listening, reading, and interpreting practice.

## Architecture Overview

Three layers:

1. **Raw/** — Immutable source materials. The LLM reads but never modifies.
2. **Wiki/** — LLM-generated knowledge pages. The LLM owns this layer entirely. You read it; the LLM writes it.
3. **This file (CLAUDE.md)** — The schema. Tells the LLM how to structure, name, and maintain the wiki.

## Directory Structure

```
Wiki/
├── index.md              # Content-oriented catalog of all wiki pages
├── log.md                # Chronological append-only log of operations
├── concepts/             # Language learning concepts (phonics, sight words, etc.)
├── entities/             # Specific resource pages (e.g. "Magic School Bus S1E3")
├── skills/               # Skill training methods (listening, shadowing, interpreting)
├── age-groups/           # Age-stratified learning paths and recommendations
└── comparisons/          # Resource comparisons (which is better for X?)
```

## Naming Conventions

### Wiki Pages

- **File names**: lowercase with hyphens, no special characters. E.g. `magic-school-bus-s1e3-water-cycle.md`
- **Folder names**: plural, lowercase, hyphenated. E.g. `concepts/`, `age-groups/`
- **Wiki-links**: Use consistent naming. Link to `[[phonics]]` not `[[Phonics]]`
- **Frontmatter**: Every wiki page MUST have YAML frontmatter with:

```yaml
---
tags: [resource-type]
created: YYYY-MM-DD
sources: [[source1]], [[source2]]
difficulty: beginner|intermediate|advanced
age-range: "6-8"
skills: [listening, reading, speaking]
---
```

### Raw Sources

- **videos/**: One file per video series or episode. Name: `series-name-episode-title.md`
- **articles/**: Transcripts, blog posts, curriculum guides.
- **audios/**: Podcast transcripts, audio lesson notes.
- **books/**: Picture book / chapter book summaries.
- **assets/**: Images, screenshots, posters.

## Page Templates

### Concept Page (`Wiki/concepts/`)

```markdown
---
tags: [concept]
created: YYYY-MM-DD
difficulty: N/A
age-range: "all"
skills: [reading]
---

# Concept Name

## Definition
One-sentence explanation of what this concept is.

## Why It Matters for Kids
Why this concept is important for children's English learning.

## Related Resources
- [[entity-page-1]]
- [[entity-page-2]]

## Learning Progression
How kids typically master this concept (stages).

## Cross-References
- Related concept: [[related-concept]]
- Skill area: [[skill-page]]
```

### Entity Page (`Wiki/entities/`)

```markdown
---
tags: [entity, resource-type]
created: YYYY-MM-DD
sources: [[raw-source]]
difficulty: beginner|intermediate|advanced
age-range: "X-Y"
skills: [listening, reading, speaking, interpreting]
---

# Resource Title

## Overview
Brief description (2-3 sentences).

## Metadata
- **Source**: YouTube / Book / Podcast / Website
- **Original URL**: (reference only)
- **Duration/Length**: 
- **Episode**: (if applicable)

## Learning Value
What skills does this resource develop?

## Difficulty Analysis
Vocabulary level, sentence complexity, cultural references.

## Recommended Age
Specific age range and why.

## Usage Tips
How teachers/parents should use this resource (pre-listening, during, post-activities).

## Connected Concepts
- [[phonics]]
- [[sight-words]]

## Related Resources
- [[similar-resource-1]]
- [[similar-resource-2]]
```

### Skill Page (`Wiki/skills/`)

```markdown
---
tags: [skill]
created: YYYY-MM-DD
difficulty: N/A
age-range: "all"
skills: [listening]
---

# Skill Name

## Description
What this skill/training method is.

## How to Practice
Step-by-step guidance for parents/teachers.

## Suitable Resources
- [[entity-page-1]] — why it works
- [[entity-page-2]] — why it works

## Age Adaptations
- Ages 3-5: approach A
- Ages 6-8: approach B
- Ages 9-11: approach C

## Progress Indicators
How to know the child is improving.
```

### Age Group Page (`Wiki/age-groups/`)

```markdown
---
tags: [age-group]
created: YYYY-MM-DD
difficulty: N/A
age-range: "X-Y"
skills: [all]
---

# Age Group: X-Y Years

## Developmental Characteristics
What cognitive/language abilities kids at this age typically have.

## Learning Goals
Key milestones for English at this age.

## Resource Recommendations
Curated list of entities suitable for this age.

## Skill Focus Areas
Which skills to prioritize.

## Parent Tips
How to guide practice at home.

## Progression Path
What comes next (link to older age group).
```

## Operations

### Ingest (Processing a Raw Source)

When a new source is placed in `Raw/`:

1. Read the raw source file
2. Discuss key takeaways with the user (if interactive)
3. Create/update entity page in `Wiki/entities/`
4. Update related concept pages in `Wiki/concepts/`
5. Update skill pages in `Wiki/skills/` if relevant
6. Update `index.md` with the new entry
7. Append to `log.md`

### Query (Answering Questions)

1. Read `index.md` first to find relevant pages
2. Drill into specific pages for details
3. Synthesize answer with citations (wiki-links)
4. If the answer reveals a useful comparison or insight, file it as a new wiki page

### Lint (Periodic Health Check)

Ask the LLM to check for:
- Orphan pages with no inbound `[[links]]`
- Missing cross-references between related concepts
- Stale difficulty/age recommendations
- Gaps: "We have resources for listening but not for interpreting practice"
- Contradictions: "Page A says age 5+, but Page B says same resource is for 8+"

## Index (`index.md`)

The index is content-oriented. Each entry:
- Links to the wiki page
- One-line summary
- Tags/metadata for filtering

Format:

```markdown
## Concepts
- [[phonics]] — Letter-sound relationships for early decoding
- [[sight-words]] — High-frequency words kids memorize visually

## Entities
- [[magic-school-bus-s1e3-water-cycle]] — Animated science episode, ESL level 2, ages 6-9
- [[storybook-the-cat-in-the-hat]] — Classic picture book, phonics focus

## Skills
- [[shadowing]] — Repeat-after-audio technique for pronunciation
- [[picture-description]] — Describe images in English for speaking practice

## Age Groups
- [[ages-6-8]] — Early elementary, focus on listening comprehension and basic reading
```

## Log (`log.md`)

Append-only, chronological. Format:

```markdown
## [YYYY-MM-DD] ingest | Resource Title
- Created: [[entity-page]]
- Updated concepts: [[concept-1]], [[concept-2]]
- Difficulty: X, Age: Y-Z

## [YYYY-MM-DD] query | User Question
- Answered from: [[page-1]], [[page-2]]
- Generated: [[new-comparison-page]] (if applicable)

## [YYYY-MM-DD] lint | Health Check
- Fixed: X orphan pages
- Updated: Y stale references
- Gaps identified: Z
```

## Domain-Specific Guidelines

### For This Knowledge Base Specifically

1. **Resource types to expect**: YouTube educational channels, picture books, graded readers, podcasts (Story Pirates, etc.), animated series (Magic School Bus, Bluey, etc.)
2. **Skills to track**: listening comprehension, phonics, sight word recognition, shadowing/repeating, basic interpreting (Chinese->English and English->Chinese), vocabulary acquisition, reading fluency
3. **Age groups to cover**: 3-5 (preschool), 6-8 (early elementary), 9-11 (upper elementary), 12+ (middle school)
4. **Difficulty levels**: Map to CEFR Pre-A1 through B1 for children
5. **Chinese context**: Always note cultural considerations for Chinese-speaking families

### Xiaohongshu Integration

When generating content ideas for the blog:
- Create a `comparisons/` page when two resources are commonly compared
- Tag resources that are "Xiaohongshu-friendly" (visually appealing, shareable clips)
- Track which resource types get the most engagement (note in log)

## Important Reminders

- **Never modify Raw/** — it's immutable source of truth
- **Always use wiki-links** — `[[page-name]]` not plain text descriptions
- **Keep pages concise** — 200-500 words per page, link deeper for details
- **Frontmatter is mandatory** — enables Dataview queries for the product
- **Cross-reference generously** — the value is in the connections, not individual pages
- **Update, don't duplicate** — if a new source reinforces an existing concept, update the concept page rather than creating a new one
