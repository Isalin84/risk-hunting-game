export interface Level {
  id: string;
  order_index: number;
  name: string;
  image_path: string;
  audio_background_path: string | null;
  min_risks: number;
  created_at?: string;
  hazards?: Hazard[];
}

export interface Hazard {
  id: string;
  level_id: string;
  group_key: string;
  name: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Sound {
  id: string;
  name: string;
  category: 'good' | 'bad' | 'background';
  file_path: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  nickname: string;
  created_at?: string;
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  time_seconds: number;
  user_id?: string | null;
  created_at?: string;
}

export type GamePhase =
  | 'INTRO'
  | 'VIDEO'
  | 'PLAYING'
  | 'RISK_FOUND'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'LEADERBOARD';

export interface PenaltyFloat {
  id: number;
  x: number;
  y: number;
}

export interface GameState {
  phase: GamePhase;
  currentLevelIndex: number;
  foundGroups: Set<string>;
  totalScore: number;
  levelScore: number;
  totalTimeElapsed: number;
  hintsRemaining: number;
  penaltySeconds: number;
  streakCount: number;
  lastFoundTimestamp: number;
  currentRiskDescription: string | null;
  hintedGroup: string | null;
}
