export interface TrendTopic {
  title: string;
  summary: string;
  platform: 'Twitter' | 'Reddit' | 'Both' | 'General';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DailyBriefData {
  date: string;
  topics: TrendTopic[];
  sources: GroundingSource[];
}

export interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}
