import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import SessionChecker from './components/SessionChecker/SessionChecker';
import AppProviders from './components/Providers/AppProviders';

import './index.css'; 

const App = () => {
  return (
    <Router>
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
