import { useState, useEffect } from "react";
import axios from "axios";

import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizEndTime, setQuizEndTime] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [checkedAnswer, setCheckedAnswer] = useState([]);

  useEffect(() => {
    axios
      .get("https://opentdb.com/api.php?amount=5")
      .then((response) => response.data.results)
      .then((data) => {
        const formattedData = data.map((question) => ({
          question: question.question,
          options: [
            ...question.incorrect_answers,
            question.correct_answer,
          ].sort(() => Math.random() - 0.5),
          answer: question.correct_answer,
        }));
        setQuestions(formattedData);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setCheckedAnswer([...checkedAnswer, answer]);

    const { answer: correctAnswer, options } = questions[currentQuestionIndex];
    const isCorrect = answer === correctAnswer;

    const optionElements = document.querySelectorAll(".quiz-options li label");
    optionElements.forEach((element, index) => {
      const option = element.querySelector("input").value;
      const isAnswerElement = option === answer;
      const isCorrectAnswer = options[index] === correctAnswer;
      element.classList.toggle("selected", isAnswerElement);
      element.classList.toggle("correct", isCorrect && isAnswerElement);
      element.classList.toggle("incorrect", !isCorrect && isAnswerElement);
      element.classList.toggle(
        "correct-answer",
        !isAnswerElement && isCorrectAnswer && !isCorrect
      );
      if (isAnswerElement) {
        element.querySelector("input").disabled = true;
      }
    });

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    if (isCorrect) {
      setNumCorrectAnswers(numCorrectAnswers + 1);
    }
    setSelectedAnswer("");
    setIsAnswered(false);
    if (currentQuestionIndex === questions.length - 1) {
      setShowResults(true);
      setQuizEndTime(new Date());
      setIsStarted(false);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleReviewQuiz = () => {
    setReviewMode(true);
    setShowResults(false);
  };

  const handleRetryQuiz = () => {
    setNumCorrectAnswers(0);
    setQuizStartTime(null);
    setQuizEndTime(null);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setReviewMode(false);
    setIsStarted(false);
  };

  const handleStartQuiz = () => {
    setQuizStartTime(new Date());
    setCurrentQuestionIndex(0);
    setIsStarted(true); // Cập nhật biến isStarted thành true khi bắt đầu trò chơi
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (showResults) {
    const quizTime = quizEndTime - quizStartTime;
    const quizTimeFormatted = formatTime(quizTime);
    const numQuestions = questions.length;
    const passingScore = Math.floor(numQuestions * 0.7);
    const isPassed = numCorrectAnswers >= passingScore;

    return (
      <div className="quiz-results">
        <h2>Quiz Results</h2>
        <p className="quiz-time">Time Taken: {quizTimeFormatted}</p>
        <p className="quiz-score">
          Your Score: {numCorrectAnswers} / {numQuestions}
        </p>
        <p className="quiz-pass-status">
          {isPassed
            ? "Congratulations, you passed the quiz!"
            : "Sorry, you failed the quiz."}
        </p>
        <button className="quiz-review-button" onClick={handleReviewQuiz}>
          Review Answers
        </button>
        <button className="quiz-retry-button" onClick={handleRetryQuiz}>
          Retry Quiz
        </button>
      </div>
    );
  }
  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Quiz</h2>
      {quizStartTime && (
        <p className="quiz-time-elapsed">
          Time Elapsed: {formatTime(new Date() - quizStartTime)}
        </p>
      )}
      {isStarted && currentQuestion && (
        <>
          <h3 className="quiz-question-number">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
          <p className="quiz-question">{currentQuestion.question}</p>
          <ul className="quiz-options">
            {currentQuestion.options.map((option) => (
              <li key={option}>
                <label>
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                  />
                  {option}
                </label>
              </li>
            ))}
          </ul>
          <button
            className="quiz-next-button"
            disabled={selectedAnswer === ""}
            onClick={handleNextQuestion}
          >
            {currentQuestionIndex === questions.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </>
      )}
      {!currentQuestion && (
        <>
          <p className="quiz-message">You have completed the quiz!</p>
          <button className="quiz-review-button" onClick={handleReviewQuiz}>
            Review Answers
          </button>
          <button className="quiz-retry-button" onClick={handleRetryQuiz}>
            Retry Quiz
          </button>
        </>
      )}
      {reviewMode && (
        <>
          <h2 className="quiz-review-title">Review Answers</h2>
          {questions.map((question, index) => (
            <div key={index} className="quiz-review-question">
              <p className="quiz-review-question-text">{question.question}</p>
              <ul className="quiz-review-options">
                {question.options.map((option) => (
                  <li
                    key={option}
                    className={
                      option === question.answer
                        ? "quiz-review-option-correct"
                        : "quiz-review-option-incorrect"
                    }
                  >
                    <label>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={checkedAnswer[index]}
                        defaultChecked={checkedAnswer[index]}
                        disabled
                      />
                      {option}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button className="quiz-retry-button" onClick={handleRetryQuiz}>
            Retry Quiz
          </button>
        </>
      )}
      {!quizStartTime && (
        <button className="quiz-start-button" onClick={handleStartQuiz}>
          Start Quiz
        </button>
      )}
    </div>
  );
}

export default App;
