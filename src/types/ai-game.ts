export interface AutomaticallyGeneratedGameForm {
    theme?: string;
    categories?: string[];
    details?: string;
    exampleQuestions?: string;
    allowImages?: boolean;
    allowVideos?: boolean;
}

export type GameGenerationStatus = 'pending' | 'completed' | 'failed';

export interface GenerationTask {
  status: GameGenerationStatus;
  data?: any;
  error?: string;
  userId: string;
  formData: AutomaticallyGeneratedGameForm;
}

export interface GenerationResponse {
  success: boolean;
  status: GameGenerationStatus;
  id: string;
  data?: any;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}