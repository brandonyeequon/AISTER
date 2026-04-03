/**
 * STER (Student Teacher Evaluation Rubric) competency data and scoring utilities.
 *
 * Contains all 35 competencies across 5 categories:
 *   - LL (Learners & Learning)       — 7 items
 *   - IC (Instructional Clarity)     — 5 items
 *   - IP (Instructional Practice)    — 8 items
 *   - CC (Classroom Climate)         — 8 items
 *   - PR (Professional Responsibility) — 7 items
 *
 * Each competency has a 4-level rubric: 0 = Not Met, 1 = Developing, 2 = Proficient, 3 = Distinction.
 * A teacher must score ≥2 on all 35 items to be eligible to pass.
 */

/** One level of a competency rubric (e.g., "Proficient"). */
export interface RubricLevel {
  label: string;
  description: string;
}

/** A single STER competency with its ID, descriptor, and 4-level rubric. */
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

/** Maps category codes (e.g., "LL") to their list of competencies. */
export interface CompetencyCategory {
  [key: string]: Competency[];
}

/** All 35 STER competencies, keyed by category code. */
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
    {
      id: 'LL2',
      descriptor: 'Differentiates instruction to meet the needs of all learners',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Provides one-size-fits-all instruction with no modifications for different learner needs or abilities.',
        },
        level1: {
          label: 'Developing',
          description: 'Attempts some differentiation strategies but implementation is inconsistent or limited in scope.',
        },
        level2: {
          label: 'Proficient',
          description: 'Consistently differentiates content, process, or product to address student readiness levels, interests, and learning profiles.',
        },
        level3: {
          label: 'Distinction',
          description: 'Seamlessly differentiates instruction across multiple dimensions. Students have multiple pathways to learning and demonstrate ownership of their learning goals.',
        },
      },
    },
    {
      id: 'LL3',
      descriptor: 'Facilitates student engagement and motivation to learn',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Students appear disengaged or uninterested. Little evidence of activities designed to motivate or engage learners.',
        },
        level1: {
          label: 'Developing',
          description: 'Some attempts to engage students, but motivation strategies are inconsistent or ineffective for many learners.',
        },
        level2: {
          label: 'Proficient',
          description: 'Students are generally engaged and motivated. Teacher uses varied strategies to maintain interest and encourage participation.',
        },
        level3: {
          label: 'Distinction',
          description: 'Students demonstrate high levels of engagement and intrinsic motivation. Learning activities are relevant, challenging, and connected to real-world contexts.',
        },
      },
    },
    {
      id: 'LL4',
      descriptor: 'Addresses social, emotional, and developmental needs of students',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Ignores or dismisses students\' social, emotional, or developmental needs. Creates an environment that may be harmful to student well-being.',
        },
        level1: {
          label: 'Developing',
          description: 'Acknowledges student needs intermittently but support is inconsistent or limited in scope.',
        },
        level2: {
          label: 'Proficient',
          description: 'Consistently addresses student social, emotional, and developmental needs. Provides appropriate support and creates a caring classroom environment.',
        },
        level3: {
          label: 'Distinction',
          description: 'Proactively fosters student social-emotional development. Students feel valued and supported; the classroom is a safe space for risk-taking and growth.',
        },
      },
    },
    {
      id: 'LL5',
      descriptor: 'Promotes student self and mutual accountability',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Students show no responsibility for their learning or behavior. Teacher controls all accountability measures.',
        },
        level1: {
          label: 'Developing',
          description: 'Some attempts to foster student accountability but students have limited ownership or agency in the process.',
        },
        level2: {
          label: 'Proficient',
          description: 'Students demonstrate self-awareness about their learning progress. Peer support and mutual accountability are present.',
        },
        level3: {
          label: 'Distinction',
          description: 'Students take ownership of their learning and behavior. Collaborative norms ensure mutual accountability and students actively support peer learning.',
        },
      },
    },
    {
      id: 'LL6',
      descriptor: 'Incorporates student background and culture into the curriculum',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Lacks awareness of or disregards student cultures and backgrounds. Curriculum reflects only mainstream perspectives.',
        },
        level1: {
          label: 'Developing',
          description: 'Occasionally incorporates student backgrounds but does so superficially or inconsistently.',
        },
        level2: {
          label: 'Proficient',
          description: 'Regularly incorporates student cultures and backgrounds in meaningful ways that validate diverse perspectives and experiences.',
        },
        level3: {
          label: 'Distinction',
          description: 'Curriculum is designed around student cultures and strengths. Multiple perspectives are authentically integrated; students see themselves reflected in content and pedagogy.',
        },
      },
    },
    {
      id: 'LL7',
      descriptor: 'Establishes and maintains positive relationships with students and families',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Relationships are strained or negative. Communication with families is minimal or adversarial.',
        },
        level1: {
          label: 'Developing',
          description: 'Relationships are cordial but superficial. Some attempts at family engagement but limited follow-through.',
        },
        level2: {
          label: 'Proficient',
          description: 'Positive relationships with students and families. Regular two-way communication and family involvement in learning.',
        },
        level3: {
          label: 'Distinction',
          description: 'Strong, trusting relationships with all students and families. Families actively partner in supporting student learning and teacher practices.',
        },
      },
    },
  ],
  IC: [
    {
      id: 'IC1',
      descriptor: 'Communicates learning objectives in a clear, coherent manner',
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
    {
      id: 'IC2',
      descriptor: 'Aligns instructional practices with learning objectives',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Instruction has little or no connection to stated learning objectives. Activities appear random or misaligned.',
        },
        level1: {
          label: 'Developing',
          description: 'Some activities align with objectives but others are disconnected or peripheral.',
        },
        level2: {
          label: 'Proficient',
          description: 'Instructional activities are well-aligned with learning objectives. Students engage in activities that support achievement of goals.',
        },
        level3: {
          label: 'Distinction',
          description: 'Seamless alignment between objectives, activities, and assessments. All instruction strategically builds toward mastery of learning targets.',
        },
      },
    },
    {
      id: 'IC3',
      descriptor: 'Uses clear explanations and modeling to develop student understanding',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Explanations are unclear, incomplete, or confusing. Minimal modeling or demonstration of concepts.',
        },
        level1: {
          label: 'Developing',
          description: 'Explanations and modeling are present but may lack clarity or thoroughness. Some confusion evident.',
        },
        level2: {
          label: 'Proficient',
          description: 'Teacher provides clear explanations and models thinking. Concepts are broken down logically and students understand.',
        },
        level3: {
          label: 'Distinction',
          description: 'Exceptionally clear explanations with varied models. Teacher checks for understanding and adjusts explanations as needed. Students transfer learning.',
        },
      },
    },
    {
      id: 'IC4',
      descriptor: 'Asks questions to develop higher-order thinking',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Questions are limited to recall or factual recall. No evidence of higher-order thinking being developed.',
        },
        level1: {
          label: 'Developing',
          description: 'Some higher-order questions asked but responses are not thoroughly explored or extended.',
        },
        level2: {
          label: 'Proficient',
          description: 'Regularly uses questions to develop analysis, synthesis, and evaluation. Students engage in meaningful thinking.',
        },
        level3: {
          label: 'Distinction',
          description: 'Skillfully crafted questions develop rigorous thinking. Students generate their own questions and engage in deep intellectual discourse.',
        },
      },
    },
    {
      id: 'IC5',
      descriptor: 'Provides clear feedback to guide student learning',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Feedback is absent, vague, or unhelpful. Students do not understand how to improve.',
        },
        level1: {
          label: 'Developing',
          description: 'Feedback is provided but may be unclear, delayed, or insufficient to guide improvement.',
        },
        level2: {
          label: 'Proficient',
          description: 'Clear, timely feedback is provided. Students understand strengths and areas for growth.',
        },
        level3: {
          label: 'Distinction',
          description: 'Feedback is specific, actionable, and encourages reflection. Students use feedback to self-correct and set goals.',
        },
      },
    },
  ],
  IP: [
    {
      id: 'IP1',
      descriptor: 'Plans instruction to achieve the learning objectives',
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
    {
      id: 'IP2',
      descriptor: 'Uses a variety of instructional strategies and resources',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Limited instructional strategies used. Heavy reliance on one method. Few resources beyond textbook.',
        },
        level1: {
          label: 'Developing',
          description: 'Some variety in strategies but may be used inconsistently. Limited variety in resources.',
        },
        level2: {
          label: 'Proficient',
          description: 'Multiple instructional strategies and diverse resources used appropriately. Variety matches diverse student needs.',
        },
        level3: {
          label: 'Distinction',
          description: 'Sophisticated use of varied strategies and rich resources. Selection is purposeful and responsive to learner needs.',
        },
      },
    },
    {
      id: 'IP3',
      descriptor: 'Engages students in active learning',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Students are passive recipients of information. Minimal student engagement or participation.',
        },
        level1: {
          label: 'Developing',
          description: 'Students participate in activities but engagement is limited or inconsistent throughout the lesson.',
        },
        level2: {
          label: 'Proficient',
          description: 'Students actively engage in learning through discussion, problem-solving, and hands-on activities.',
        },
        level3: {
          label: 'Distinction',
          description: 'Students drive their own learning through inquiry, collaboration, and intellectual challenge. High levels of engagement throughout.',
        },
      },
    },
    {
      id: 'IP4',
      descriptor: 'Uses ongoing formative assessment to monitor student learning',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Little to no formative assessment. Teacher unclear about student understanding. Adjustments not made.',
        },
        level1: {
          label: 'Developing',
          description: 'Some formative assessment used but inconsistently. Data collection is incomplete or not fully used to guide instruction.',
        },
        level2: {
          label: 'Proficient',
          description: 'Regular formative assessment used to monitor progress. Adjustments made based on student understanding.',
        },
        level3: {
          label: 'Distinction',
          description: 'Continuous formative assessment seamlessly integrated. Students monitor their own progress and provide feedback on instruction.',
        },
      },
    },
    {
      id: 'IP5',
      descriptor: 'Promotes student collaboration and cooperative learning',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Students work in isolation. No collaborative structures or group work.',
        },
        level1: {
          label: 'Developing',
          description: 'Some group work but collaboration may be limited or not well-structured.',
        },
        level2: {
          label: 'Proficient',
          description: 'Structured cooperative learning activities where students collaborate effectively toward learning goals.',
        },
        level3: {
          label: 'Distinction',
          description: 'Sophisticated collaborative structures where students take on roles, provide peer feedback, and learn from each other.',
        },
      },
    },
    {
      id: 'IP6',
      descriptor: 'Uses technology to enhance student learning',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Technology absent or used ineffectively. Technology distracts from learning rather than enhancing it.',
        },
        level1: {
          label: 'Developing',
          description: 'Technology used occasionally but integration is limited or not fully purposeful.',
        },
        level2: {
          label: 'Proficient',
          description: 'Technology used appropriately to enhance instruction and support student learning.',
        },
        level3: {
          label: 'Distinction',
          description: 'Technology skillfully integrated to create interactive, personalized learning experiences. Students use technology to develop higher-order thinking.',
        },
      },
    },
    {
      id: 'IP7',
      descriptor: 'Connects content to students\' prior knowledge and experiences',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Content presented without connection to student experience or prior knowledge.',
        },
        level1: {
          label: 'Developing',
          description: 'Some attempts to connect to prior knowledge but connections are superficial or inconsistent.',
        },
        level2: {
          label: 'Proficient',
          description: 'New content regularly connected to prior learning and student experiences. Bridges are explicitly made.',
        },
        level3: {
          label: 'Distinction',
          description: 'Seamless integration with prior knowledge. Students build complex understanding through connections across content and personal experiences.',
        },
      },
    },
    {
      id: 'IP8',
      descriptor: 'Uses assessment results to inform instructional decisions',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Assessment results not analyzed or used. Instruction remains unchanged regardless of performance data.',
        },
        level1: {
          label: 'Developing',
          description: 'Some use of assessment data but modifications to instruction are limited or inconsistently applied.',
        },
        level2: {
          label: 'Proficient',
          description: 'Assessment results regularly analyzed and used to make adjustments to instruction and pacing.',
        },
        level3: {
          label: 'Distinction',
          description: 'Sophisticated use of multiple assessment data to drive instructional decisions. Students involved in self-assessment and goal-setting.',
        },
      },
    },
  ],
  CC: [
    {
      id: 'CC1',
      descriptor: 'Establishes and maintains clear expectations for classroom behavior',
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
    {
      id: 'CC2',
      descriptor: 'Creates a physically and emotionally safe learning environment',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Environment is disorganized or unsafe. Students appear anxious or uncomfortable.',
        },
        level1: {
          label: 'Developing',
          description: 'Some effort to create safety but environment may feel rigid, chaotic, or emotionally unsafe for some students.',
        },
        level2: {
          label: 'Proficient',
          description: 'Physically organized and emotionally supportive classroom. Students feel safe to take risks and make mistakes.',
        },
        level3: {
          label: 'Distinction',
          description: 'Highly welcoming, safely organized environment where students feel valued and secure. Risk-taking is encouraged.',
        },
      },
    },
    {
      id: 'CC3',
      descriptor: 'Manages transitions and time efficiently',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Transitions are chaotic or lengthy. Significant time is wasted. Pacing is ineffective.',
        },
        level1: {
          label: 'Developing',
          description: 'Transitions are present but sometimes inefficient. Some time management issues.',
        },
        level2: {
          label: 'Proficient',
          description: 'Smooth transitions and efficient use of instructional time. Routines are established and followed.',
        },
        level3: {
          label: 'Distinction',
          description: 'Seamless transitions with minimal downtime. Instructional time is maximized and pacing is responsive to student learning.',
        },
      },
    },
    {
      id: 'CC4',
      descriptor: 'Responds to and manages student behavior appropriately',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Behavioral responses are absent, ineffective, or inappropriate. Behavior escalates or repeats.',
        },
        level1: {
          label: 'Developing',
          description: 'Behavioral responses are attempted but inconsistent or not always appropriate to the situation.',
        },
        level2: {
          label: 'Proficient',
          description: 'Appropriate, consistent responses to student behavior. Redirects are effective and maintain positive relationships.',
        },
        level3: {
          label: 'Distinction',
          description: 'Proactive responses prevent most misbehavior. Responses are restorative and teach appropriate behavior. Culture of respect maintained.',
        },
      },
    },
    {
      id: 'CC5',
      descriptor: 'Fosters a sense of community and belonging',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Classroom is fragmented. Students do not feel connected or part of a community.',
        },
        level1: {
          label: 'Developing',
          description: 'Some attempts to build community but sense of belonging is limited for some students.',
        },
        level2: {
          label: 'Proficient',
          description: 'Students feel they belong. Collaborative norms and mutual respect are present.',
        },
        level3: {
          label: 'Distinction',
          description: 'Strong sense of community where diverse students support each other. Inclusive culture values all members.',
        },
      },
    },
    {
      id: 'CC6',
      descriptor: 'Demonstrates enthusiasm and positive affect',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Teacher displays negative affect or lack of enthusiasm. Tone is dismissive or discouraging.',
        },
        level1: {
          label: 'Developing',
          description: 'Teacher shows neutral affect most of the time with occasional enthusiasm.',
        },
        level2: {
          label: 'Proficient',
          description: 'Teacher displays consistent enthusiasm and positive affect. Tone is warm and encouraging.',
        },
        level3: {
          label: 'Distinction',
          description: 'Infectious enthusiasm and genuine care evident. Students respond with increased motivation and engagement.',
        },
      },
    },
    {
      id: 'CC7',
      descriptor: 'Communicates respect and high expectations for all students',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Teacher shows disrespect or low expectations for some students. Behavior or language is demeaning.',
        },
        level1: {
          label: 'Developing',
          description: 'Respect is generally shown but expectations may vary inappropriately or disrespectful moments occur.',
        },
        level2: {
          label: 'Proficient',
          description: 'Teacher communicates respect and holds high academic and behavioral expectations for all students.',
        },
        level3: {
          label: 'Distinction',
          description: 'Deep respect and unwavering high expectations evident for all. Students rise to meet and exceed expectations.',
        },
      },
    },
    {
      id: 'CC8',
      descriptor: 'Uses flexible grouping to facilitate peer learning',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Grouping is static or based on ability only. Peer learning opportunities are limited.',
        },
        level1: {
          label: 'Developing',
          description: 'Some flexible grouping but may not be frequent or purposeful enough.',
        },
        level2: {
          label: 'Proficient',
          description: 'Flexible grouping used regularly based on learning needs. Peer learning is facilitated.',
        },
        level3: {
          label: 'Distinction',
          description: 'Strategic grouping creates opportunities for peer teaching and collaborative problem-solving. Students benefit from diverse peers.',
        },
      },
    },
  ],
  PR: [
    {
      id: 'PR1',
      descriptor: 'Demonstrates professional knowledge and expertise',
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
    {
      id: 'PR2',
      descriptor: 'Engages in professional growth and continuous learning',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'No evidence of professional growth or learning. Methods are outdated or unchanged.',
        },
        level1: {
          label: 'Developing',
          description: 'Some engagement in professional development but implementation may be limited.',
        },
        level2: {
          label: 'Proficient',
          description: 'Actively pursues professional growth. New learning is applied to improve practice.',
        },
        level3: {
          label: 'Distinction',
          description: 'Lifelong learner who adapts practice based on research and reflection. Seeks out leadership opportunities and mentors others.',
        },
      },
    },
    {
      id: 'PR3',
      descriptor: 'Communicates effectively with families and stakeholders',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Communication is absent or ineffective. Families feel disconnected or uninformed.',
        },
        level1: {
          label: 'Developing',
          description: 'Communication occurs but may be limited in frequency or quality.',
        },
        level2: {
          label: 'Proficient',
          description: 'Regular, clear communication with families. Families understand student progress and feel informed.',
        },
        level3: {
          label: 'Distinction',
          description: 'Outstanding communication that builds strong partnerships. Families actively involved in supporting learning.',
        },
      },
    },
    {
      id: 'PR4',
      descriptor: 'Fulfills professional responsibilities with integrity',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Responsibilities are not fulfilled. Professional conduct is questionable.',
        },
        level1: {
          label: 'Developing',
          description: 'Most responsibilities fulfilled but some lapses in consistency or integrity.',
        },
        level2: {
          label: 'Proficient',
          description: 'Responsibilities are consistently fulfilled. Professional conduct is appropriate.',
        },
        level3: {
          label: 'Distinction',
          description: 'Goes above and beyond in all responsibilities. Actions consistently demonstrate integrity and professionalism.',
        },
      },
    },
    {
      id: 'PR5',
      descriptor: 'Advocates for students and equitable practices',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'No advocacy for students. Practices may perpetuate inequities.',
        },
        level1: {
          label: 'Developing',
          description: 'Some attempts to advocate or promote equity but efforts may be inconsistent.',
        },
        level2: {
          label: 'Proficient',
          description: 'Advocates for students and works to ensure equitable practices and opportunities.',
        },
        level3: {
          label: 'Distinction',
          description: 'Strong advocate who challenges inequities and works systemically to ensure all students thrive.',
        },
      },
    },
    {
      id: 'PR6',
      descriptor: 'Collaborates with colleagues to improve practice',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'Works in isolation. No collaboration or collegial support.',
        },
        level1: {
          label: 'Developing',
          description: 'Some collaboration but may be limited or not focused on improving practice.',
        },
        level2: {
          label: 'Proficient',
          description: 'Collaborates with colleagues. Shares ideas and works together to improve student outcomes.',
        },
        level3: {
          label: 'Distinction',
          description: 'Actively collaborates and contributes to professional community. Shares expertise and learns from colleagues.',
        },
      },
    },
    {
      id: 'PR7',
      descriptor: 'Reflects on practice and uses reflection to improve teaching',
      rubric: {
        level0: {
          label: 'Not Met',
          description: 'No evidence of reflection. Practice remains unchanged based on outcomes.',
        },
        level1: {
          label: 'Developing',
          description: 'Some reflection occurs but may not lead to meaningful changes in practice.',
        },
        level2: {
          label: 'Proficient',
          description: 'Regular reflection on practice. Insights are used to make adjustments and improvements.',
        },
        level3: {
          label: 'Distinction',
          description: 'Deep, ongoing reflection that drives continuous improvement. Goals set and progress monitored based on reflection.',
        },
      },
    },
  ],
};

/** Maps a score level (0–3) to its display color. null = unscored (grey). */
export const SCORE_COLORS = {
  0: '#dc2626', // Red   — Not Met
  1: '#f59e0b', // Amber — Developing
  2: '#eab308', // Yellow — Proficient
  3: '#16a34a', // Green — Distinction
  null: '#d1d5db', // Grey  — Unscored
} as const;

/** Human-readable labels for each score level. */
export const SCORE_LABELS = {
  0: 'Not Met',
  1: 'Developing',
  2: 'Proficient',
  3: 'Distinction',
} as const;

/** Valid values for a competency score. null means the competency has not been scored yet. */
export type ScoreLevel = 0 | 1 | 2 | 3 | null;

/**
 * The scores map stored in Evaluations.tsx state and persisted to localStorage.
 * Keyed by competency ID (e.g., "LL1"). Each entry holds a score and optional evaluator notes.
 */
export interface STERScores {
  [competencyId: string]: {
    score: ScoreLevel;
    notes: string;
  };
}

/**
 * Returns all competencies for a given category code (e.g., "LL").
 * Returns an empty array if the category does not exist.
 */
export const getCompetenciesInCategory = (category: string): Competency[] => {
  return STER_COMPETENCIES[category] || [];
};

/**
 * Calculates how many competencies in a category have a non-null score.
 * Used to drive completion badges in STERNavigator and the "View All Items" button label.
 *
 * @returns { scored: number, total: number }
 */
export const getCategoryCompletion = (
  category: string,
  scores: STERScores
): { scored: number; total: number } => {
  const competencies = getCompetenciesInCategory(category);
  // A competency counts as scored if its score key exists and is not null.
  const scored = competencies.filter((c) => scores[c.id]?.score !== null).length;
  return { scored, total: competencies.length };
};

/**
 * Checks whether all 35 STER competencies have been scored at Proficient (2) or higher.
 * This is the minimum threshold for a student teacher to be eligible to pass.
 *
 * Note: The function name has a typo ("Elegible" should be "Eligible") — do not fix
 * without updating all call sites.
 */
export const isElegibleToPass = (scores: STERScores): boolean => {
  let totalCompetencies = 0;
  let competenciesAt2Plus = 0;

  Object.values(STER_COMPETENCIES).forEach((category) => {
    category.forEach((competency) => {
      totalCompetencies++;
      const score = scores[competency.id]?.score;
      if (score !== null && score >= 2) {
        competenciesAt2Plus++;
      }
    });
  });

  // Both conditions must be true: all 35 exist in state AND all are ≥2
  return totalCompetencies === 35 && competenciesAt2Plus === 35;
};
