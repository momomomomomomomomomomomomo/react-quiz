import { useQuiz } from "../contexts/QuizContext";

function RestartButton() {
  const { dispatch } = useQuiz();
  return (
    <button
      onClick={() => dispatch({ type: "restart" })}
      className="btn btn-ui"
    >
      Restart Quiz
    </button>
  );
}

export default RestartButton;
