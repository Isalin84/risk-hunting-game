import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const toggle = () => {
    i18n.changeLanguage(current === 'ru' ? 'en' : 'ru');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="text-white hover:text-brand-gold hover:bg-white/10 font-heading gap-1.5"
    >
      <Globe size={16} />
      {current === 'ru' ? 'EN' : 'RU'}
    </Button>
  );
}
