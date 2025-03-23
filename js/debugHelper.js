/**
 * CP Assistant - Debug Helper Module
 * Detects and highlights common syntax errors in code
 */

/**
 * Initialize the Debug Helper component
 */
function initDebugHelper() {
    const analyzeButton = document.getElementById('analyze-code');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzeCode);
    }
}

/**
 * Analyze the code for common syntax errors and issues
 */
function analyzeCode() {
    // Get the code and language
    const codeInput = document.getElementById('debug-code');
    const languageSelect = document.getElementById('language-select');
    
    const code = codeInput.value;
    const language = languageSelect.value;
    
    // Validate input
    if (!code.trim()) {
        showNotification('Please enter some code to analyze.', 'error');
        return;
    }
    
    // Show loading
    document.getElementById('debug-loading').classList.remove('hidden');
    document.getElementById('debug-output').innerHTML = '';
    
    // Simulate a small delay for analysis (for UX purposes)
    setTimeout(() => {
        // Analyze the code based on the selected language
        const issues = analyzeCodeForIssues(code, language);
        
        // Display the result
        displayDebugResult(code, issues, language);
        
        // Hide loading
        document.getElementById('debug-loading').classList.add('hidden');
    }, 800);
}

/**
 * Analyze code for common issues based on the language
 * @param {string} code - The code to analyze
 * @param {string} language - The programming language
 * @returns {Array} Array of issue objects
 */
function analyzeCodeForIssues(code, language) {
    const issues = [];
    
    // Split code into lines for line-specific issues
    const lines = code.split('\n');
    
    // Common checks for all languages
    issues.push(...checkForEmptyBlocks(code, lines));
    issues.push(...checkForTodoComments(code, lines));
    
    // Language-specific checks
    switch (language) {
        case 'javascript':
            issues.push(...checkJavaScriptIssues(code, lines));
            break;
        case 'python':
            issues.push(...checkPythonIssues(code, lines));
            break;
        case 'cpp':
            issues.push(...checkCppIssues(code, lines));
            break;
        case 'java':
            issues.push(...checkJavaIssues(code, lines));
            break;
    }
    
    return issues;
}

/**
 * Check for empty code blocks
 * @param {string} code - The full code
 * @param {Array} lines - The code split into lines
 * @returns {Array} Array of issue objects
 */
function checkForEmptyBlocks(code, lines) {
    const issues = [];
    const emptyBlockRegex = /\{\s*\}/g;
    let match;
    
    while ((match = emptyBlockRegex.exec(code)) !== null) {
        // Find the line number for this match
        const upToMatch = code.substring(0, match.index);
        const lineNumber = upToMatch.split('\n').length;
        
        issues.push({
            type: 'warning',
            message: 'Empty code block found',
            lineNumber,
            code: lines[lineNumber - 1]
        });
    }
    
    return issues;
}

/**
 * Check for TODO comments
 * @param {string} code - The full code
 * @param {Array} lines - The code split into lines
 * @returns {Array} Array of issue objects
 */
function checkForTodoComments(code, lines) {
    const issues = [];
    const todoRegex = /\/\/.*TODO|\/\*.*TODO|#.*TODO/gi;
    
    lines.forEach((line, index) => {
        if (todoRegex.test(line)) {
            issues.push({
                type: 'info',
                message: 'TODO comment found',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    return issues;
}

/**
 * Check for JavaScript-specific issues
 * @param {string} code - The full code
 * @param {Array} lines - The code split into lines
 * @returns {Array} Array of issue objects
 */
function checkJavaScriptIssues(code, lines) {
    const issues = [];
    
    // Check for missing semicolons
    lines.forEach((line, index) => {
        // Skip lines that end with brackets, comments, or already have semicolons
        if (!/[{}\[\]\/;]$/.test(line.trim()) && 
            /[^,]\s*$/.test(line.trim()) && 
            line.trim().length > 0 &&
            !line.trim().startsWith('//') &&
            !line.trim().startsWith('if') &&
            !line.trim().startsWith('for') &&
            !line.trim().startsWith('while') &&
            !line.trim().startsWith('function') &&
            !line.trim().startsWith('//')) {
            
            issues.push({
                type: 'warning',
                message: 'Missing semicolon',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    // Check for potential infinite loops
    const infiniteLoopRegex = /while\s*\(\s*true\s*\)|for\s*\([^;]*;[^;]*;\s*\)/g;
    let match;
    
    while ((match = infiniteLoopRegex.exec(code)) !== null) {
        const upToMatch = code.substring(0, match.index);
        const lineNumber = upToMatch.split('\n').length;
        
        issues.push({
            type: 'error',
            message: 'Potential infinite loop',
            lineNumber,
            code: lines[lineNumber - 1]
        });
    }
    
    // Check for console.log statements
    lines.forEach((line, index) => {
        if (/console\.log/.test(line)) {
            issues.push({
                type: 'warning',
                message: 'Console.log statement found. Consider removing before production.',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    // Check for unused variables using a simple regex (not foolproof)
    const varDeclarationRegex = /(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=?/g;
    const variableNames = [];
    
    let varMatch;
    while ((varMatch = varDeclarationRegex.exec(code)) !== null) {
        const varName = varMatch[1];
        variableNames.push({
            name: varName,
            line: code.substring(0, varMatch.index).split('\n').length
        });
    }
    
    // Check if each variable is used elsewhere in the code
    variableNames.forEach(variable => {
        // Create a regex to find usage of this variable name (but not its declaration)
        const varUsageRegex = new RegExp(`\\b${variable.name}\\b(?!\\s*=\\s*|\\s*in\\s*|\\s*of\\s*|\\s*,\\s*var|\\s*,\\s*let|\\s*,\\s*const)`, 'g');
        
        let usageCount = 0;
        let match;
        
        while ((match = varUsageRegex.exec(code)) !== null) {
            const matchLine = code.substring(0, match.index).split('\n').length;
            if (matchLine !== variable.line) {
                usageCount++;
            }
        }
        
        if (usageCount === 0) {
            issues.push({
                type: 'warning',
                message: `Unused variable '${variable.name}'`,
                lineNumber: variable.line,
                code: lines[variable.line - 1]
            });
        }
    });
    
    return issues;
}

/**
 * Check for Python-specific issues
 * @param {string} code - The full code
 * @param {Array} lines - The code split into lines
 * @returns {Array} Array of issue objects
 */
function checkPythonIssues(code, lines) {
    const issues = [];
    
    // Check for indentation issues (simplified)
    let previousIndentation = 0;
    lines.forEach((line, index) => {
        if (line.trim() === '') return; // Skip empty lines
        
        const currentIndentation = line.search(/\S/);
        if (currentIndentation > previousIndentation + 4) {
            issues.push({
                type: 'error',
                message: 'Inconsistent indentation',
                lineNumber: index + 1,
                code: line
            });
        }
        previousIndentation = currentIndentation;
    });
    
    // Check for potential infinite loops
    lines.forEach((line, index) => {
        if (/while\s+True:/.test(line) && !line.includes('break')) {
            // Check next few lines for a break statement
            let hasBreak = false;
            for (let i = index + 1; i < Math.min(index + 10, lines.length); i++) {
                if (lines[i].includes('break')) {
                    hasBreak = true;
                    break;
                }
                if (lines[i].trim() && lines[i].search(/\S/) <= currentIndentation) {
                    break;  // We've exited the loop block
                }
            }
            
            if (!hasBreak) {
                issues.push({
                    type: 'error',
                    message: 'Potential infinite loop - while True without break',
                    lineNumber: index + 1,
                    code: line
                });
            }
        }
    });
    
    // Check for print statements (should use logging in production)
    lines.forEach((line, index) => {
        if (/\bprint\s*\(/.test(line)) {
            issues.push({
                type: 'warning',
                message: 'Print statement found. Consider using logging for production code.',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    // Check for missing or extra colon
    lines.forEach((line, index) => {
        if (/\b(if|elif|else|for|while|def|class)\b[^:]*$/.test(line.trim())) {
            issues.push({
                type: 'error',
                message: 'Missing colon at the end of the statement',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    return issues;
}

/**
 * Check for C++-specific issues
 * @param {string} code - The full code
 * @param {Array} lines - The code split into lines
 * @returns {Array} Array of issue objects
 */
function checkCppIssues(code, lines) {
    const issues = [];
    
    // Check for missing semicolons
    lines.forEach((line, index) => {
        // Skip lines that end with brackets, comments, or already have semicolons
        if (!/[{}\[\]\/;]$/.test(line.trim()) && 
            line.trim().length > 0 &&
            !line.trim().startsWith('//') &&
            !line.trim().startsWith('#') &&
            !line.trim().startsWith('if') &&
            !line.trim().startsWith('for') &&
            !line.trim().startsWith('while') &&
            !line.trim().startsWith('else')) {
            
            issues.push({
                type: 'warning',
                message: 'Missing semicolon',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    // Check for potential memory leaks (new without delete)
    const newObjects = [];
    const deletedObjects = [];
    
    lines.forEach((line, index) => {
        // Find allocations
        const newMatches = line.match(/\bnew\s+\w+/g);
        if (newMatches) {
            newObjects.push(...newMatches);
        }
        
        // Find deallocations
        if (line.includes('delete')) {
            deletedObjects.push(line);
        }
    });
    
    if (newObjects.length > deletedObjects.length) {
        issues.push({
            type: 'warning',
            message: 'Potential memory leak: more new operations than delete operations',
            lineNumber: 1,
            code: 'Memory management issue in the overall code'
        });
    }
    
    // Check for cout without endl or \n
    lines.forEach((line, index) => {
        if (line.includes('cout') && !line.includes('endl') && !line.includes('\\n')) {
            issues.push({
                type: 'warning',
                message: 'cout without endl or \\n',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    return issues;
}

/**
 * Check for Java-specific issues
 * @param {string} code - The full code
 * @param {Array} lines - The code split into lines
 * @returns {Array} Array of issue objects
 */
function checkJavaIssues(code, lines) {
    const issues = [];
    
    // Check for missing semicolons
    lines.forEach((line, index) => {
        // Skip lines that end with brackets, comments, or already have semicolons
        if (!/[{}\[\]\/;]$/.test(line.trim()) && 
            line.trim().length > 0 &&
            !line.trim().startsWith('//') &&
            !line.trim().startsWith('if') &&
            !line.trim().startsWith('for') &&
            !line.trim().startsWith('while') &&
            !line.trim().startsWith('public') &&
            !line.trim().startsWith('private') &&
            !line.trim().startsWith('protected') &&
            !line.trim().startsWith('class') &&
            !line.trim().startsWith('//')) {
            
            issues.push({
                type: 'warning',
                message: 'Missing semicolon',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    // Check for System.out.println
    lines.forEach((line, index) => {
        if (/System\.out\.print/.test(line)) {
            issues.push({
                type: 'warning',
                message: 'System.out.println found. Consider using a logger for production code.',
                lineNumber: index + 1,
                code: line
            });
        }
    });
    
    // Check for potential equals/hashCode contract violation
    let hasEquals = false;
    let hasHashCode = false;
    
    lines.forEach(line => {
        if (line.includes('public boolean equals(')) {
            hasEquals = true;
        }
        if (line.includes('public int hashCode(')) {
            hasHashCode = true;
        }
    });
    
    if (hasEquals && !hasHashCode) {
        issues.push({
            type: 'warning',
            message: 'equals() is overridden, but hashCode() is not. This violates the equals/hashCode contract.',
            lineNumber: 1,
            code: 'Class structure issue'
        });
    } else if (!hasEquals && hasHashCode) {
        issues.push({
            type: 'warning',
            message: 'hashCode() is overridden, but equals() is not. This violates the equals/hashCode contract.',
            lineNumber: 1,
            code: 'Class structure issue'
        });
    }
    
    return issues;
}

/**
 * Display the debugging result on the page
 * @param {string} code - The original code
 * @param {Array} issues - Array of issue objects
 * @param {string} language - The programming language
 */
function displayDebugResult(code, issues, language) {
    const outputElement = document.getElementById('debug-output');
    
    // Syntax highlight the code
    const codeHighlighted = highlightSyntax(code, language);
    
    // Generate HTML for issues
    let issuesHtml = '';
    if (issues.length === 0) {
        issuesHtml = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <p>No issues found in your code!</p>
            </div>
        `;
    } else {
        issuesHtml = `
            <h4>${issues.length} issue${issues.length === 1 ? '' : 's'} found</h4>
            <div class="issue-list">
                ${issues.map((issue, index) => `
                    <div class="issue-item ${issue.type}" style="--animation-order: ${index}">
                        <i class="fas ${issue.type === 'error' ? 'fa-times-circle' : 'fa-exclamation-triangle'}"></i>
                        <div class="issue-item-content">
                            <div>${escapeHtml(issue.message)}</div>
                            <div class="issue-item-location">Line ${issue.lineNumber}: ${escapeHtml(issue.code)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Output the results
    outputElement.innerHTML = `
        <div class="code-preview">
            <h4>Code Analysis</h4>
            <div class="code-block">${codeHighlighted}</div>
        </div>
        <div class="issues-container">
            ${issuesHtml}
        </div>
    `;
    
    // Apply fade-in animation to issue items
    const issueItems = document.querySelectorAll('.issue-item');
    issueItems.forEach(item => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, 100);
    });
}

/**
 * Simple syntax highlighting for code
 * @param {string} code - The code to highlight
 * @param {string} language - The programming language
 * @returns {string} HTML with syntax highlighting
 */
function highlightSyntax(code, language) {
    // Define language-specific syntax patterns
    const patterns = {
        javascript: {
            keywords: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|try|catch|finally|throw|async|await)\b/g,
            builtins: /\b(console|document|window|Array|Object|String|Number|Boolean|RegExp|Math|JSON|Promise)\b/g,
            numbers: /\b(\d+\.?\d*|0x[a-f0-9]+)\b/gi,
            strings: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
            comments: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
            functions: /\b(\w+)\(/g
        },
        python: {
            keywords: /\b(def|class|import|from|as|if|elif|else|for|while|try|except|finally|with|return|break|continue|global|nonlocal|pass|raise|yield|True|False|None)\b/g,
            builtins: /\b(print|len|range|str|int|float|list|dict|set|tuple|sum|map|filter|sorted|any|all|input|open)\b/g,
            numbers: /\b(\d+\.?\d*)\b/g,
            strings: /(["'])(?:(?=(\\?))\2.)*?\1|"""[\s\S]*?"""|'''[\s\S]*?'''/g,
            comments: /(#.*)/g,
            functions: /\bdef\s+(\w+)\(/g
        },
        cpp: {
            keywords: /\b(auto|break|case|class|const|continue|default|do|else|enum|extern|for|friend|goto|if|inline|namespace|new|operator|private|protected|public|register|return|sizeof|static|struct|switch|template|this|throw|try|typedef|union|using|virtual|volatile|while)\b/g,
            builtins: /\b(cin|cout|endl|std|string|vector|map|set|pair|size|begin|end|push_back|pop_back)\b/g,
            numbers: /\b(\d+\.?\d*|0x[a-f0-9]+)\b/gi,
            strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
            comments: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
            functions: /\b(\w+)\(/g
        },
        java: {
            keywords: /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b/g,
            builtins: /\b(String|System|out|in|println|print|Math|Integer|Double|Boolean|ArrayList|HashMap|List|Map|Set)\b/g,
            numbers: /\b(\d+\.?\d*)\b/g,
            strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
            comments: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
            functions: /\b(\w+)\(/g
        }
    };
    
    // Get the patterns for the selected language
    const languagePatterns = patterns[language] || patterns.javascript;
    
    // Apply syntax highlighting
    let highlightedCode = escapeHtml(code);
    
    // Replace patterns with colored spans
    highlightedCode = highlightedCode
        .replace(languagePatterns.comments, '<span style="color: #999;">$1</span>')
        .replace(languagePatterns.strings, '<span style="color: #a11;">$&</span>')
        .replace(languagePatterns.keywords, '<span style="color: #11a;">$1</span>')
        .replace(languagePatterns.builtins, '<span style="color: #659;">$1</span>')
        .replace(languagePatterns.numbers, '<span style="color: #a1a;">$1</span>')
        .replace(languagePatterns.functions, '<span style="color: #16a;">$1</span>(');
    
    // Split code into lines and wrap each line
    const lines = highlightedCode.split('\n');
    highlightedCode = lines.map((line, index) => 
        `<span class="line-number">${index + 1}</span>${line}`
    ).join('\n');
    
    return highlightedCode;
}

/**
 * Escape HTML special characters
 * @param {string} html - The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(html) {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
