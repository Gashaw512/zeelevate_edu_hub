import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // 👈 Changed import
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import SessionChecker from "./components/SessionChecker/SessionChecker";
import { EnrolledCoursesProvider } from "./context/EnrolledCoursesContext"; 
import { ProgramsProvider } from "./context/ProgramsContext";
// import "./styles/global.css";

const App = () => {
  return (
    <AuthProvider>
      <ProgramsProvider>
        <EnrolledCoursesProvider>
          <SessionChecker />{" "}
          {/* 👈 Added SessionChecker to monitor session expiry */}
          <Router>
            <Routes>
              {" "}
              {/* 👈 Changed Switch to Routes */}
              <Route path="*" element={<AppRoutes />} />{" "}
              {/* 👈 Render AppRoutes as an element */}
            </Routes>
          </Router>
        </EnrolledCoursesProvider>
      </ProgramsProvider>
    </AuthProvider>
  );
};

export default App;
