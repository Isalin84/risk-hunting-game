import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, Mail, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

type AuthView = 'main' | 'reset';

export function AuthModal({ open, onClose, defaultTab = 'login' }: AuthModalProps) {
  const { t } = useTranslation();
  const { signIn, signUp, resetPassword } = useAuth();

  const [view, setView] = useState<AuthView>('main');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const err = await signIn(loginEmail, loginPassword);
    if (err) {
      setLoginError(t('auth.invalidCredentials'));
    } else {
      onClose();
      resetForms();
    }
    setLoginLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword.length < 6) {
      setRegError(t('auth.passwordTooShort'));
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError(t('auth.passwordsMismatch'));
      return;
    }
    if (regNickname.trim().length < 2) {
      setRegError(t('auth.nicknameTooShort'));
      return;
    }

    setRegLoading(true);
    const err = await signUp(regEmail, regPassword, regNickname.trim());
    if (err) {
      setRegError(err.message || t('auth.registrationError'));
    } else {
      onClose();
      resetForms();
    }
    setRegLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    const err = await resetPassword(resetEmail);
    if (err) {
      setResetError(err.message || t('auth.resetError'));
    } else {
      setResetSent(true);
    }
    setResetLoading(false);
  };

  const resetForms = () => {
    setLoginEmail(''); setLoginPassword(''); setLoginError('');
    setRegEmail(''); setRegPassword(''); setRegConfirm(''); setRegNickname(''); setRegError('');
    setResetEmail(''); setResetError(''); setResetSent(false);
    setView('main');
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      onClose();
      resetForms();
    }
  };

  if (view === 'reset') {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-white border-brand-gold">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-brand-dark flex items-center gap-2">
              <KeyRound className="text-brand-gold" size={20} />
              {t('auth.resetPassword')}
            </DialogTitle>
          </DialogHeader>

          {resetSent ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle className="mx-auto text-game-success" size={40} />
              <p className="font-body text-brand-dark">{t('auth.resetSent')}</p>
              <Button
                variant="outline"
                onClick={() => { setView('main'); setResetSent(false); }}
                className="font-heading gap-1.5"
              >
                <ArrowLeft size={14} />
                {t('auth.backToLogin')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="font-body text-sm text-brand-dark/70">{t('auth.resetDescription')}</p>
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="font-heading">{t('auth.email')}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="font-body"
                  placeholder="email@example.com"
                />
              </div>
              {resetError && <p className="text-game-danger text-sm font-body">{resetError}</p>}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView('main')}
                  className="font-heading gap-1.5"
                >
                  <ArrowLeft size={14} />
                  {t('common.back')}
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold gap-1.5"
                >
                  <Mail size={14} />
                  {resetLoading ? '...' : t('auth.sendResetLink')}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-brand-gold">
        <Tabs defaultValue={defaultTab} key={defaultTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-brand-bg border border-brand-gold-soft">
            <TabsTrigger
              value="login"
              className="font-heading gap-1.5 data-[state=active]:bg-brand-gold data-[state=active]:text-brand-dark"
            >
              <LogIn size={14} />
              {t('auth.login')}
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="font-heading gap-1.5 data-[state=active]:bg-brand-gold data-[state=active]:text-brand-dark"
            >
              <UserPlus size={14} />
              {t('auth.register')}
            </TabsTrigger>
          </TabsList>

          {/* Login tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="font-heading">{t('auth.email')}</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="font-body"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="font-heading">{t('auth.password')}</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="font-body"
                />
              </div>
              {loginError && <p className="text-game-danger text-sm font-body">{loginError}</p>}
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold"
              >
                {loginLoading ? '...' : t('auth.signIn')}
              </Button>
              <button
                type="button"
                onClick={() => setView('reset')}
                className="w-full text-center text-sm font-body text-brand-steel-light hover:text-brand-gold transition-colors cursor-pointer"
              >
                {t('auth.forgotPassword')}
              </button>
            </form>
          </TabsContent>

          {/* Register tab */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-nickname" className="font-heading">{t('auth.nickname')}</Label>
                <Input
                  id="reg-nickname"
                  type="text"
                  value={regNickname}
                  onChange={(e) => setRegNickname(e.target.value)}
                  required
                  maxLength={20}
                  className="font-body"
                  placeholder={t('auth.nicknamePlaceholder')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="font-heading">{t('auth.email')}</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="font-body"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="font-heading">{t('auth.password')}</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  className="font-body"
                  placeholder={t('auth.minChars', { count: 6 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm" className="font-heading">{t('auth.confirmPassword')}</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  required
                  className="font-body"
                />
              </div>
              {regError && <p className="text-game-danger text-sm font-body">{regError}</p>}
              <Button
                type="submit"
                disabled={regLoading}
                className="w-full bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold"
              >
                {regLoading ? '...' : t('auth.signUp')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
