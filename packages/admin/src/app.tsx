import { Router, Route } from 'preact-router';
import { baseUrl } from './utils/url';
import { queryClient } from './lib/query';
import { QueryClientProvider } from '@tanstack/preact-query';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path={baseUrl + "/"} component={DashboardPage} />
        <Route path={baseUrl + "/login"} component={LoginPage} />
      </Router>
    </QueryClientProvider>
  );
}
