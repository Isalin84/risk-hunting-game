import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { GamePage } from '@/pages/GamePage';
import { AdminPage } from '@/pages/AdminPage';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col bg-brand-bg">
        <Header />
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}
