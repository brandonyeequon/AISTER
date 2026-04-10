# AISTER — Claude Code Playbook

## 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Use plan mode for verification steps, not just building — write detailed specs upfront to reduce ambiguity

## 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents — one task per subagent for focused execution

## 3. Self-Improvement Loop
- After ANY correction from the user: update tasks/lessons.md with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops — review lessons at session start

## 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?" — run the build, check the console, demonstrate correctness

## 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer

## 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user

---

## 7. Project Overview

**AI-STER** is a web app for evaluating student teachers using the STER (Student Teacher Evaluation Rubric) system, built for Utah Valley University's School of Education.

The app is currently a **frontend-only prototype** — all auth and data is mocked in localStorage. A real backend (likely Supabase) is planned for a future phase.

| What it does | Details |
|---|---|
| **Core feature** | Multi-step evaluation form where evaluators score 35 competencies across 5 STER categories |
| **Auth** | Mocked via localStorage — any username + password "123456" works |
| **Persistence** | Evaluation drafts auto-saved to localStorage (key: `aister:evaluation-draft:v1`) |
| **Analytics** | Charts (Recharts) showing evaluation trends, score distribution, duration patterns |
| **Admin** | Placeholder admin dashboard for system oversight |

---

## 8. Directory Map

```
src/
├── main.tsx                      # React entry point
├── App.tsx                       # Router + AuthProvider wrapper
│
├── pages/
│   ├── Login.tsx                 # Auth page (login/signup tabs)
│   ├── Dashboard.tsx             # Teacher dashboard with stats
│   ├── Evaluations.tsx           # Main evaluation form (multi-step) ← core
│   ├── AdminDashboard.tsx        # Admin overview
│   ├── ResearchAnalytics.tsx     # Charts and KPI analytics
│   ├── Settings.tsx              # User preferences
│   └── NotFound.tsx              # 404 page
│
├── components/
│   ├── Button.tsx                # Reusable button (primary/secondary)
│   ├── Card.tsx                  # Reusable card container
│   ├── FormInput.tsx             # Labeled input with error display
│   ├── Navbar.tsx                # Top navigation bar
│   ├── ProtectedRoute.tsx        # Auth guard wrapper
│   ├── StepStepper.tsx           # Step progress indicator
│   │
│   ├── steps/                    # One component per evaluation step
│   │   ├── LessonPlanUploadStep.tsx
│   │   ├── DetailsStep.tsx
│   │   ├── NotesStep.tsx
│   │   └── EvaluateStep.tsx      # Wires up all STER components
│   │
│   └── STER/                     # STER rubric scoring UI ← most complex
│       ├── STERNavigator.tsx     # Category sidebar with completion badges
│       ├── STERScoringInterface.tsx # Expanded card + modal orchestration
│       ├── STERExpandedCard.tsx  # Score pills + rubric + notes for one competency
│       ├── STERCollapsedRow.tsx  # Compact row in the items modal
│       ├── STERItemsModal.tsx    # Modal listing all items in a category
│       ├── TimerFloat.tsx        # Reusable timer widget (sidebar version)
│       └── index.ts              # Re-export barrel
│
├── context/
│   └── AuthContext.tsx           # Auth state + localStorage session persistence
│
├── utils/
│   ├── sterData.ts               # All 35 STER competencies + scoring helpers
│   └── mockApi.ts                # Fake API responses (replace when backend ready)
│
└── styles/
    └── globals.css               # Global CSS + Tailwind directives + all custom classes
```

---

## 9. Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 + custom classes in `globals.css` |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod (Login page only) |
| Charts | Recharts |
| Icons | Lucide React exclusively — do not use other icon libraries |
| State | React Context (`AuthContext`) + `useState` — no Redux/Zustand |

---

## 10. Common Commands

```bash
# Run from the project root: /AISTER-1/

npm run dev       # Dev server on http://localhost:5173
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
npm run lint      # ESLint check
```

Demo credentials: **any username**, password **`123456`**

---

## 11. Architecture & Key Patterns

Follow these patterns — do not invent alternatives:

**Routing** — defined in `src/App.tsx`. All routes except `/login` are wrapped in `<ProtectedRoute>`. Default route (`/`) redirects to `/evaluations`.

**Auth** — always import `useAuth()` from `src/context/AuthContext.tsx`. Never read `localStorage` for user data directly in components.

**Pages** — one file per route in `src/pages/`. All pages include `<Navbar />` as first child of the returned layout div.

**Reusable UI** — always check `src/components/` (Button, Card, FormInput) before writing inline UI. Use the `Card` component for any white content box.

**STER scoring** — all 35 competency definitions live in `src/utils/sterData.ts`. Use `getCompetenciesInCategory()`, `getCategoryCompletion()`, and `isElegibleToPass()` for any scoring logic — don't duplicate these calculations inline.

**Multi-step form state** — all evaluation state (step, timer, scores, notes, files) lives in `Evaluations.tsx` and is passed down as props. Steps are conditionally rendered, not routed. Auto-save to localStorage runs via `useEffect` whenever any piece of state changes, but only after hydration (`isDraftHydrated` flag).

**Icons** — Lucide React only. Import individually: `import { Clock } from 'lucide-react'`.

**Styling** — Tailwind utility classes first. Custom CSS classes defined in `src/styles/globals.css` for complex components (navbar, STER cards, stepper). Custom design tokens defined in `tailwind.config.js`:
- `primary` = `#1c6b3d` (UVU green)
- `text` = `#8f949c`
- `bg` = `#e8e8e8`

---

## 12. Agent Workflow Shortcuts

**Adding a new page:**
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx` (wrap in `<ProtectedRoute>` if auth-required)
3. Add nav entry in `src/components/Navbar.tsx` (add to `navTabs` array)

**Adding a new component:**
1. Check `src/components/` — don't duplicate Button, Card, or FormInput
2. For STER-related components, add to `src/components/STER/` and export from `index.ts`
3. For evaluation step components, add to `src/components/steps/`

**Fixing a UI bug:**
1. Check `src/styles/globals.css` for the relevant CSS class
2. Check `tailwind.config.js` for theme tokens
3. Check the component's className props for the class being applied

**Adding a STER competency or category:**
1. Edit `src/utils/sterData.ts` — add to `STER_COMPETENCIES` object
2. Update `CATEGORY_ORDER` in `STERNavigator.tsx` if adding a new category
3. Update `CATEGORY_LABELS` in `STERNavigator.tsx` for the display name

**Connecting a real backend (future):**
- Auth: replace `login()` in `src/context/AuthContext.tsx` (marked with TODO)
- Data: replace functions in `src/utils/mockApi.ts` with real HTTP calls
- Never commit `src/utils/mockApi.ts` to production as-is

---

## 13. Code Commenting Standard

Every file you write or modify must have clear comments. This applies to all AI-assisted work.

**Functions & hooks** — JSDoc block above every exported function/hook:
```ts
/**
 * Calculates how many competencies in a category have been scored.
 * Returns { scored, total } for use in completion badges and progress checks.
 */
export function getCategoryCompletion(category: string, scores: STERScores) { ... }
```

**Components** — one-line JSDoc above every exported component:
```tsx
/** Category sidebar showing completion badges and triggering AI Analysis when all items are scored. */
export const STERNavigator: React.FC<STERNavigatorProps> = ({ ... }) => { ... }
```

**Non-obvious logic** — inline comment on or above the line:
```ts
// Guard against writing to localStorage before the draft hydration useEffect runs,
// which would overwrite the saved draft with empty default state on first render.
if (!isDraftHydrated) return;
```

**New files** — one-line header comment at the top:
```ts
// Multi-step evaluation form orchestrating timer, lesson plan, details, notes, and STER scoring.
```

**What NOT to comment:** obvious variable names, boilerplate imports, self-evident JSX markup, standard React patterns.

---

## 14. Known Issues & Future Work

| Issue | Location | Notes |
|---|---|---|
| Auth is fully mocked | `AuthContext.tsx:43` | TODO comment marks the replacement point |
| No real database | `mockApi.ts` | Replace all functions when backend is connected |
| `isElegibleToPass` typo | `sterData.ts` | Function is misspelled (should be `isEligible`) — fix when refactoring |
| Settings `defaultValue` misuse | `Settings.tsx` | `<option defaultValue="selected">` is not valid React — use `<select defaultValue>` |
| Dev login button exposed | `Login.tsx` | "Test Evaluations (Dev)" button must be removed before production |
| Statistics sidebar is hardcoded | `Evaluations.tsx` | Shows 0 Completed / 0 Drafts — wire to real data |
| AI Analysis button non-functional | `STERNavigator.tsx` | Button appears when all items scored but does nothing yet |
