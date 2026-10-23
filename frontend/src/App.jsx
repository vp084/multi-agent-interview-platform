import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Scorer from "./pages/Scorer";
import ResumeBuilder from "./pages/ResumeBuilder";
import InterviewStart from "./pages/InterviewStart";
import InterviewPage from "./pages/InterviewPage";
import InterviewReport from "./pages/InterviewReport";
import Roadmap from "./pages/Roadmap";
import Billing from "./pages/Billing";
import { getCurrentUser } from "./apis/user.api";
import { getResume } from "./apis/resume.api";
import { setResume } from "./redux/resumeSlice";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchUserResume = async () => {
      if (user) {
        const result = await getResume();
        dispatch(setResume(result?.data || null));
      } else {
        dispatch(setResume(null));
      }
    };
    fetchUserResume();
  }, [user, dispatch]);

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="h-1 bg-black animate-pulse w-full"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Home setUser={setUser} />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/scorer"
        element={user ? <Scorer user={user} setUser={setUser} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/resume"
        element={user ? <ResumeBuilder user={user} setUser={setUser} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/interview"
        element={user ? <InterviewStart user={user} setUser={setUser} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/interview/:id"
        element={user ? <InterviewPage user={user} setUser={setUser} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/interview/:id/report"
        element={user ? <InterviewReport user={user} setUser={setUser} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/roadmap"
        element={user ? <Roadmap user={user} setUser={setUser} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/billing"
        element={<Billing user={user} setUser={setUser} />}
      />
      <Route
        path="/pricing"
        element={<Billing user={user} setUser={setUser} />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}

export default App;