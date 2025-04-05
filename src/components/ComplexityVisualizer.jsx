"use client"

import { useState } from "react"

const ComplexityVisualizer = () => {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

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
  }

  const analyzeComplexity = () => {
    if (!code.trim()) {
      alert("Please enter some code to analyze.")
      return
    }

    setLoading(true)

    // Simulate analysis delay
    setTimeout(() => {
      const complexityResult = determineComplexity(code, language)
      setResult(complexityResult)
      setLoading(false)
    }, 800)
  }

  const determineComplexity = (code, language) => {
    // Default to unknown complexity
    let complexity = {
      type: "unknown",
      display: "Unknown",
      description: "Could not determine the complexity of this code.",
      details: "The code pattern doesn't match known complexity patterns.",
      cssClass: "other",
    }

    // Clean code and prepare regex patterns based on language
    let cleanCode = code
    let nestedLoopRegex, tripleNestedLoopRegex, singleLoopRegex, logarithmicRegex, nLogNRegex

    switch (language) {
      case "javascript":
        // Remove comments and string literals to simplify analysis
        cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'[^']*'|"[^"]*"/g, "")

        // Check for nested loops - O(n^2) or higher
        nestedLoopRegex = /for\s*$$[^{]*$$\s*{[^}]*for\s*$$[^{]*$$/
        tripleNestedLoopRegex = /for\s*$$[^{]*$$\s*{[^}]*for\s*$$[^{]*$$[^}]*{[^}]*for\s*$$[^{]*$$/

        // Check for single loops - O(n)
        singleLoopRegex = /for\s*$$[^{]*$$|while\s*$$[^{]*$$/

        // Check for logarithmic patterns - O(log n)
        logarithmicRegex = /\/=\s*2|>>=\s*1|\/=\s*10|\*=\s*0\.5|\/\s*2\s*;|\*\s*0\.5\s*;|\/\s*10\s*;/

        // Check for n log n patterns (often in sorting algorithms)
        nLogNRegex = /(quicksort|mergesort|sort\s*\(|heapsort|divide\s*and\s*conquer)/i
        break

      case "python":
        // Remove comments and string literals to simplify analysis
        cleanCode = code.replace(/#.*|'''[\s\S]*?'''|"""[\s\S]*?"""|'[^']*'|"[^"]*"/g, "")

        // Check for nested loops - O(n^2) or higher
        nestedLoopRegex = /for\s+[^:]*:[\s\S]*?for\s+[^:]*:/
        tripleNestedLoopRegex = /for\s+[^:]*:[\s\S]*?for\s+[^:]*:[\s\S]*?for\s+[^:]*:/

        // Check for single loops - O(n)
        singleLoopRegex = /for\s+[^:]*:|while\s+[^:]*:/

        // Check for logarithmic patterns - O(log n)
        logarithmicRegex = /\/\/=\s*2|>>=\s*1|\/\/=\s*10|\*=\s*0\.5|\/\/\s*2|\/\/\s*10/

        // Check for n log n patterns (often in sorting algorithms)
        nLogNRegex = /(quicksort|mergesort|sort\s*\(|heapsort|divide\s*and\s*conquer)/i
        break

      case "cpp":
      case "java":
      default:
        // Remove comments and string literals to simplify analysis
        cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'[^']*'|"[^"]*"/g, "")

        // Check for nested loops - O(n^2) or higher
        nestedLoopRegex = /for\s*$$[^{]*$$\s*{[\s\S]*?for\s*$$[^{]*$$/
        tripleNestedLoopRegex = /for\s*$$[^{]*$$\s*{[\s\S]*?for\s*$$[^{]*$$[\s\S]*?{[\s\S]*?for\s*$$[^{]*$$/

        // Check for single loops - O(n)
        singleLoopRegex = /for\s*$$[^{]*$$|while\s*$$[^{]*$$/

        // Check for logarithmic patterns - O(log n)
        logarithmicRegex = /\/=\s*2|>>=\s*1|\/=\s*10|\*=\s*0\.5|\/\s*2\s*;|\*\s*0\.5\s*;|\/\s*10\s*;/

        // Check for n log n patterns (often in sorting algorithms)
        nLogNRegex = /(quicksort|mergesort|sort\s*\(|heapsort|divide\s*and\s*conquer)/i
    }

    // Make the determination based on regex matches
    if (tripleNestedLoopRegex && tripleNestedLoopRegex.test(cleanCode)) {
      complexity = {
        type: "O(n^3)",
        display: "O(n³)",
        description: "Cubic Time Complexity",
        details:
          "The code contains three nested loops, resulting in a cubic time complexity. This means if the input size doubles, the running time will increase by approximately 8 times.",
        cssClass: "on2", // Reusing the on2 class for styling
      }
    } else if (nestedLoopRegex && nestedLoopRegex.test(cleanCode)) {
      complexity = {
        type: "O(n^2)",
        display: "O(n²)",
        description: "Quadratic Time Complexity",
        details:
          "The code contains nested loops, resulting in a quadratic time complexity. This means if the input size doubles, the running time will increase by approximately 4 times.",
        cssClass: "on2",
      }
    } else if (nLogNRegex && nLogNRegex.test(cleanCode)) {
      complexity = {
        type: "O(n log n)",
        display: "O(n log n)",
        description: "Linearithmic Time Complexity",
        details:
          "The code appears to use a divide-and-conquer or sorting algorithm, resulting in a linearithmic time complexity. This is common in efficient sorting algorithms like merge sort and quicksort.",
        cssClass: "onlogn",
      }
    } else if (singleLoopRegex && singleLoopRegex.test(cleanCode)) {
      if (logarithmicRegex && logarithmicRegex.test(cleanCode)) {
        complexity = {
          type: "O(log n)",
          display: "O(log n)",
          description: "Logarithmic Time Complexity",
          details:
            "The code contains a loop with a pattern of dividing by a constant in each iteration, resulting in logarithmic time complexity. This is common in binary search algorithms.",
          cssClass: "ologn",
        }
      } else {
        complexity = {
          type: "O(n)",
          display: "O(n)",
          description: "Linear Time Complexity",
          details:
            "The code contains a single loop that iterates through the input, resulting in linear time complexity. This means the running time grows linearly with the input size.",
          cssClass: "on",
        }
      }
    } else if (logarithmicRegex && logarithmicRegex.test(cleanCode)) {
      complexity = {
        type: "O(log n)",
        display: "O(log n)",
        description: "Logarithmic Time Complexity",
        details:
          "The code contains a pattern of dividing by a constant, resulting in logarithmic time complexity. This is common in binary search algorithms.",
        cssClass: "ologn",
      }
    } else {
      // Check if the code has any control structures
      let controlStructureRegex

      switch (language) {
        case "python":
          controlStructureRegex = /for|while|if|elif|else|def|class|with|try|except/
          break
        case "cpp":
        case "java":
          controlStructureRegex = /for|while|if|else|switch|case|class|try|catch|throw/
          break
        default: // javascript
          controlStructureRegex = /for|while|if|else|\?|:|switch|case|try|catch|throw/
      }

      if (!controlStructureRegex.test(cleanCode)) {
        // If no control structures are found, it might be constant time
        complexity = {
          type: "O(1)",
          display: "O(1)",
          description: "Constant Time Complexity",
          details:
            "The code has no loops or recursive calls, resulting in constant time complexity. This means the running time doesn't depend on the input size.",
          cssClass: "o1",
        }
      }
    }

    return complexity
  }

  const getComplexityExplanation = (type) => {
    // Basic explanations
    const explanations = {
      "O(1)": `
        <h4>Constant Time - O(1)</h4>
        <p>Constant time algorithms perform the same number of operations regardless of the input size. These are the most efficient algorithms.</p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>Array access by index</li>
          <li>Simple arithmetic operations</li>
          <li>Hash map lookups (in the average case)</li>
        </ul>
      `,
      "O(log n)": `
        <h4>Logarithmic Time - O(log n)</h4>
        <p>Logarithmic time algorithms reduce the problem size by a constant factor in each step. They're very efficient, especially for large inputs.</p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>Binary search</li>
          <li>Operations in balanced binary search trees</li>
          <li>Finding exponents using repeated squaring</li>
        </ul>
      `,
      "O(n)": `
        <h4>Linear Time - O(n)</h4>
        <p>Linear time algorithms have a runtime that is directly proportional to the input size. They typically process each input element once.</p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>Linear search</li>
          <li>Traversing arrays or linked lists</li>
          <li>Finding maximum/minimum in an unsorted array</li>
        </ul>
      `,
      "O(n log n)": `
        <h4>Linearithmic Time - O(n log n)</h4>
        <p>Linearithmic time algorithms are often divide-and-conquer algorithms that split the input, solve the subproblems, and combine the results.</p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>Merge sort</li>
          <li>Quick sort (average case)</li>
          <li>Heap sort</li>
        </ul>
      `,
      "O(n^2)": `
        <h4>Quadratic Time - O(n²)</h4>
        <p>Quadratic time algorithms often involve nested loops, where each loop iterates through the input. They can be inefficient for large inputs.</p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>Bubble sort</li>
          <li>Insertion sort</li>
          <li>Simple matrix multiplication</li>
        </ul>
      `,
      "O(n^3)": `
        <h4>Cubic Time - O(n³)</h4>
        <p>Cubic time algorithms often involve triply nested loops. They can be very inefficient for large inputs.</p>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>Naive matrix multiplication</li>
          <li>Some dynamic programming solutions</li>
          <li>Floyd-Warshall algorithm for all-pairs shortest paths</li>
        </ul>
      `,
      unknown: `
        <h4>Unknown Complexity</h4>
        <p>The complexity of this code could not be determined automatically. Consider the following:</p>
        <ul>
          <li>Check for nested loops and recursive calls</li>
          <li>Look for divide-and-conquer patterns</li>
          <li>Analyze how the runtime changes as the input size increases</li>
        </ul>
      `,
    }

    return explanations[type] || explanations["unknown"]
  }

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
                <p>{result.details}</p>
              </div>

              <div className="visualization-container">
                <h4>Visual Representation</h4>
                <div className="visualization-graph">
                  <div className="graph-container">
                    <div className="y-axis">
                      <span>Time</span>
                    </div>
                    <div className="graph-area">
                      <div className={`graph-line ${result.cssClass}-animation`}></div>
                    </div>
                    <div className="x-axis">
                      <span>Input Size (n)</span>
                    </div>
                  </div>
                </div>
                <div
                  className="complexity-explanation"
                  dangerouslySetInnerHTML={{ __html: getComplexityExplanation(result.type) }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default ComplexityVisualizer

