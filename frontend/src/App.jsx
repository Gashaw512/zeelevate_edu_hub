// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import AppProviders from './components/Providers/AppProviders';
import SessionChecker from './components/SessionChecker/SessionChecker';
import ScrollToTop from './components/common/ScrollToTop'; // ✅

import './index.css';

const App = () => {
  return (
    <Router>
      <ScrollToTop /> {/* ✅ This ensures new pages scroll to top */}
      <AppProviders>
        <SessionChecker />
        <Routes>
          <Route path="*" element={<AppRoutes />} />
        </Routes>
      </AppProviders>
    </Router>
  );
};

export default App;
