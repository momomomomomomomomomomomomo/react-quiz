import { createContext, useContext, useReducer } from "react";
const SEC_PER_QUESTION = 30;
const initialState = {
  status: "loading",
  data: [],
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  remainingSeconds: null,
};
function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return { ...state, data: action.payload, status: "ready" };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        remainingSeconds: state.data.length * SEC_PER_QUESTION,
      };
    case "newAnswer":
      const question = state.data.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.highscore > state.points ? state.highscore : state.points,
      };
    case "restart":
      return {
        ...state,
        status: "active",
        answer: null,
        index: 0,
        points: 0,
        remainingSeconds: state.data.length * SEC_PER_QUESTION,
      };
    case "tick":
      return {
        ...state,
        remainingSeconds: state.remainingSeconds - 1,
        status: state.remainingSeconds > 0 ? state.status : "finished",
        highscore:
          state.highscore > state.points ? state.highscore : state.points,
      };
    default:
      throw new Error("Unknown Action");
  }
}
const QuizContext = createContext();
function QuizProvider({ children }) {
  const [
    { status, data, index, answer, points, highscore, remainingSeconds },
    dispatch,
  ] = useReducer(reducer, initialState);
  const numQuestions = data.length;
  const maxPossiblePoints = data.reduce((prev, cur) => prev + cur.points, 0);
  const question = data[index];
  return (
    <QuizContext.Provider
      value={{
        status,
        data,
        index,
        answer,
        points,
        highscore,
        remainingSeconds,
        numQuestions,
        maxPossiblePoints,
        question,
        dispatch,
      }}
    >
      {" "}
      {children}
    </QuizContext.Provider>
  );
}
function useQuiz() {
  const context = useContext(QuizContext);

  if (context === undefined)
    throw new Error("QuizContext was used outsid QuizProvider");
  return context;
}
export { QuizProvider, useQuiz };
