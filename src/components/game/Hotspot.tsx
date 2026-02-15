import type { Hazard } from '@/types';

interface HotspotProps {
  hazard: Hazard;
  found: boolean;
  hinted: boolean;
  containerWidth: number;
  containerHeight: number;
  imageOffset: { x: number; y: number; width: number; height: number };
  onClick: (hazard: Hazard) => void;
}

export function Hotspot({ hazard, found, hinted, imageOffset, onClick }: HotspotProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${imageOffset.x + hazard.x * imageOffset.width}px`,
    top: `${imageOffset.y + hazard.y * imageOffset.height}px`,
    width: `${hazard.w * imageOffset.width}px`,
    height: `${hazard.h * imageOffset.height}px`,
    cursor: found ? 'default' : 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    ...(found
      ? {
          border: '2px solid rgba(34, 197, 94, 0.8)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          animation: 'foundPulse 1s ease-out',
        }
      : hinted
        ? {
            border: '2px solid rgba(245, 158, 11, 0.8)',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            animation: 'hintGlow 1s ease-in-out 2',
          }
        : {
            border: 'none',
            backgroundColor: 'transparent',
          }),
  };

  return (
    <div
      data-hotspot="true"
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        if (!found) onClick(hazard);
      }}
    />
  );
}
