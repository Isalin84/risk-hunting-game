import { useEffect, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useTimer } from '@/hooks/useTimer';
import { useLevels } from '@/hooks/useLevels';
import { useSounds } from '@/hooks/useSounds';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { GameHUD } from '@/components/game/GameHUD';
import { GameContainer } from '@/components/game/GameContainer';
import { IntroModal } from '@/components/game/IntroModal';
import { IntroVideo } from '@/components/game/IntroVideo';
import { RiskFoundModal } from '@/components/game/RiskFoundModal';
import { LevelCompleteModal } from '@/components/game/LevelCompleteModal';
import { GameOverModal } from '@/components/game/GameOverModal';
import { LeaderboardModal } from '@/components/game/LeaderboardModal';
import { GAME_CONFIG } from '@/lib/constants';
import type { Hazard } from '@/types';

export function GamePage() {
  const { levels, loading: levelsLoading } = useLevels();
  const { playRandom, playBackground, stopBackground } = useSounds();
  const { entries, addEntry, fetchEntries } = useLeaderboard();
  const timer = useTimer();

  const game = useGameState();

  const currentLevel = levels[game.currentLevelIndex];
  const hazards = currentLevel?.hazards || [];
  const uniqueGroups = new Set(hazards.map((h) => h.group_key));

  // Start/stop timer based on phase
  useEffect(() => {
    if (game.phase === 'PLAYING') {
      timer.start();
    } else {
      timer.stop();
    }
  }, [game.phase, timer.start, timer.stop]);

  // Play background music when level starts
  useEffect(() => {
    if (game.phase === 'PLAYING' && currentLevel?.audio_background_path) {
      playBackground(currentLevel.audio_background_path);
    }
    if (game.phase !== 'PLAYING' && game.phase !== 'RISK_FOUND') {
      stopBackground();
    }
  }, [game.phase, currentLevel, playBackground, stopBackground]);

  // End game handler
  useEffect(() => {
    if (game.phase === 'GAME_OVER') {
      game.endGame(timer.seconds);
    }
  }, [game.phase]);

  const handleStart = useCallback(() => {
    timer.reset();
    game.startGame();
  }, [timer, game]);

  const handleVideoComplete = useCallback(() => {
    game.startPlaying();
  }, [game]);

  const handleHotspotClick = useCallback(
    (hazard: Hazard) => {
      game.onHotspotClick(hazard, hazards, levels.length);
    },
    [game, hazards, levels.length],
  );

  const handleWrongClick = useCallback(() => {
    game.onWrongClick();
  }, [game]);

  const handleUseHint = useCallback(() => {
    const group = game.useHint(hazards);
    if (group) {
      timer.addPenalty(GAME_CONFIG.HINT_PENALTY_SECONDS);
    }
  }, [game, hazards, timer]);

  const handleNextLevel = useCallback(() => {
    game.nextLevel();
  }, [game]);

  const handleSaveResult = useCallback(
    async (name: string) => {
      await addEntry({
        player_name: name,
        score: game.totalScore,
        time_seconds: game.totalTimeElapsed,
      });
      await fetchEntries();
      game.setPhase('LEADERBOARD');
    },
    [addEntry, fetchEntries, game],
  );

  const handlePlayAgain = useCallback(() => {
    timer.reset();
    game.resetGame();
  }, [timer, game]);

  if (levelsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-bg">
        <div className="text-brand-dark font-heading text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-bg">
        <div className="text-brand-dark font-heading text-xl">No levels available</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* HUD - visible during gameplay */}
      {(game.phase === 'PLAYING' || game.phase === 'RISK_FOUND') && currentLevel && (
        <GameHUD
          levelName={currentLevel.name}
          levelIndex={game.currentLevelIndex}
          totalLevels={levels.length}
          seconds={timer.seconds}
          foundCount={game.foundGroups.size}
          totalGroups={uniqueGroups.size}
          streakCount={game.streakCount}
          hintsRemaining={game.hintsRemaining}
          onUseHint={handleUseHint}
        />
      )}

      {/* Game container - visible during gameplay */}
      {(game.phase === 'PLAYING' || game.phase === 'RISK_FOUND') && currentLevel && (
        <GameContainer
          imageSrc={currentLevel.image_path}
          hazards={hazards}
          foundGroups={game.foundGroups}
          hintedGroup={game.hintedGroup}
          onHotspotClick={handleHotspotClick}
          onWrongClick={handleWrongClick}
          addPenalty={timer.addPenalty}
          playGood={() => playRandom('good')}
          playBad={() => playRandom('bad')}
        />
      )}

      {/* Intro video */}
      <IntroVideo visible={game.phase === 'VIDEO'} onComplete={handleVideoComplete} />

      {/* Modals */}
      <IntroModal open={game.phase === 'INTRO'} onStart={handleStart} />

      <RiskFoundModal
        open={game.phase === 'RISK_FOUND'}
        description={game.currentRiskDescription}
        onClose={game.dismissRiskModal}
      />

      <LevelCompleteModal
        open={game.phase === 'LEVEL_COMPLETE'}
        levelScore={game.levelScore}
        levelTime={timer.seconds}
        onNext={handleNextLevel}
      />

      <GameOverModal
        open={game.phase === 'GAME_OVER'}
        totalScore={game.totalScore}
        totalTime={game.totalTimeElapsed}
        onSave={handleSaveResult}
      />

      <LeaderboardModal
        open={game.phase === 'LEADERBOARD'}
        entries={entries}
        onClose={handlePlayAgain}
      />
    </div>
  );
}
