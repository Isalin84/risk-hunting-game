import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="bg-brand-dark border-b border-brand-gold/30 px-4 py-2 flex items-center justify-between shrink-0">
      <Link to="/" className="flex items-center gap-2 text-white hover:text-brand-gold transition-colors">
        <img src="/logo.png" alt="Best Practice" className="h-8 w-8 object-contain" />
        <span className="font-heading font-bold text-lg">{t('header.title')}</span>
      </Link>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {isAdmin ? (
          <Button asChild variant="ghost" size="sm" className="text-white hover:text-brand-gold hover:bg-white/10 font-heading gap-1.5">
            <Link to="/">
              <Shield size={16} />
              {t('header.game')}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="ghost" size="sm" className="text-white hover:text-brand-gold hover:bg-white/10 font-heading gap-1.5">
            <Link to="/admin">
              <Settings size={16} />
              {t('header.admin')}
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
