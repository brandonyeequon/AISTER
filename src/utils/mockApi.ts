// Mock API responses for development
// Replace these with real API calls when backend is ready

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

// Simulate API delay
const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Auth endpoints
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    await delay(800);
    return {
      user: {
        id: '1',
        email: data.email,
        name: data.email.split('@')[0],
        role: 'teacher',
      },
      token: 'mock_token_' + Date.now(),
    };
  },

  logout: async (): Promise<void> => {
    await delay(300);
  },

  // Evaluation endpoints
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

  generateFeedback: async (evaluationId: string): Promise<string> => {
    await delay(1200);
    return 'This is AI-generated feedback for evaluation ' + evaluationId;
  },
};
