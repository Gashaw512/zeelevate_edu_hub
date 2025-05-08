import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext"; // ✅ import AuthProvider

const App = () => {
  return (
    <AuthProvider>       {/* ✅ Provide global auth context */}
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
