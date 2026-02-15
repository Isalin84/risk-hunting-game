import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  return (
    <div className="flex-1 flex flex-col bg-brand-bg overflow-hidden">
      <div className="border-b border-brand-gold-soft px-4 py-2 flex items-center justify-between bg-white">
        <h1 className="font-heading font-semibold text-brand-dark text-lg">
          {t('header.admin')}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-brand-dark hover:text-game-danger font-heading gap-1.5"
        >
          <LogOut size={16} />
          {t('admin.signOut')}
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
}
