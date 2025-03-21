import { useAuth } from "./contexts/AuthContext";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import PrivateRoute from "./components/Auth/PrivateRoute";
import QuizQuestion from "./components/Quiz/QuizQuestion";
import Completion from "./components/Quiz/Completion";
import Navbar from "./components/Layout/Navbar";

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app-container">
        <div className="gradient-container">
          <div className="floating-shape shape1"></div>
          <div className="floating-shape shape2"></div>
          <div className="floating-shape shape3"></div>
        </div>
        {user && <Navbar />}
        <div className={`main-content ${user ? 'with-navbar' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/quiz"
              element={
                <PrivateRoute>
                  <QuizQuestion />
                </PrivateRoute>
              }
            />
            <Route
              path="/completion"
              element={
                <PrivateRoute>
                  <Completion />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/quiz" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
