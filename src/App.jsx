import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // 👈 Changed import
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes> {/* 👈 Changed Switch to Routes */}
          <Route path="*" element={<AppRoutes />} /> {/* 👈 Render AppRoutes as an element */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;