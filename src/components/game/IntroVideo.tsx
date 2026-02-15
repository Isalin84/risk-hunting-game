import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface IntroVideoProps {
  visible: boolean;
  onComplete: () => void;
}

export function IntroVideo({ visible, onComplete }: IntroVideoProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSkip = useCallback(() => {
    if (videoRef.current) videoRef.current.pause();
    onComplete();
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-auto max-h-full object-contain"
        autoPlay
        onEnded={onComplete}
        onError={onComplete}
      >
        <source src="/assets/Intro.mp4" type="video/mp4" />
      </video>
      <Button
        variant="outline"
        onClick={handleSkip}
        className="absolute top-4 right-4 bg-white/20 text-white border-white/30 hover:bg-white/30 font-heading"
      >
        {t('game.skipVideo')}
      </Button>
    </div>
  );
}
