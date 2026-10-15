// Mirrors apps/api/app/schemas/assessments.py in codeverity.

export type AssessmentStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type RubricCriterion = { name: string; description: string; weight: number };

export type Rubric = {
  criteria: RubricCriterion[];
  learner_level?: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
};

export type AssessmentCreate = {
  language: string;
  assignment: { title: string; requirements: string };
  submission: { code: string };
  rubric?: Rubric;
};

export type AssessmentOut = {
  id: string;
  status: AssessmentStatus;
  language: string;
  created_at: string;
  completed_at: string | null;
};

export type AssessmentResult = {
  assessment_id: string;
  status: AssessmentStatus;
  score: number;
  confidence: number;
  criteria: Record<string, number>;
  feedback: { summary: string; issues: string[]; suggestions: string[] };
  rubric_score: number | null;
  rubric_scores: { name: string; weight: number; score: number; comment: string }[] | null;
  simulated: boolean;
};
