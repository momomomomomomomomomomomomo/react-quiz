function RestartButton({ dispatch }) {
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
