import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // 👈 Changed import
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./index.css"; 
import SessionChecker from "./components/SessionChecker/SessionChecker";
// import "./styles/global.css"; 

const App = () => {
  return (
    <AuthProvider>
      <SessionChecker /> {/* 👈 Added SessionChecker to monitor session expiry */ }
      <Router>
        <Routes> {/* 👈 Changed Switch to Routes */}
          <Route path="*" element={<AppRoutes />} /> {/* 👈 Render AppRoutes as an element */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;