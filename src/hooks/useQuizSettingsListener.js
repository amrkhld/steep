import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { onSnapshot, collection } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

const useQuizSettingsListener = () => {
  const [quizSettings, setQuizSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setAccessAllowed, setAccessError } = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "quizSettings"),
      (snapshot) => {
        if (snapshot.empty) {
          setError("No quiz settings found");
          setLoading(false);
          return;
        }

        const settings = snapshot.docs[0].data();
        setQuizSettings(settings);
        // Always allow access regardless of time
        setAccessAllowed(true);
        setAccessError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to quiz settings:", err);
        setError("Error checking quiz settings");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [setAccessAllowed, setAccessError]);

  return { quizSettings, loading, error };
};

export { useQuizSettingsListener };
