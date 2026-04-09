import { useState, useEffect } from "react";
import "./App.css";

const goals = ["weight loss", "muscle gain", "stay fit"];
const levels = ["beginner", "intermediate", "advanced"];

function App() {
  const [formData, setFormData] = useState({
    goal: "weight loss",
    level: "beginner",
    days: 3,
    injuries: "",
  });

  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [displayText, setDisplayText] = useState("");

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleSelect = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const buildPrompt = () => `
You are a professional fitness coach.
Goal: ${formData.goal}
Level: ${formData.level}
Days: ${formData.days}
Injuries: ${formData.injuries || "None"}
`;

  // typing effect
  useEffect(() => {
    if (!text) return;
    let i = 0;
    setDisplayText("");

    const interval = setInterval(() => {
      setDisplayText((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 8);

    return () => clearInterval(interval);
  }, [text]);

  const generate = async () => {
    setLoading(true);
    setText("");

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt() }] }],
          }),
        }
      );

      const data = await res.json();
      const output =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      setText(output);
    } catch {
      setText("Error generating plan");
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <div className="bg"></div>

      <div className="card">
        <h1 className="title">
          AI Fitness Planner
          <span className="pulse-dot"></span>
        </h1>

        {/* GOALS */}
        <div className="chip-group">
          {goals.map((g) => (
            <div
              key={g}
              className={`chip ${formData.goal === g ? "active" : ""}`}
              onClick={() => handleSelect("goal", g)}
            >
              {g}
            </div>
          ))}
        </div>

        {/* LEVEL */}
        <div className="chip-group">
          {levels.map((l) => (
            <div
              key={l}
              className={`chip ${formData.level === l ? "active" : ""}`}
              onClick={() => handleSelect("level", l)}
            >
              {l}
            </div>
          ))}
        </div>

        <input
          type="number"
          value={formData.days}
          onChange={(e) =>
            setFormData({ ...formData, days: e.target.value })
          }
          className="input"
          placeholder="Days per week"
        />

        <div className="textarea-wrapper">
          <textarea
            placeholder="Injuries or limitations (e.g. knee pain)"
            onChange={(e) =>
              setFormData({ ...formData, injuries: e.target.value })
            }
          />
          <span className="info">i</span>
        </div>

        <button onClick={generate} className={loading ? "loading" : ""}>
          {loading ? <div className="progress"></div> : "Generate Plan ⚡"}
        </button>
      </div>

      {displayText && (
        <div className="output">
          <div className="bubble">
            <div className="ai">🤖</div>
            <div className="text">
              {displayText}
              <span className="cursor"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;