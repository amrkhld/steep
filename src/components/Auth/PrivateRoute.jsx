import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        localStorage.setItem('returnPath', location.pathname);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "user_orders", user.email);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.completed && location.pathname !== '/completion') {
            window.location.href = '/completion';
            return;
          }
        }
        setAuthorized(true);
      } catch (err) {
        console.error("Access check error:", err);
        setAuthorized(false);
      }
      setLoading(false);
    };

    checkAccess();
  }, [user, location.pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
