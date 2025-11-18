export interface CompanyContext {
  name: string;
  industry?: string;
  products?: string[];
  description?: string;
  recent_news?: string;
  website?: string;
  confidence: number;
}

export interface IcebreakerResult {
  company: string;
  industry?: string;
  overview: string;
  icebreakers: string[];
  sources?: string[];
}

export interface AgentResponse {
  success: boolean;
  data?: IcebreakerResult;
  error?: string;
  step?: string;
}
