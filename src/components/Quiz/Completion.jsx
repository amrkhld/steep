import React, { useEffect, useReducer } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";


const resultsReducer = (state, action) => {
  switch (action.type) {
    case "LOADING":
      return { status: "loading" };
    case "SUCCESS":
      return { status: "success", data: action.payload };
    case "ERROR":
      return { status: "error", error: action.payload };
    default:
      return state;
  }
};

function Completion() {
  const { user } = useAuth();
  const [results, dispatch] = useReducer(resultsReducer, { status: "loading" });

  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!user?.email) return;

      dispatch({ type: "LOADING" });

      try {
        const docSnap = await getDoc(doc(db, "user_orders", user.email));
        if (!docSnap.exists()) {
          dispatch({ type: "ERROR", payload: "No quiz results found." });
          return;
        }

        const data = docSnap.data();
        if (!data.completed) {
          dispatch({ type: "ERROR", payload: "Quiz has not been completed yet." });
          return;
        }

        dispatch({ type: "SUCCESS", payload: data });
      } catch (error) {
        console.error("Error fetching results:", error);
        dispatch({
          type: "ERROR",
          payload: "Failed to load quiz results. Please try again later."
        });
      }
    };

    fetchQuizResults();
  }, [user]);

  if (results.status === "loading") {
    return <div className="loading">Loading your results...</div>;
  }

  if (results.status === "error") {
    return <div className="error">{results.error}</div>;
  }

  const { completedAt } = results.data;

  return (
    <div className="completion-container">
      <div className="completion-content">
        <h1 className="title">Quiz Submitted Successfully!</h1>
        <div className="results">
          <p>Submitted on: {completedAt?.toDate().toLocaleString()}</p>
        </div>
        <div className="completion-message">
          <p>Thank you for completing the quiz.</p>
          <p>Your responses have been recorded successfully.</p>
          <p>We will contact you via email with further information.</p>
        </div>
      </div>
      <div className="ticker-wrap">
        <div className="ticker">
          {[...Array(15)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="ticker-item">Amr Khalid M.</span>
              <span className="ticker-item">
                <a href="mailto:amrkhld.wrk@gmail.com">amrkhld.wrk@gmail.com</a>
              </span>
              <span className="ticker-item">
                <a 
                  href="https://www.linkedin.com/in/amr-khalid-4654072b8/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </span>
              <span className="ticker-item">
                <a 
                  href="https://github.com/amrkhld" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Completion;