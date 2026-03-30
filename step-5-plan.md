# STER Scoring Interface - Step 5 Evaluate Plan (Revised from Figma)

## TL;DR
Build a two-panel layout **Left: Category Navigator** + **Right: Expanded Scoring Card** with inline rubric descriptions. One competency card expands at a time showing 4 score pills (0-3), full level rubric descriptions, and notes textarea. Collapsed rows below show checkmark badges, IDs, and "add notes" buttons. All 35 competencies require Level 2+ for passing.

## STER Competency Structure

**LL (Learners and Learning)**: LL1-LL7 (7 items)
**IC (Instructional Clarity)**: IC1/IC2, IC3, IC4, IC5/IC6, IC7 (5 items)  
**IP (Instructional Practice)**: IP1-IP8 (8 items)
**CC (Classroom Climate)**: CC1-CC8 (8 items)
**PR (Professional Responsibility)**: PR1-PR7 (7 items)
**TOTAL**: 35 competencies (all require ≥ Level 2 to pass)

---

## Layout Architecture (Based on Figma)

### Two-Column Structure (Navigator | Scoring Card + Collapsed List)

```
┌───────────────────┬────────────────────────────────────────────────────┐
│  Category Nav     │  "Scoring & Review Competencies"                   │
│  (Left Sidebar)   │                                                    │
│                   │  [Blue ●] Learners & Learning                      │
│ [✓] Learners &    │  ┌─────────────────────────────────────────────┐  │
│     Learning      │  │ LL1: Knows learners...                  [✓] │  │
│ [ ] Instructional │  │                                              │  │
│     Clarity       │  │ Select Score Level:                         │  │
│ [ ] Instructional │  │ [0 Not Met] [1 Dev] [2 Prof] [3 Distinction]  │  │
│     Practice      │  │                                              │  │
│ [ ] Classroom     │  │ Scoring Rubric:                             │  │
│     Climate       │  │ ┌──[❌ Red]...Level 0 description...     │  │
│ [ ] Professional  │  │ ┌──[⚠️ Amber]...Level 1 description...  │  │
│     Responsibility│  │ ┌──[🟡 Yellow]...Level 2 description...  │  │
│                   │  │ ┌──[✅ Green]...Level 3 description...  │  │
│ [AI Analysis]     │  │                                              │  │
│                   │  │ Evaluation & Justification (Optional):       │  │
│                   │  │ [Text Area]                                  │  │
│                   │  └─────────────────────────────────────────────┘  │
│                   │                                                    │
│                   │  ┌──[✓] LL2 ──────────── [I want to add notes] ┐  │
│                   │  ┌──[✓] LL3 ──────────── [I want to add notes] ┐  │
│                   │  ┌──[ ] LL4 ──────────── [I want to add notes] ┐  │
│                   │  ┌──[✓] LL5 ──────────── [I want to add notes] ┐  │
│                   │  ┌──[✓] LL6 ──────────── [I want to add notes] ┐  │
│                   │  ┌──[ ] LL7 ──────────── [I want to add notes] ┐  │
│                   │                                                    │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## Component Structure (Hierarchical)

### 1. **EvaluateStep** (existing parent component)
- Maintains timer state & passage from Evaluations.tsx
- Renders two-column layout: STERNavigator | STERScoringInterface

### 2. **STERNavigator** (NEW - Left Sidebar)
- 5 category buttons: LL, IC, IP, CC, PR
- Each shows: [Checkmark or empty] Category Name
- onClick handler sets selectedCategory
- Active button highlighted (blue background or bold)
- Shows visual completion status with checkmarks
- "AI Analysis" button at bottom

### 3. **STERScoringInterface** (NEW - Right Panel)
- Main scoring area
- Header: "Scoring & Review Competencies"
- Expanded card: selected competency with full scoring interface
- Collapsed list: all other competencies in category (scrollable)

### 4. **STERExpandedCard** (NEW)
- Full-size competency scoring card (expanded state)
- Content:
  - Competency ID + descriptor (e.g., "LL1: Knows learners...")
  - Score pills: 4 buttons (0 Not Met, 1 Developing, 2 Proficient, 3 Distinction)
  - Rubric section: 4 collapsible/expandable rows (one per level)
    - Each row shows: [Color badge] Level Name → Level description
  - TextArea: "Evaluation & Justification (Optional)"
  - Checkmark icon when score selected

### 5. **STERCollapsedRow** (NEW)
- Compact list item for unselected competencies
- Layout: [Checkmark/Empty] ID → Descriptor → [I want to add notes button]
- onClick expands this competency (collapses previous expanded)

---

## State Management (in EvaluateStep)

```typescript
interface STERScore {
  [competencyId: string]: {
    score: 0 | 1 | 2 | 3 | null;  // null = unscored
    notes: string;
  };
}

State:
- sterScores: STERScore = {}  // All 35 competencies
- selectedCategory: 'LL' | 'IC' | 'IP' | 'CC' | 'PR' = 'LL'
- expandedCompetencyId: string | null = null  // e.g., "LL1" (currently expanded)
```

---

## Data Structure

```typescript
const STER_COMPETENCIES = {
  LL: [
    { id: 'LL1', descriptor: 'Knows learners and applies that knowledge', rubric: { ... } },
    { id: 'LL2', descriptor: 'Differentiates instruction...', rubric: { ... } },
    // ... LL3-LL7
  ],
  IC: [
    { id: 'IC1', descriptor: 'Clear communication of learning objectives...', rubric: { ... } },
    // ... IC2-IC7
  ],
  // ... IP, CC, PR
};

interface Rubric {
  level0: { label: 'Not Met', description: '...' };
  level1: { label: 'Developing', description: '...' };
  level2: { label: 'Proficient', description: '...' };
  level3: { label: 'Distinction', description: '...' };
}

const SCORE_COLORS = {
  0: '#dc2626',      // Red badge
  1: '#f59e0b',      // Amber/Yellow badge
  2: '#eab308',      // Yellow badge
  3: '#16a34a',      // Green badge
  null: '#d1d5db',   // Grey (unscored)
};
```

---

## Styling Strategy (Tailwind + globals.css)

### Score Pills (4 Button Group)
```css
.ster-score-pill {
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid #d1d5db;
  background: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ster-score-pill:hover {
  border-color: #1c6b3d;
}

.ster-score-pill.selected {
  background: var(--score-color);
  color: white;
  border-color: var(--score-color);
}

/* Example: Level 2 (Proficient) Selected */
.ster-score-pill.selected.level-2 {
  --score-color: #eab308;
}
```

### Rubric Level Rows (Expandable)
```css
.ster-rubric-row {
  border-left: 4px solid var(--level-color);
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.ster-rubric-row.level-0 { --level-color: #dc2626; }
.ster-rubric-row.level-1 { --level-color: #f59e0b; }
.ster-rubric-row.level-2 { --level-color: #eab308; }
.ster-rubric-row.level-3 { --level-color: #16a34a; }
```

### Checkmark Badges
```css
.ster-checkmark {
  color: #16a34a;
  font-weight: 700;
  margin-right: 8px;
}

.ster-empty-badge {
  color: #d1d5db;
  font-weight: 700;
  margin-right: 8px;
}
```

### Category Navigator (Left Sidebar)
- Button width: 100%
- Padding: 12px 16px
- Active: #1c6b3d background, white text
- Inactive: transparent, dark text
- Rounded: 12px
- Margin-bottom: 8px

### Expanded Card Container
- Background: #f0f0f0 (card color)
- Rounded: 16px
- Padding: 24px
- Margin-bottom: 20px
- Box-shadow: 0 4px 15px rgba(0,0,0,0.08)

---

## Scoring Levels Definition (from STER rubric)

**Level 0 (Not Met)**: Red (#dc2626) - Does not meet standard
**Level 1 (Developing)**: Amber (#f59e0b) - Partially meets standard
**Level 2 (Proficient)**: Yellow (#eab308) - Meets standard ✓ (PASSES)
**Level 3 (Distinction)**: Green (#16a34a) - Exceeds standard

All 35 competencies need ≥ Level 2 for passing score.

---

## Files to Create/Modify

**NEW FILES**:
- `src/components/STER/STERNavigator.tsx` — Left sidebar category buttons
- `src/components/STER/STERScoringInterface.tsx` — Right panel with expanded card + collapsed list
- `src/components/STER/STERExpandedCard.tsx` — Full scoring card (pills, rubric, textarea)
- `src/components/STER/STERCollapsedRow.tsx` — Compact competency row
- `src/utils/sterData.ts` — All 35 competencies with descriptors + level rubrics
- `src/styles/ster.css` (optional) — STER-specific styles (pills, badges, cards)

**MODIFIED FILES**:
- `src/components/steps/EvaluateStep.tsx` — Integrate new components (remove "Rubric" placeholder)
- `src/styles/globals.css` — Add color tokens for badges

---

## Implementation Steps

### Phase 1: Data & Foundation
1. Create `src/utils/sterData.ts` with all 35 competencies (5 categories × items) with:
   - `id` (LL1, IC1, etc.)
   - `descriptor` (full descriptor text)
   - `rubric` object with level0/1/2/3 descriptions
2. Add STER color tokens to `globals.css`

### Phase 2: Left Sidebar Navigator
3. Create `src/components/STER/STERNavigator.tsx`
   - 5 category buttons with checkmark completion badges
   - onClick sets `selectedCategory` in parent state
   - "AI Analysis" button at bottom (blue highlight)

### Phase 3: Right Panel - Expanded Card
4. Create `src/components/STER/STERExpandedCard.tsx`
   - Shows selected competency expanded
   - Score pills (0/1/2/3 buttons)
   - Rubric level rows (expandable/collapsible)
   - TextArea for notes
   - Checkmark when scored

### Phase 4: Right Panel - Collapsed List
5. Create `src/components/STER/STERCollapsedRow.tsx`
   - Compact row for unselected items
   - [✓/] ID → Descriptor → [Add Notes button]
   - onClick expands this item (collapses previous)

### Phase 5: Orchestrator
6. Create `src/components/STER/STERScoringInterface.tsx`
   - Renders STERExpandedCard (for selected item)
   - Renders list of STERCollapsedRow (all other items)
   - Manages expandedCompetencyId state

### Phase 6: Integration
7. Update `src/components/steps/EvaluateStep.tsx`
   - Remove placeholder "Rubric" content
   - Add state: `sterScores`, `selectedCategory`, `expandedCompetencyId`
   - Render STERNavigator + STERScoringInterface in flex layout
   - Pass handlers down component tree

### Phase 7: Validation & Completion
8. Add passing validation: ALL items ≥ Level 2 shows green validation badge
9. Wire "AI Analysis" button (future feature or placeholder)

---

## Verification Checklist

- [ ] All 35 competencies render in accordion
- [ ] Category navigation filters items correctly
- [ ] Left stroke color changes with score (0/1/2/3)
- [ ] Score persists when switching categories
- [ ] Notes persist independently per competency
- [ ] RadioGroup shows selected score
- [ ] Unscored items show grey stroke
- [ ] Only one accordion expands at a time
- [ ] User card displays independent of navigator
- [ ] Timer continues running in right sidebar
- [ ] Passing validation: all scores ≥ 2 flag green
- [ ] Responsive layout maintains 3-coumn structure

---

## Design Rationale (Senior UX/Engineering Perspective)

### Navigation Clarity
- 5 category buttons on left reduce cognitive load (vs. flat list of 35)
- Active category badge + item count provides quick scanning
- Accordion pattern prevents overwhelming 35-item interface

### Scoring Confidence
- Left stroke color = immediate visual feedback (score status at glance)
- 0/1/2/3 scale clear with color psychology (red→green)
- Notes box tied to each item prevents confusion

### Professional Polish
- Consistent card design (#f0f0f0 bg, rounded 20px shadows)
- Three-panel layout mirrors existing Evaluations design
- Timer remains visible (respects task continuity)

### Accessibility
- RadioGroup keyboard navigable (arrow keys)
- Color + text labels (not color alone)
- Sufficient contrast: #1c6b3d on white, green on white

---

## Further Considerations

1. **Export/Save**: Should scores auto-save or require explicit "Save Evaluation"?
2. **Progress Indicator**: Add % complete badge (e.g., "28/35 Scored")?
3. **Validation UX**: Show red banner if pass/fail status changes?
4. **Descriptors**: Should clicking "LL1" show full rubric descriptor in sidebar?
5. **PDF Export**: Will need to generate STER report post-Submit



---

## UI Flow (Happy Path)

1. **Open Evaluate Step** → Navigator shows all 5 categories (LL active)
2. **Select Score** → Click on competency in list → Card expands showing full UI
3. **Score Item** → Click pill "2 Proficient" → checkmark appears on expanded card
4. **Add Notes** → Type in textarea (optional, stores with competency)
5. **Move to Next** → Click LL2 below → LL1 collapses, LL2 expands
6. **Switch Category** → Click "IC" button in navigator → list filters to IC items
7. **Track Progress** → Checkmarks appear on collapsed rows as you score items
8. **Finish All** → All 35 scored ≥2 → Green "Ready to Submit" badge at top
9. **Submit** → Click "Next" in footer → Move to next step

---

## Key Design Decisions

- **Expanded card approach** (not accordion): Single item expands to full card, prevents overwhelming 35-item list
- **Pill buttons** (0/1/2/3): Intuitive, tactile, matches Figma and professional scoring UX
- **Rubric inline**: Full level descriptions show in expanded card (no separate modal/drawer)
- **Checkmarks + Badges**: Visual status without detailed inspection
- **Color sequence** (Red→Amber→Yellow→Green): Aligns with STER levels AND traffic light UX patterns
- **AI Analysis placeholder**: Keep as blue button for future ML features

---

## Further Considerations

1. **"Add Notes" Interaction**: Should button expand item or just toggle textarea visibility?
   - **Recommendation**: Expand item + auto-focus textarea (better UX)

2. **Category Completion**: Show % complete per category? (e.g., "LL: 6/7")
   - **Recommendation**: Add to navigator label → "LL (6/7)" badge

3. **Scroll Behavior**: Keep expanded card centered or scroll to top?
   - **Recommendation**: Scroll expanded card into view (mobile-friendly)

4. **Validation Before Submit**: Allow submission with <2 scores, or hard block?
   - **Recommendation**: Hard block + show red banner "Items below Level 2: [list]"

5. **Undo/Reset**: Should evaluators be able to reset category scores?
   - **Recommendation**: Add "Clear" button next to category label (optional feature)

---

## Ready for Implementation

All 35 competencies mapped, Figma design adopted, component hierarchy clear, and state management planned. Proceed with Phase 1 (sterData.ts creation).
