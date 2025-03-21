import React, { useState, useEffect} from "react";
import { useQuizSettingsListener } from "../../hooks/useQuizSettingsListener";
import useQuestionOrder from "../../hooks/useQuestionOrder";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import ImageModal from '../ImageModal/ImageModal';

function QuizQuestion() {
  const { user } = useAuth();
  const { questions, loading: questionsLoading, error, userProgress, updateUserProgress } = useQuestionOrder(user);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const navigate = useNavigate();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Effect to initialize question timer
  useEffect(() => {
    if (questions.length > 0) {
      setTimeLeft(questions[0]?.duration || 30);
    }
  }, [questions]);

  // Per-question timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [timeLeft, timerActive]);

  // Progress tracking effect
  useEffect(() => {
    if (userProgress) {
      setCurrentQuestion(userProgress.currentQuestion);
      setScore(userProgress.score);

      const lastResponse = userProgress.responses[userProgress.responses.length - 1];
      if (lastResponse) {
        const questionIndex = questions.findIndex(q => q.id === lastResponse.questionId);
        if (questionIndex === currentQuestion) {
          setSelectedOption(lastResponse.selectedAnswer);
          setTimerActive(false);
        }
      }
    }
  }, [userProgress, questions]);

  useEffect(() => {
    if (error === "Quiz already completed") {
      navigate("/completion");
    }
  }, [error, navigate]);

  const handleTimeUp = () => {
    setTimerActive(false);
    moveToNextQuestion();
  };

  const handleAnswerClick = async (index) => {
    if (selectedOption !== null) return;

    try {
      const currentQ = questions[currentQuestion];
      const isCorrect = index === currentQ.correctAnswer;
      const timeSpent = currentQ.duration - timeLeft;

      setSelectedOption(index);
      setTimerActive(false);

      if (isCorrect) {
        setScore(prev => prev + 1);
      }

      const response = {
        currentQuestion: currentQuestion,
        score: isCorrect ? score + 1 : score,
        responses: [{
          questionId: currentQ.id,
          selectedAnswer: index,
          isCorrect,
          timeSpent,
          submittedAt: new Date().toISOString(),
          displayOrder: currentQ.shuffledOptions 
            ? currentQ.shuffledOptions.map(opt => opt.originalIndex)
            : currentQ.options.map((_, i) => i)
        }]
      };

      await updateUserProgress(response);
      setTimeout(moveToNextQuestion, 1000);
    } catch (error) {
      console.error("Error saving response:", error);
      setSaveError("Failed to save response. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60) % 60;
    const remainingSeconds = seconds % 60;
    return `${minutes > 0 ? `${minutes}m ` : ''}${remainingSeconds}s`;
  };

  const completeQuiz = async () => {
    try {
      const userDocRef = doc(db, "user_orders", user.email);
      await updateDoc(userDocRef, {
        completed: true,
        completedAt: serverTimestamp(),
        finalScore: score,
        email: user.email,
        fullName: user.displayName || "Anonymous",
        uid: user.uid
      });
      navigate("/completion");
    } catch (error) {
      console.error("Error completing quiz:", error);
      setSaveError("Failed to save quiz completion. Please try again.");
    }
  };

  const moveToNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setTimeLeft(questions[nextQuestion].duration || 30);
      setTimerActive(true);
      setSelectedOption(null);
    } else {
      setShowScore(true);
      completeQuiz();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!showScore) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showScore]);

  if (questionsLoading) {
    return <div>Loading questions...</div>;
  }

  if (saveError) {
    return (
      <div className="error-container">
        <p>{saveError}</p>
        <button onClick={() => setSaveError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="quiz-question-container">
      <div className="quiz-card">
        {!showScore && (
          <div className="timer-container">
            <div className="quiz-question-header">
              <h2 className="quiz-question-title">Question {currentQuestion + 1}/{questions.length}</h2>
            </div>
            <div className="timer-content">
              <div 
                className="timer-spinner"
                style={{
                  '--progress': `${((questions[currentQuestion]?.duration - timeLeft) / questions[currentQuestion]?.duration) * 360}deg`
                }}
              ></div>
              <div className={`timer-text ${timeLeft > 10 ? "normal" : "warning"}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        )}

        {!showScore && questions[currentQuestion] && (
          <div className={`quiz-content ${questions[currentQuestion].imageUrl ? 'has-image' : ''}`}>
            {questions[currentQuestion].imageUrl && (
              <>
                <div className="question-image-container">
                  <img
                    src={questions[currentQuestion].imageUrl}
                    alt="Question"
                    className="question-image"
                    onClick={() => setIsImageModalOpen(true)}
                  />
                </div>
                <ImageModal
                  imageUrl={questions[currentQuestion].imageUrl}
                  isOpen={isImageModalOpen}
                  onClose={() => setIsImageModalOpen(false)}
                />
              </>
            )}
            <div className="question-content">
              <h2 className="quiz-question">
                {questions[currentQuestion].question}
              </h2>
              <div className="options-container">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(index)}
                    disabled={selectedOption !== null}
                    className={`option-btn ${selectedOption === index ? "selected" : ""}`}
                  >
                    <span className="option-index">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizQuestion;
