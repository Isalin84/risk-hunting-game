import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, LogIn, UserPlus, Eye, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';

export function AuthRequiredScreen() {
  const { t } = useTranslation();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const handleOpenLogin = () => {
    setAuthTab('login');
    setAuthOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthTab('register');
    setAuthOpen(true);
  };

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center bg-brand-bg relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/5 via-brand-gold/5 to-brand-dark/5" />
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-gold/8 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto px-6">
          {/* Logo / Icon */}
          <div className="mb-6 relative">
            <div className="w-20 h-20 bg-brand-gold/15 rounded-2xl flex items-center justify-center border-2 border-brand-gold/30">
              <Shield className="text-brand-gold" size={40} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center">
              <LogIn size={10} className="text-brand-dark" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-brand-dark text-center mb-2">
            {t('auth.requiredTitle')}
          </h1>
          <p className="font-body text-brand-dark/60 text-center mb-8 max-w-sm">
            {t('auth.requiredDescription')}
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-sm">
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-brand-gold-soft shadow-sm">
              <Eye size={20} className="text-brand-gold" />
              <span className="font-heading text-xs text-brand-dark/70 text-center">
                {t('auth.featureFind')}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-brand-gold-soft shadow-sm">
              <Clock size={20} className="text-brand-gold" />
              <span className="font-heading text-xs text-brand-dark/70 text-center">
                {t('auth.featureCompete')}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-brand-gold-soft shadow-sm">
              <Trophy size={20} className="text-brand-gold" />
              <span className="font-heading text-xs text-brand-dark/70 text-center">
                {t('auth.featureLeaderboard')}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <Button
              onClick={handleOpenLogin}
              className="w-full bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold py-6 text-base gap-2 shadow-lg shadow-brand-gold/20"
            >
              <LogIn size={18} />
              {t('auth.signIn')}
            </Button>
            <Button
              onClick={handleOpenRegister}
              variant="outline"
              className="w-full font-heading font-semibold py-6 text-base gap-2 border-brand-gold-soft hover:border-brand-gold hover:bg-brand-gold/5 text-brand-dark"
            >
              <UserPlus size={18} />
              {t('auth.signUp')}
            </Button>
          </div>

          {/* Subtle hint */}
          <p className="font-body text-xs text-brand-dark/40 mt-6 text-center">
            {t('auth.requiredHint')}
          </p>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  );
}
