"use client"
// require('dotenv').config();
import { useState } from "react"

const DebugHelper = () => {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState([])
  const [analyzed, setAnalyzed] = useState(false)
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  const languagePlaceholders = {
    javascript: `// Paste your code here to find common errors
function example() {
  let a = 10
  if (a == 10) {
    console.log('Hello World')
  }
}`,
    python: `# Paste your code here to find common errors
def example():
    a = 10
    if a == 10:
        print('Hello World')`,
    cpp: `// Paste your code here to find common errors
void example() {
    int a = 10;
    if (a == 10) {
        cout << "Hello World" << endl;
    }
}`,
    java: `// Paste your code here to find common errors
void example() {
    int a = 10;
    if (a == 10) {
        System.out.println("Hello World");
    }
}`,
  }

  const analyzeCode = async () => {
    if (!code.trim()) {
      alert("Please enter some code to analyze.")
      return
    }

    setLoading(true)
    setAnalyzed(false)
    setIssues([])

    try {
      const prompt = `Please analyze the following code written in ${language} for common errors, potential issues, and suggest improvements. Point out specific line numbers if possible:\n\n${code}`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.4,
            },
          }),
        }
      )

      const data = await response.json()
      console.log("Gemini Debugging Response:", data)

      if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        const analysisResult = data.candidates[0].content.parts[0].text.trim().split("\n")
        const detectedIssues = parseGeminiOutput(analysisResult)
        setIssues(detectedIssues)
        setAnalyzed(true)
      } else {
        setIssues([{ type: "error", message: "Could not parse debugging analysis" }])
        setAnalyzed(true)
      }
    } catch (error) {
      console.error("Error analyzing code:", error)
      setIssues([{ type: "error", message: "Failed to analyze code" }])
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  const parseGeminiOutput = (analysisLines) => {
    const issues = [];
    let currentIssue = null;

    analysisLines.forEach((line) => {
      const issueKeywords = ["Error:", "Errors:", "Issue:", "Issues:", "Warning:", "Warnings:", "Potential error:", "Possible issue:", "Suggestion:", "Problem:", "Note:"];
      let issueFoundInLine = false;

      for (const keyword of issueKeywords) {
        const index = line.indexOf(keyword);
        if (index !== -1) {
          issueFoundInLine = true;
          if (currentIssue) issues.push(currentIssue);
          const messagePart = line.substring(index + keyword.length).trim();
          const lineNumberMatch = messagePart.match(/\(Line\s*(\d+)\)/i);
          const lineNumber = lineNumberMatch ? parseInt(lineNumberMatch[1], 10) : null;
          const message = lineNumberMatch ? messagePart.substring(0, lineNumberMatch.index).trim() : messagePart.trim();
          const type = keyword.toLowerCase().includes("error") ? "error" : keyword.toLowerCase().includes("warning") ? "warning" : "info";
          currentIssue = { type, message, lineNumber, code: null };
          break; // Move to the next line after finding a keyword
        }
      }

      // If no new issue keyword is found, and we have a current issue, append to its message
      if (!issueFoundInLine && currentIssue && line.trim() !== "") {
        currentIssue.message += "\n" + line.trim();
      } else if (!currentIssue && line.trim() !== "" && !/^(The|provided|Here's|Improvements):/i.test(line)) {
        // If no current issue and the line isn't a general intro/outro, start a potential info issue
        currentIssue = { type: "info", message: line.trim(), lineNumber: null, code: null };
      }
    });

    if (currentIssue) {
      issues.push(currentIssue);
    }

    return issues;
  };

  const highlightSyntax = (code, language) => {
    // Simple syntax highlighting for demonstration
    // In a real app, you would use a library like Prism.js or highlight.js
    return code
  }

  return (
    <section>
      <div className="section-header">
        <h2>Interactive Debugging Helper</h2>
      </div>

      <div className="debugger-container">
        <div className="code-input">
          <h3>Paste Your Code</h3>
          <p className="help-text">Paste your code below to check for common errors and issues using AI.</p>
          <textarea
            id="debug-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={languagePlaceholders[language]}
          />
          <div className="language-selector">
            <label htmlFor="language-select">Language:</label>
            <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>
          <button className="btn primary" onClick={analyzeCode} disabled={loading}>
            <i className="fas fa-search"></i> Analyze Code with AI
          </button>
        </div>

        <div className="debug-result">
          <h3>Debugging Results</h3>

          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Analyzing code with AI...</p>
            </div>
          )}

          {!loading && !analyzed && (
            <div className="empty-state">
              <i className="fas fa-brain"></i>
              <p>Enter your code and click "Analyze Code with AI" to see the debugging results.</p>
            </div>
          )}

          {!loading && analyzed && (
            <div className="debug-output">
              <div className="code-preview">
                <h4>Code Analysis</h4>
                <div className="code-block">{highlightSyntax(code, language)}</div>
              </div>

              <div className="issues-container">
                {issues.length === 0 ? (
                  <div className="success-message">
                    <i className="fas fa-check-circle"></i>
                    <p>Found no significant issues in your code!</p>
                  </div>
                ) : (
                  <>
                    <h4>
                      {issues.length} issue{issues.length === 1 ? "" : "s"} identified
                    </h4>
                    <div className="issue-list">
                      {issues.map((issue, index) => (
                        <div
                          key={index}
                          className={`issue-item ${issue.type} fade-in`}
                          style={{ "--animation-order": index }}
                        >
                          <i
                            className={`fas ${issue.type === "error" ? "fa-times-circle" : issue.type === "warning" ? "fa-exclamation-triangle" : "fa-info-circle"}`}
                          ></i>
                          <div className="issue-item-content">
                            <div>{issue.message}</div>
                            {issue.lineNumber && (
                              <div className="issue-item-location">
                                Line {issue.lineNumber}: {issue.code ? issue.code.trim() : code.split("\n")[issue.lineNumber - 1]?.trim()}
                              </div>
                            )}
                            {!issue.lineNumber && issue.code && (
                              <div className="issue-item-location">
                                Code: {issue.code.trim()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DebugHelper