// Services
export { signInAdmin, signOutAdmin, getCurrentAdmin, checkIsAdmin } from './services/adminAuth';
export type { AdminUser } from './services/adminAuth';

// Hooks
export { useAdminAuth } from './hooks/useAdminAuth';

// UI
export { AdminLayout } from './ui/AdminLayout';

// Pages
export { AdminLoginPage } from './pages/AdminLoginPage';
export { AdminDashboardPage } from './pages/AdminDashboardPage';
export { AdminClipsPage } from './pages/AdminClipsPage';
export { AdminCorrectionsPage } from './pages/AdminCorrectionsPage';
export { AdminContributorsPage } from './pages/AdminContributorsPage';
export { AdminSettingsPage } from './pages/AdminSettingsPage';
