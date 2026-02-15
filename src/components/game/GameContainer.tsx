import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Hazard, PenaltyFloat } from '@/types';
import { Hotspot } from './Hotspot';
import { GAME_CONFIG } from '@/lib/constants';

interface GameContainerProps {
  imageSrc: string;
  hazards: Hazard[];
  foundGroups: Set<string>;
  hintedGroup: string | null;
  onHotspotClick: (hazard: Hazard) => void;
  onWrongClick: () => void;
  addPenalty: (seconds: number) => void;
  playGood: () => void;
  playBad: () => void;
}

export function GameContainer({
  imageSrc,
  hazards,
  foundGroups,
  hintedGroup,
  onHotspotClick,
  onWrongClick,
  addPenalty,
  playGood,
  playBad,
}: GameContainerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [penaltyFlash, setPenaltyFlash] = useState(false);
  const [penaltyFloats, setPenaltyFloats] = useState<PenaltyFloat[]>([]);
  const floatIdRef = useRef(0);

  const recalcOffset = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;
    const imgRect = imgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setImageOffset({
      x: imgRect.left - containerRect.left,
      y: imgRect.top - containerRect.top,
      width: imgRect.width,
      height: imgRect.height,
    });
  }, []);

  useEffect(() => {
    recalcOffset();
    const observer = new ResizeObserver(recalcOffset);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', recalcOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recalcOffset);
    };
  }, [recalcOffset, imageSrc]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-hotspot]')) return;

      onWrongClick();
      addPenalty(GAME_CONFIG.WRONG_CLICK_PENALTY_SECONDS);
      playBad();

      setPenaltyFlash(true);
      setTimeout(() => setPenaltyFlash(false), GAME_CONFIG.PENALTY_FLASH_MS);

      const rect = containerRef.current!.getBoundingClientRect();
      const id = ++floatIdRef.current;
      setPenaltyFloats((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ]);
      setTimeout(() => {
        setPenaltyFloats((prev) => prev.filter((f) => f.id !== id));
      }, GAME_CONFIG.FLOAT_TEXT_MS);
    },
    [onWrongClick, addPenalty, playBad],
  );

  const handleHotspotClick = useCallback(
    (hazard: Hazard) => {
      if (foundGroups.has(hazard.group_key)) return;
      playGood();
      onHotspotClick(hazard);
    },
    [foundGroups, playGood, onHotspotClick],
  );

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-black flex items-center justify-center overflow-hidden select-none"
      onClick={handleContainerClick}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Level"
        className="max-w-full max-h-full object-contain"
        onLoad={recalcOffset}
        draggable={false}
      />

      {hazards.map((hazard) => (
        <Hotspot
          key={hazard.id}
          hazard={hazard}
          found={foundGroups.has(hazard.group_key)}
          hinted={hintedGroup === hazard.group_key}
          containerWidth={imageOffset.width}
          containerHeight={imageOffset.height}
          imageOffset={imageOffset}
          onClick={handleHotspotClick}
        />
      ))}

      {penaltyFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ animation: `penaltyFlash ${GAME_CONFIG.PENALTY_FLASH_MS}ms ease-out forwards` }}
        />
      )}

      {penaltyFloats.map((f) => (
        <span
          key={f.id}
          className="absolute pointer-events-none text-game-danger font-heading font-bold text-lg"
          style={{
            left: f.x,
            top: f.y,
            animation: `floatUp ${GAME_CONFIG.FLOAT_TEXT_MS}ms ease-out forwards`,
          }}
        >
          {t('game.penalty', { seconds: GAME_CONFIG.WRONG_CLICK_PENALTY_SECONDS })}
        </span>
      ))}
    </div>
  );
}
