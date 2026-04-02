/**
 * STER (System for Teacher Evaluation and Retention) Competency Data
 */

export interface RubricLevel {
  label: string;
  description: string;
}

export interface Competency {
  id: string;
  descriptor: string;
  rubric: {
    level0: RubricLevel;
    level1: RubricLevel;
    level2: RubricLevel;
    level3: RubricLevel;
  };
}

export interface CompetencyCategory {
  [key: string]: Competency[];
}

export const STER_COMPETENCIES: CompetencyCategory = {
  LL: [
    {
      id: 'LL1',
      descriptor: 'Knows learners and applies that knowledge to inform plans and practices',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Shows little to no understanding of student backgrounds, learning styles, or individual needs. Does not adjust instruction based on learner characteristics.',
        },
        level1: {
          label: 'Developing',
          description: 'Demonstrates basic awareness of some student differences but inconsistently applies this knowledge to instructional planning or practice.',
        },
        level2: {
          label: 'Proficient',
          description: 'Understands student backgrounds, learning styles, and needs. Regularly uses this knowledge to inform lesson planning and differentiate instruction.',
        },
        level3: {
          label: 'Distinction',
          description: 'Deep understanding of diverse learners. Systematically uses multiple sources of student data to continuously refine practices and create highly personalized learning experiences.',
        },
      },
    },
  ],
  IC: [
    {
      id: 'IC1',
      descriptor: 'Communicates learning objectives and purpose',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Learning objectives are absent, unclear, or not communicated to students. Purpose of lesson is not evident.',
        },
        level1: {
          label: 'Developing',
          description: 'Learning objectives are stated but may be vague or difficult for students to understand.',
        },
        level2: {
          label: 'Proficient',
          description: 'Clear learning objectives are communicated. Students understand what they are learning and why.',
        },
        level3: {
          label: 'Distinction',
          description: 'Learning objectives are compelling, clearly articulated, and connected to larger learning goals. Students can articulate purpose and relevance.',
        },
      },
    },
  ],
  IP: [
    {
      id: 'IP1',
      descriptor: 'Plans structured and organized lessons',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Lesson plans are absent or poorly organized. Instruction appears random or unplanned.',
        },
        level1: {
          label: 'Developing',
          description: 'Basic lesson planning evident but lacks coherence or clear progression toward objectives.',
        },
        level2: {
          label: 'Proficient',
          description: 'Well-organized lessons with clear sequence of activities designed to achieve stated objectives.',
        },
        level3: {
          label: 'Distinction',
          description: 'Strategic planning with intentional scaffolding and multiple pathways. Adjustments made based on ongoing assessment.',
        },
      },
    },
  ],
  CC: [
    {
      id: 'CC1',
      descriptor: 'Establishes and maintains behavioral expectations',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'No clear behavioral expectations. Classroom management is ineffective or chaotic.',
        },
        level1: {
          label: 'Developing',
          description: 'Behavioral expectations are stated but inconsistently applied or enforced.',
        },
        level2: {
          label: 'Proficient',
          description: 'Clear behavioral expectations established and consistently applied. Students understand and follow routines.',
        },
        level3: {
          label: 'Distinction',
          description: 'Proactive classroom management with positive expectations students co-create. Students self-regulate behavior.',
        },
      },
    },
  ],
  PR: [
    {
      id: 'PR1',
      descriptor: 'Demonstrates content and pedagogical knowledge',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Significant gaps in content knowledge or pedagogical expertise. Instruction is inaccurate or ineffective.',
        },
        level1: {
          label: 'Developing',
          description: 'Basic content knowledge present but may have gaps. Pedagogical expertise is developing.',
        },
        level2: {
          label: 'Proficient',
          description: 'Solid content and pedagogical knowledge. Instruction is accurate and well-informed.',
        },
        level3: {
          label: 'Distinction',
          description: 'Deep expertise with nuanced understanding of content and pedagogy. Instruction is sophisticated and research-based.',
        },
      },
    },
  ],
};

export const SCORE_LABELS = {
  0: 'Not Met',
  1: 'Developing',
  2: 'Proficient',
  3: 'Distinction',
} as const;

export type ScoreLevel = 0 | 1 | 2 | 3 | null;

export interface STERScores {
  [competencyId: string]: {
    score: ScoreLevel;
    notes: string;
  };
}