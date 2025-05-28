import { useEffect, useReducer } from "react";
import Header from "./Header.js";
import Main from "./Main.js";
import Loader from "./Loader.js";
import Error from "./Error.js";
import StartScreen from "./StartScreen.js";
import Question from "./Question.js";
import NextButton from "./NextButton.js";
import Progress from "./Progress.js";
import FinishScreen from "./FinishScreen.js";
import RestartButton from "./RestartButton.js";
import Footer from "./Footer.js";
import Timer from "./Timer.js";
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
export default function App() {
  const [
    { status, data, index, answer, points, highscore, remainingSeconds },
    dispatch,
  ] = useReducer(reducer, initialState);
  const numQuestions = data.length;
  const maxPossiblePoints = data.reduce((prev, cur) => prev + cur.points, 0);
  useEffect(function () {
    async function loadData() {
      try {
        const res = await fetch("http://localhost:9000/questions");
        const data = await res.json();
        dispatch({ type: "dataReceived", payload: data });
      } catch (err) {
        dispatch({ type: "dataFailed" });
      }
    }
    loadData();
  }, []);
  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen dispatch={dispatch} numQuestions={numQuestions} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              points={points}
              numQuestions={numQuestions}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              dispatch={dispatch}
              answer={answer}
              question={data[index]}
            />
            <Footer>
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
              />
              <Timer dispatch={dispatch} remainingSeconds={remainingSeconds} />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <>
            <FinishScreen
              highscore={highscore}
              maxPossiblePoints={maxPossiblePoints}
              points={points}
            />
            <RestartButton dispatch={dispatch} />
          </>
        )}
      </Main>
    </div>
  );
}
