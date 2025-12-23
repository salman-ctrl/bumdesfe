import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Main App Component
 * - Wraps entire app with necessary providers
 * - Sets up routing with BrowserRouter
 * - Provides authentication context to all components
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;