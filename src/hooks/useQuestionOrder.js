import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

const useQuestionOrder = (user) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    const initializeQuestions = async () => {
      if (!user) return;

      try {
        // Using email directly as document ID
        const userDocRef = doc(db, "user_orders", user.email);
        const docSnap = await getDoc(userDocRef);
        const allQuestions = await fetchAllQuestions();

        if (docSnap.exists()) {
          const userData = docSnap.data();

          if (userData.completed) {
            setError("Quiz already completed");
            setLoading(false);
            return;
          }

          
          const orderedQuestions = orderQuestionsByUserData(allQuestions, userData.order);
          setQuestions(orderedQuestions);
          setUserProgress({
            currentQuestion: (userData.currentQuestion || 0) + 1,
            score: userData.score || 0,
            responses: userData.responses || []
          });
        } else {
         
          const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
          const numOfQuestions = await fetchNumOfQuestions();
          const first10Questions = shuffledQuestions.slice(0, numOfQuestions);
          const order = first10Questions.map(q => q.id);

          await setDoc(userDocRef, {
            order,
            startedAt: serverTimestamp(),
            completed: false,
            currentQuestion: 0,
            score: 0,
            responses: [],
            lastUpdated: serverTimestamp(),
            email: user.email,
            fullName: user.displayName || "Anonymous",
            uid: user.uid
          });

          setQuestions(first10Questions);
          setUserProgress({
            currentQuestion: 0,
            score: 0,
            responses: []
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeQuestions();
  }, [user]);

  const fetchNumOfQuestions = async () => {
    const snapshot = await getDocs(collection(db, "quizSettings"));
    return snapshot.docs[0].data().numOfQuestions;
  };

  const fetchAllQuestions = async () => {
    const snapshot = await getDocs(collection(db, "questions"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      options: Object.values(doc.data().options) // Convert options object to array
    }));
  };

  const createNewUserOrder = async (userDocRef, questions) => {
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    await setDoc(userDocRef, {
      order: shuffledQuestions.map(q => q.id),
      startedAt: serverTimestamp(),
      completed: false,
      responses: []
    });
    return shuffledQuestions;
  };

  const shuffleOptions = (question) => {
    const options = question.options.map((text, index) => ({
      text,
      originalIndex: index
    }));

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      ...question,
      shuffledOptions: options,
      displayOrder: options.map(opt => opt.originalIndex)
    };
  };

  const orderQuestionsByUserData = (questions, order) => {
    return order
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean)
      .map(shuffleOptions);
  };

  const updateUserProgress = async (progress) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "user_orders", user.email);
      const currentData = (await getDoc(userDocRef)).data() || {};

      // Validate and clean up response data
      const updatedResponses = progress.responses.map(response => ({
        questionId: response.questionId || null,
        selectedAnswer: response.selectedAnswer || 0,
        isCorrect: Boolean(response.isCorrect),
        timeSpent: response.timeSpent || 0,
        submittedAt: response.submittedAt || new Date().toISOString(),
        displayOrder: response.displayOrder || []
      })).filter(response => response.questionId); 

      const updateData = {
        ...currentData,
        currentQuestion: progress.currentQuestion || 0,
        score: progress.score || 0,
        responses: [...(currentData.responses || []), ...updatedResponses],
        lastUpdated: serverTimestamp()
      };

     
      Object.keys(updateData).forEach(key =>
        updateData[key] === undefined && delete updateData[key]
      );

      await setDoc(userDocRef, updateData, { merge: true });

    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  };

  return {
    questions,
    loading,
    error,
    userProgress,
    updateUserProgress,
    setUserProgress 
  };
};

export default useQuestionOrder;
