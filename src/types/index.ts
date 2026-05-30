export interface CandidateData {
  name: string;
  desiredPosition: string;
  experience: string;
  skills: string;
  education: string;
  achievements: string;
  currentResume: string;
}

export interface AnalysisRequest {
  jobDescription: string;
  candidate: CandidateData;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
}

export interface QuestionsResponse {
  questions: ClarifyingQuestion[];
}

export interface AnsweredQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface GenerateRequest {
  jobDescription: string;
  candidate: CandidateData;
  answers: AnsweredQuestion[];
  profile?: CandidateProfile;
}

export interface GenerateResult {
  adaptedResume: string;
  coverLetter: string;
  recommendations: string[];
}

// ===== Chat & Interview types =====

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface CandidateProfile {
  desiredPosition: string;
  level: string;
  experience: string;
  skills: string[];
  achievements: string[];
  education: string;
  strengths: string[];
  weaknesses: string[];
  careerGoals: string;
  motivation: string;
  relevance: string;
}

export const emptyCandidateProfile: CandidateProfile = {
  desiredPosition: "",
  level: "",
  experience: "",
  skills: [],
  achievements: [],
  education: "",
  strengths: [],
  weaknesses: [],
  careerGoals: "",
  motivation: "",
  relevance: "",
};

export interface MatchScore {
  overall: number;
  strengths: string[];
  gaps: string[];
  resumeTips: string[];
  coverLetterTips: string[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  jobDescription: string;
  profile: CandidateProfile;
}

export interface ChatResponse {
  reply: string;
  updatedProfile: CandidateProfile;
  interviewComplete: boolean;
}

export interface AssessmentRequest {
  jobDescription: string;
  profile: CandidateProfile;
  messages: ChatMessage[];
}
