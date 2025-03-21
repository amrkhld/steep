import React from 'react';

const Quiz = ({ question, onAnswer }) => {
  const handleOptionSelect = (option) => {
    onAnswer({
      questionId: question.id,
      answer: option,
      question: {
        id: question.id,
        displayOrder: question.displayOrder
      },
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="quiz-container">
      <h2 className="question-text">{question.question}</h2>
      <div className="options-container">
        {question.shuffledOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            className="option-button"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
