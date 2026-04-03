// Mock API responses for development — simulates a real REST API with artificial delays.
// Replace every function in this file with real HTTP calls when the backend is connected.
// None of these functions should remain in production.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'teacher' | 'admin' | 'evaluator';
  };
  /** JWT or session token — will be a real Supabase token when backend is connected. */
  token: string;
}

export interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  criteria: string;
  score: number;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Simulates network latency so UI loading states are exercised during development.
 * Wrap any mock API call with await delay(ms) to mimic a real roundtrip.
 */
const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  /**
   * Authenticates a user by email and password.
   * Currently accepts any email; password is ignored.
   * TODO: Replace with Supabase supabase.auth.signInWithPassword({ email, password }).
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    await delay(800);
    return {
      user: {
        id: '1',
        email: data.email,
        name: data.email.split('@')[0],
        role: 'teacher',
      },
      // Timestamp suffix ensures the token changes each call (not a real JWT)
      token: 'mock_token_' + Date.now(),
    };
  },

  /**
   * Logs out the current user.
   * TODO: Replace with Supabase supabase.auth.signOut().
   */
  logout: async (): Promise<void> => {
    await delay(300);
  },

  /**
   * Returns a list of past evaluations for the current user.
   * TODO: Replace with a Supabase query: supabase.from('evaluations').select('*').
   */
  getEvaluations: async (): Promise<Evaluation[]> => {
    await delay(600);
    return [
      {
        id: '1',
        studentId: 'S001',
        studentName: 'John Doe',
        criteria: 'Participation',
        score: 85,
        feedback: 'Good engagement in class discussions',
        createdAt: '2024-03-10',
        updatedAt: '2024-03-15',
      },
      {
        id: '2',
        studentId: 'S002',
        studentName: 'Jane Smith',
        criteria: 'Assignment Quality',
        score: 92,
        feedback: 'Excellent work on assignments',
        createdAt: '2024-03-12',
        updatedAt: '2024-03-16',
      },
    ];
  },

  /**
   * Creates a new evaluation record.
   * TODO: Replace with supabase.from('evaluations').insert(data).
   */
  createEvaluation: async (data: Partial<Evaluation>): Promise<Evaluation> => {
    await delay(600);
    return {
      id: Math.random().toString(36).substr(2, 9),
      studentId: data.studentId || '',
      studentName: data.studentName || '',
      criteria: data.criteria || '',
      score: data.score || 0,
      feedback: data.feedback || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Triggers AI-generated feedback for a completed evaluation.
   * TODO: Replace with a call to the AI analysis endpoint (Claude API or similar).
   */
  generateFeedback: async (evaluationId: string): Promise<string> => {
    await delay(1200);
    return 'This is AI-generated feedback for evaluation ' + evaluationId;
  },
};
