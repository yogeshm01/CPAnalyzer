"use client"

import { useState } from "react"

const DebugHelper = () => {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState([])
  const [analyzed, setAnalyzed] = useState(false)

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

  const analyzeCode = () => {
    if (!code.trim()) {
      alert("Please enter some code to analyze.")
      return
    }

    setLoading(true)
    setAnalyzed(false)

    // Simulate analysis delay
    setTimeout(() => {
      const detectedIssues = analyzeCodeForIssues(code, language)
      setIssues(detectedIssues)
      setAnalyzed(true)
      setLoading(false)
    }, 800)
  }

  const analyzeCodeForIssues = (code, language) => {
    const issues = []

    // Split code into lines for line-specific issues
    const lines = code.split("\n")

    // Common checks for all languages
    issues.push(...checkForEmptyBlocks(code, lines))
    issues.push(...checkForTodoComments(code, lines))

    // Language-specific checks
    switch (language) {
      case "javascript":
        issues.push(...checkJavaScriptIssues(code, lines))
        break
      case "python":
        issues.push(...checkPythonIssues(code, lines))
        break
      case "cpp":
        issues.push(...checkCppIssues(code, lines))
        break
      case "java":
        issues.push(...checkJavaIssues(code, lines))
        break
    }

    return issues
  }

  const checkForEmptyBlocks = (code, lines) => {
    const issues = []
    const emptyBlockRegex = /{\s*}/g
    let match

    while ((match = emptyBlockRegex.exec(code)) !== null) {
      // Find the line number for this match
      const upToMatch = code.substring(0, match.index)
      const lineNumber = upToMatch.split("\n").length

      issues.push({
        type: "warning",
        message: "Empty code block found",
        lineNumber,
        code: lines[lineNumber - 1],
      })
    }

    return issues
  }

  const checkForTodoComments = (code, lines) => {
    const issues = []
    const todoRegex = /\/\/.*TODO|\/\*.*TODO|#.*TODO/gi

    lines.forEach((line, index) => {
      if (todoRegex.test(line)) {
        issues.push({
          type: "info",
          message: "TODO comment found",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    return issues
  }

  const checkJavaScriptIssues = (code, lines) => {
    const issues = []

    // Check for missing semicolons
    lines.forEach((line, index) => {
      // Skip lines that end with brackets, comments, or already have semicolons
      if (
        !/[{}[\];]$/.test(line.trim()) &&
        /[^,]\s*$/.test(line.trim()) &&
        line.trim().length > 0 &&
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("if") &&
        !line.trim().startsWith("for") &&
        !line.trim().startsWith("while") &&
        !line.trim().startsWith("function")
      ) {
        issues.push({
          type: "warning",
          message: "Missing semicolon",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    // Check for potential infinite loops
    const infiniteLoopRegex = /while\s*$$\s*true\s*$$|for\s*$$[^;]*;[^;]*;\s*$$/g
    let match

    while ((match = infiniteLoopRegex.exec(code)) !== null) {
      const upToMatch = code.substring(0, match.index)
      const lineNumber = upToMatch.split("\n").length

      issues.push({
        type: "error",
        message: "Potential infinite loop",
        lineNumber,
        code: lines[lineNumber - 1],
      })
    }

    // Check for console.log statements
    lines.forEach((line, index) => {
      if (/console\.log/.test(line)) {
        issues.push({
          type: "warning",
          message: "Console.log statement found. Consider removing before production.",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    // Check for loose equality (==) instead of strict equality (===)
    lines.forEach((line, index) => {
      if (/[^=!]==[^=]/.test(line)) {
        issues.push({
          type: "warning",
          message: "Using loose equality (==) instead of strict equality (===)",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    return issues
  }

  const checkPythonIssues = (code, lines) => {
    const issues = []

    // Check for indentation issues (simplified)
    let previousIndentation = 0
    lines.forEach((line, index) => {
      if (line.trim() === "") return // Skip empty lines

      const currentIndentation = line.search(/\S/)
      if (
        currentIndentation > 0 &&
        currentIndentation !== previousIndentation &&
        currentIndentation !== previousIndentation + 4
      ) {
        issues.push({
          type: "error",
          message: "Inconsistent indentation",
          lineNumber: index + 1,
          code: line,
        })
      }

      if (
        line.trim().startsWith("def") ||
        line.trim().startsWith("class") ||
        line.trim().startsWith("if") ||
        line.trim().startsWith("else") ||
        line.trim().startsWith("elif") ||
        line.trim().startsWith("for") ||
        line.trim().startsWith("while")
      ) {
        previousIndentation = currentIndentation
      }
    })

    // Check for potential infinite loops
    lines.forEach((line, index) => {
      if (/while\s+True:/.test(line) && !code.includes("break")) {
        issues.push({
          type: "error",
          message: "Potential infinite loop - while True without break",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    // Check for print statements (should use logging in production)
    lines.forEach((line, index) => {
      if (/\bprint\s*\(/.test(line)) {
        issues.push({
          type: "warning",
          message: "Print statement found. Consider using logging for production code.",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    // Check for missing or extra colon
    lines.forEach((line, index) => {
      if (/\b(if|elif|else|for|while|def|class)\b[^:]*$/.test(line.trim())) {
        issues.push({
          type: "error",
          message: "Missing colon at the end of the statement",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    return issues
  }

  const checkCppIssues = (code, lines) => {
    const issues = []

    // Check for missing semicolons
    lines.forEach((line, index) => {
      // Skip lines that end with brackets, comments, or already have semicolons
      if (
        !/[{}[\];]$/.test(line.trim()) &&
        line.trim().length > 0 &&
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("#") &&
        !line.trim().startsWith("if") &&
        !line.trim().startsWith("for") &&
        !line.trim().startsWith("while") &&
        !line.trim().startsWith("else")
      ) {
        issues.push({
          type: "warning",
          message: "Missing semicolon",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    // Check for potential memory leaks (new without delete)
    const newCount = (code.match(/\bnew\b/g) || []).length
    const deleteCount = (code.match(/\bdelete\b/g) || []).length

    if (newCount > deleteCount) {
      issues.push({
        type: "warning",
        message: "Potential memory leak: more new operations than delete operations",
        lineNumber: 1,
        code: "Memory management issue in the overall code",
      })
    }

    // Check for cout without endl or \n
    lines.forEach((line, index) => {
      if (line.includes("cout") && !line.includes("endl") && !line.includes("\\n")) {
        issues.push({
          type: "warning",
          message: "cout without endl or \\n",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    return issues
  }

  const checkJavaIssues = (code, lines) => {
    const issues = []

    // Check for missing semicolons
    lines.forEach((line, index) => {
      // Skip lines that end with brackets, comments, or already have semicolons
      if (
        !/[{}[\];]$/.test(line.trim()) &&
        line.trim().length > 0 &&
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("if") &&
        !line.trim().startsWith("for") &&
        !line.trim().startsWith("while") &&
        !line.trim().startsWith("public") &&
        !line.trim().startsWith("private") &&
        !line.trim().startsWith("protected") &&
        !line.trim().startsWith("class")
      ) {
        issues.push({
          type: "warning",
          message: "Missing semicolon",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    // Check for System.out.println
    lines.forEach((line, index) => {
      if (/System\.out\.print/.test(line)) {
        issues.push({
          type: "warning",
          message: "System.out.println found. Consider using a logger for production code.",
          lineNumber: index + 1,
          code: line,
        })
      }
    })

    // Check for potential equals/hashCode contract violation
    const hasEquals = code.includes("public boolean equals(")
    const hasHashCode = code.includes("public int hashCode(")

    if (hasEquals && !hasHashCode) {
      issues.push({
        type: "warning",
        message: "equals() is overridden, but hashCode() is not. This violates the equals/hashCode contract.",
        lineNumber: 1,
        code: "Class structure issue",
      })
    } else if (!hasEquals && hasHashCode) {
      issues.push({
        type: "warning",
        message: "hashCode() is overridden, but equals() is not. This violates the equals/hashCode contract.",
        lineNumber: 1,
        code: "Class structure issue",
      })
    }

    return issues
  }

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
          <p className="help-text">Paste your code below to check for common errors and issues.</p>
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
            <i className="fas fa-search"></i> Analyze Code
          </button>
        </div>

        <div className="debug-result">
          <h3>Debugging Results</h3>

          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Analyzing code...</p>
            </div>
          )}

          {!loading && !analyzed && (
            <div className="empty-state">
              <i className="fas fa-bug"></i>
              <p>Enter your code and click "Analyze Code" to see the debugging results.</p>
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
                    <p>No issues found in your code!</p>
                  </div>
                ) : (
                  <>
                    <h4>
                      {issues.length} issue{issues.length === 1 ? "" : "s"} found
                    </h4>
                    <div className="issue-list">
                      {issues.map((issue, index) => (
                        <div
                          key={index}
                          className={`issue-item ${issue.type} fade-in`}
                          style={{ "--animation-order": index }}
                        >
                          <i
                            className={`fas ${issue.type === "error" ? "fa-times-circle" : "fa-exclamation-triangle"}`}
                          ></i>
                          <div className="issue-item-content">
                            <div>{issue.message}</div>
                            <div className="issue-item-location">
                              Line {issue.lineNumber}: {issue.code}
                            </div>
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

