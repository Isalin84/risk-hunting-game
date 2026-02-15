import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LevelList } from '@/components/admin/LevelList';
import { SoundManager } from '@/components/admin/SoundManager';
import { LeaderboardTable } from '@/components/admin/LeaderboardTable';
import { useTranslation } from 'react-i18next';
import { Layers, Volume2, Trophy } from 'lucide-react';

export function AdminPage() {
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-bg">
        <div className="text-brand-dark font-heading text-xl animate-pulse">{t('common.loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <AdminLayout>
      <Tabs defaultValue="levels" className="space-y-4">
        <TabsList className="bg-white border border-brand-gold-soft">
          <TabsTrigger value="levels" className="font-heading gap-1.5 data-[state=active]:bg-brand-gold data-[state=active]:text-brand-dark">
            <Layers size={14} />
            {t('admin.levels')}
          </TabsTrigger>
          <TabsTrigger value="sounds" className="font-heading gap-1.5 data-[state=active]:bg-brand-gold data-[state=active]:text-brand-dark">
            <Volume2 size={14} />
            {t('admin.sounds')}
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="font-heading gap-1.5 data-[state=active]:bg-brand-gold data-[state=active]:text-brand-dark">
            <Trophy size={14} />
            {t('admin.leaderboardTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="levels">
          <LevelList />
        </TabsContent>

        <TabsContent value="sounds">
          <SoundManager />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardTable />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
