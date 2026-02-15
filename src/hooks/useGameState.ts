import { useState, useCallback, useRef } from 'react';
import type { GamePhase, Hazard } from '@/types';
import { GAME_CONFIG } from '@/lib/constants';

export function useGameState() {
  const [phase, setPhase] = useState<GamePhase>('INTRO');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [foundGroups, setFoundGroups] = useState<Set<string>>(new Set());
  const [totalScore, setTotalScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState<number>(GAME_CONFIG.TOTAL_HINTS);
  const [streakCount, setStreakCount] = useState(0);
  const [currentRiskDescription, setCurrentRiskDescription] = useState<string | null>(null);
  const [hintedGroup, setHintedGroup] = useState<string | null>(null);

  const lastFoundTimestampRef = useRef(0);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = useCallback(() => {
    setPhase('VIDEO');
    setCurrentLevelIndex(0);
    setFoundGroups(new Set());
    setTotalScore(0);
    setLevelScore(0);
    setTotalTimeElapsed(0);
    setHintsRemaining(GAME_CONFIG.TOTAL_HINTS);
    setStreakCount(0);
    lastFoundTimestampRef.current = 0;
  }, []);

  const startPlaying = useCallback(() => {
    setPhase('PLAYING');
  }, []);

  const onHotspotClick = useCallback((hazard: Hazard, allHazards: Hazard[], totalLevels: number) => {
    const group = hazard.group_key;
    setFoundGroups((prev) => {
      if (prev.has(group)) return prev;
      const next = new Set(prev);
      next.add(group);

      const now = Date.now();
      const timeSinceLast = now - lastFoundTimestampRef.current;
      lastFoundTimestampRef.current = now;

      if (timeSinceLast < GAME_CONFIG.STREAK_TIMEOUT_MS && lastFoundTimestampRef.current > 0) {
        setStreakCount((s) => s + 1);
      } else {
        setStreakCount(1);
      }

      setLevelScore((s) => s + 1);
      setTotalScore((s) => s + 1);
      setCurrentRiskDescription(hazard.description || hazard.name);
      setPhase('RISK_FOUND');

      const uniqueGroups = new Set(allHazards.map((h) => h.group_key));
      if (next.size >= uniqueGroups.size) {
        setTimeout(() => {
          if (currentLevelIndex >= totalLevels - 1) {
            setPhase('GAME_OVER');
          } else {
            setPhase('LEVEL_COMPLETE');
          }
        }, 500);
      }

      return next;
    });
  }, [currentLevelIndex]);

  const onWrongClick = useCallback(() => {
    setStreakCount(0);
  }, []);

  const dismissRiskModal = useCallback(() => {
    setCurrentRiskDescription(null);
    setPhase('PLAYING');
  }, []);

  const nextLevel = useCallback(() => {
    setCurrentLevelIndex((i) => i + 1);
    setFoundGroups(new Set());
    setLevelScore(0);
    setStreakCount(0);
    setPhase('PLAYING');
  }, []);

  const endGame = useCallback((currentTime: number) => {
    setTotalTimeElapsed(currentTime);
  }, []);

  const useHint = useCallback((allHazards: Hazard[]) => {
    if (hintsRemaining <= 0) return null;

    const uniqueGroups = new Set(allHazards.map((h) => h.group_key));
    const unfound = Array.from(uniqueGroups).filter((g) => !foundGroups.has(g));
    if (unfound.length === 0) return null;

    const randomGroup = unfound[Math.floor(Math.random() * unfound.length)];
    setHintsRemaining((h) => h - 1);
    setHintedGroup(randomGroup);

    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      setHintedGroup(null);
    }, GAME_CONFIG.HINT_HIGHLIGHT_MS);

    return randomGroup;
  }, [hintsRemaining, foundGroups]);

  const resetGame = useCallback(() => {
    setPhase('INTRO');
    setCurrentLevelIndex(0);
    setFoundGroups(new Set());
    setTotalScore(0);
    setLevelScore(0);
    setTotalTimeElapsed(0);
    setHintsRemaining(GAME_CONFIG.TOTAL_HINTS);
    setStreakCount(0);
    setCurrentRiskDescription(null);
    setHintedGroup(null);
  }, []);

  return {
    phase,
    setPhase,
    currentLevelIndex,
    foundGroups,
    totalScore,
    levelScore,
    totalTimeElapsed,
    hintsRemaining,
    streakCount,
    currentRiskDescription,
    hintedGroup,
    startGame,
    startPlaying,
    onHotspotClick,
    onWrongClick,
    dismissRiskModal,
    nextLevel,
    endGame,
    useHint,
    resetGame,
  };
}
