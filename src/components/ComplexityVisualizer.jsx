import { useState } from "react";
// require('dotenv').config();
const ComplexityVisualizer = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  const languagePlaceholders = {
    javascript: `function example(n) {
  for (let i = 0; i < n; i++) {
    console.log(i);
  }
}`,
    python: `def example(n):
  for i in range(n):
    print(i)`,
    cpp: `void example(int n) {
  for (int i = 0; i < n; i++) {
    cout << i << endl;
  }
}`,
    java: `void example(int n) {
  for (int i = 0; i < n; i++) {
    System.out.println(i);
  }
}`,
  };

  const analyzeComplexity = async () => {
    if (!code.trim()) {
      alert("Please enter some code to analyze.");
      return;
    }

    setLoading(true);

    try {
      console.log("vjsfa",apiKey)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `Please analyze the following code and determine its time complexity. Provide a brief explanation of how you reached the conclusion. The code is written in ${language}:\n\n${code}` }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      console.log("Response from Gemini:", data);
      if (
        data &&
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        const description = data.candidates[0].content.parts[0].text.trim();
        let complexity = "Unknown"; 


        const complexityMatch = description.match(/O\([a-zA-Z0-9^()\s]+\)/);

        if (complexityMatch && complexityMatch[0]) {
          complexity = complexityMatch[0];
        }
        setResult({
          type: "unknown",
          display: complexity,
          description: description,
          cssClass: "other",
        });
      } else {
        setResult({
          type: "unknown",
          display: "Error",
          description: "Could not parse the analysis result",
          cssClass: "error",
        });
      }
    } catch (error) {
      console.error("Error analyzing complexity:", error);
      setResult({
        type: "unknown",
        display: "Error",
        description: "There was an error analyzing the code complexity.",
        cssClass: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="section-header">
        <h2>Time Complexity Visualizer</h2>
      </div>

      <div className="complexity-container">
        <div className="complexity-input">
          <h3>Enter Your Code</h3>
          <p className="help-text">Paste your function code below to analyze its time complexity.</p>
          <div className="language-selector">
            <label htmlFor="complexity-language">Language:</label>
            <select id="complexity-language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>
          <textarea
            id="complexity-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={languagePlaceholders[language]}
          />
          <button className="btn primary" onClick={analyzeComplexity} disabled={loading}>
            <i className="fas fa-search"></i> Analyze Complexity
          </button>
        </div>

        <div className="complexity-result">
          <h3>Analysis Result</h3>

          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Analyzing...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="empty-state">
              <i className="fas fa-chart-line"></i>
              <p>Enter your code and click "Analyze Complexity" to see the results.</p>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="complexity-result-card">
                <div className={`complexity-badge ${result.cssClass}`}>{result.display}</div>
                <h4>{result.description}</h4>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ComplexityVisualizer;