export const GAME_CONFIG = {
  WRONG_CLICK_PENALTY_SECONDS: 3,
  HINT_PENALTY_SECONDS: 10,
  TOTAL_HINTS: 3,
  STREAK_TIMEOUT_MS: 5000,
  HINT_HIGHLIGHT_MS: 2000,
  PENALTY_FLASH_MS: 300,
  FLOAT_TEXT_MS: 1000,
  LEADERBOARD_SIZE: 10,
} as const;

export const BRAND_COLORS = {
  dark: '#0B1D3A',
  steel: '#1E3A5F',
  steelLight: '#2A4F7A',
  gold: '#D4AF37',
  goldHover: '#C4A032',
  goldSoft: '#E8D48B',
  beige: '#F5DEB3',
  bg: '#FAF9F6',
  gameSuccess: '#22C55E',
  gameDanger: '#EF4444',
  gameWarning: '#F59E0B',
} as const;
