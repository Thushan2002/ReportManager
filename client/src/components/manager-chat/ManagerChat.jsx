import { useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client.js";
import "./ManagerChat.scss";

const starterQuestions = [
  "What did the team complete last week?",
  "Which blockers need manager attention?",
  "Who may have workload or delivery risk?",
];

export const ManagerChat = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (event) => {
    event?.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    setMessages((current) => [
      ...current,
      { role: "manager", text: trimmedQuestion },
    ]);
    setQuestion("");
    setLoading(true);

    try {
      const { data } = await client.post("/manager-chat", {
        question: trimmedQuestion,
      });
      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.answer },
      ]);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "The assistant could not answer right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const setStarterQuestion = (starterQuestion) => {
    setQuestion(starterQuestion);
  };

  return (
    <div className={`manager-chat ${open ? "manager-chat--open" : ""}`}>
      {open && (
        <section
          className="manager-chat__panel"
          aria-label="Manager AI assistant">
          <header className="manager-chat__header">
            <div>
              <span className="manager-chat__eyebrow">
                Manager intelligence
              </span>
              <h2>Ask about the team</h2>
            </div>
            <button
              className="manager-chat__close"
              onClick={() => setOpen(false)}
              aria-label="Close assistant">
              <FiX />
            </button>
          </header>

          <div className="manager-chat__body">
            {messages.length === 0 && (
              <div className="manager-chat__welcome">
                <div className="manager-chat__welcome-icon">
                  <FiMessageCircle />
                </div>
                <p>
                  Ask a question about recent work, blockers, delivery, or team
                  workload.
                </p>
                <div className="manager-chat__starters">
                  {starterQuestions.map((starterQuestion) => (
                    <button
                      key={starterQuestion}
                      onClick={() => setStarterQuestion(starterQuestion)}>
                      {starterQuestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                className={`manager-chat__message manager-chat__message--${message.role}`}
                key={`${message.role}-${index}`}>
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="manager-chat__message manager-chat__message--assistant manager-chat__typing">
                Reviewing team reports...
              </div>
            )}
          </div>

          <form className="manager-chat__form" onSubmit={ask}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a manager question..."
              aria-label="Ask the manager assistant"
              maxLength={1000}
              disabled={loading}
            />
            <button
              type="submit"
              aria-label="Send question"
              disabled={!question.trim() || loading}>
              <FiSend />
            </button>
          </form>
        </section>
      )}

      <button
        className="manager-chat__toggle"
        onClick={() => setOpen((current) => !current)}
        aria-label={
          open ? "Close manager assistant" : "Open manager assistant"
        }>
        {open ? <FiX /> : <FiMessageCircle />}
        {!open && <span>Ask AI</span>}
      </button>
    </div>
  );
};
