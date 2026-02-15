import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function LoginForm() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await signIn(email, password);
    if (err) setError(t('admin.loginError'));
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-brand-bg p-4">
      <Card className="w-full max-w-sm border-brand-gold">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-brand-dark flex items-center gap-2 justify-center">
            <Shield className="text-brand-gold" />
            {t('admin.login')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-heading">{t('admin.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-heading">{t('admin.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-body"
              />
            </div>
            {error && <p className="text-game-danger text-sm font-body">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold"
            >
              {loading ? '...' : t('admin.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
