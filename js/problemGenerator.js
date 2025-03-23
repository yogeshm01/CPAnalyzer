/**
 * CP Assistant - Problem Generator Module
 * Fetches random problems from Codeforces and manages problem history
 */

// Store problems history in localStorage
let problemsHistory = [];

/**
 * Initialize the Problem Generator component
 */
function initProblemGenerator() {
    // Load problem history from localStorage
    loadProblemHistory();
    
    // Set up event listeners
    const generateButton = document.getElementById('generate-problem');
    if (generateButton) {
        generateButton.addEventListener('click', generateRandomProblem);
    }
    
    const markSolvedButton = document.getElementById('mark-solved');
    if (markSolvedButton) {
        markSolvedButton.addEventListener('click', () => markCurrentProblem('solved'));
    }
    
    const markPendingButton = document.getElementById('mark-pending');
    if (markPendingButton) {
        markPendingButton.addEventListener('click', () => markCurrentProblem('pending'));
    }
    
    // Set up tab filters for problem history
    const tabButtons = document.querySelectorAll('.problem-history .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            displayProblemHistory(filter);
        });
    });
    
    // Generate a problem automatically if no problems in history
    if (problemsHistory.length === 0) {
        generateRandomProblem();
    } else {
        // Display the history
        displayProblemHistory('all');
    }
}

/**
 * Load problem history from localStorage
 */
function loadProblemHistory() {
    const savedHistory = localStorage.getItem('cp_problem_history');
    if (savedHistory) {
        problemsHistory = JSON.parse(savedHistory);
    }
}

/**
 * Save problem history to localStorage
 */
function saveProblemHistory() {
    localStorage.setItem('cp_problem_history', JSON.stringify(problemsHistory));
}

/**
 * Generate a random problem based on selected platform and difficulty
 */
function generateRandomProblem() {
    // Show loading indicator
    document.getElementById('problem-loading').classList.remove('hidden');
    document.getElementById('problem-content').classList.add('hidden');
    document.getElementById('problem-error').classList.add('hidden');
    
    // Get selected platform and difficulty
    const platform = document.getElementById('platform-select').value;
    const difficulty = document.getElementById('difficulty-select').value;
    
    if (platform === 'codeforces') {
        generateCodeforcesProblem(difficulty);
    } else if (platform === 'leetcode') {
        generateLeetCodeProblem(difficulty);
    }
}

/**
 * Generate a random problem from Codeforces with optional difficulty filtering
 * @param {string} difficulty - The difficulty level ('any', 'easy', 'medium', 'hard')
 */
function generateCodeforcesProblem(difficulty) {
    // Fetch a random problem from Codeforces API
    fetch('https://codeforces.com/api/problemset.problems')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'OK' && data.result.problems && data.result.problems.length > 0) {
                // Filter problems by difficulty if needed
                let filteredProblems = data.result.problems;
                
                if (difficulty !== 'any' && difficulty !== '') {
                    filteredProblems = filteredProblems.filter(problem => {
                        if (!problem.rating) return false;
                        
                        if (difficulty === 'easy') {
                            return problem.rating < 1400;
                        } else if (difficulty === 'medium') {
                            return problem.rating >= 1400 && problem.rating < 1900;
                        } else if (difficulty === 'hard') {
                            return problem.rating >= 1900;
                        }
                        
                        return true;
                    });
                }
                
                // If no problems match the filter, show an error
                if (filteredProblems.length === 0) {
                    throw new Error(`No ${difficulty} problems found on Codeforces`);
                }
                
                // Get a random problem
                const randomIndex = Math.floor(Math.random() * filteredProblems.length);
                const problem = filteredProblems[randomIndex];
                problem.platform = 'codeforces';
                
                // Display the problem
                displayProblem(problem);
            } else {
                throw new Error('No problems found in the response');
            }
        })
        .catch(error => {
            console.error('Error fetching problem:', error);
            document.getElementById('problem-loading').classList.add('hidden');
            document.getElementById('problem-error').classList.remove('hidden');
            document.getElementById('problem-error').querySelector('p').textContent = 
                `Failed to load problem: ${error.message}. Please try again later.`;
        });
}

/**
 * Generate a random problem from LeetCode (uses a simulated dataset since LeetCode lacks a public API)
 * @param {string} difficulty - The difficulty level ('any', 'easy', 'medium', 'hard')
 */
function generateLeetCodeProblem(difficulty) {
    // Simulate LeetCode problems (in a real app, you would use an API or backend)
    // This is just for demonstration purposes
    const leetcodeProblems = [
        {
            id: 1,
            title: "Two Sum",
            difficulty: "easy",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            link: "https://leetcode.com/problems/two-sum/"
        },
        {
            id: 53,
            title: "Maximum Subarray",
            difficulty: "medium",
            description: "Find the contiguous subarray which has the largest sum.",
            link: "https://leetcode.com/problems/maximum-subarray/"
        },
        {
            id: 42,
            title: "Trapping Rain Water",
            difficulty: "hard",
            description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
            link: "https://leetcode.com/problems/trapping-rain-water/"
        },
        {
            id: 20,
            title: "Valid Parentheses",
            difficulty: "easy",
            description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            link: "https://leetcode.com/problems/valid-parentheses/"
        },
        {
            id: 200,
            title: "Number of Islands",
            difficulty: "medium",
            description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
            link: "https://leetcode.com/problems/number-of-islands/"
        },
        {
            id: 23,
            title: "Merge k Sorted Lists",
            difficulty: "hard",
            description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
            link: "https://leetcode.com/problems/merge-k-sorted-lists/"
        },
        {
            id: 121,
            title: "Best Time to Buy and Sell Stock",
            difficulty: "easy",
            description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
            link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
        },
        {
            id: 146,
            title: "LRU Cache",
            difficulty: "medium",
            description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
            link: "https://leetcode.com/problems/lru-cache/"
        },
        {
            id: 10,
            title: "Regular Expression Matching",
            difficulty: "hard",
            description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' Matches any single character and '*' Matches zero or more of the preceding element.",
            link: "https://leetcode.com/problems/regular-expression-matching/"
        }
    ];
    
    // Filter by difficulty if needed
    let filteredProblems = leetcodeProblems;
    if (difficulty !== 'any' && difficulty !== '') {
        filteredProblems = leetcodeProblems.filter(problem => problem.difficulty === difficulty);
    }
    
    // If no problems match the filter, show an error
    if (filteredProblems.length === 0) {
        document.getElementById('problem-loading').classList.add('hidden');
        document.getElementById('problem-error').classList.remove('hidden');
        document.getElementById('problem-error').querySelector('p').textContent = 
            `No ${difficulty} problems found on LeetCode. Please try a different difficulty.`;
        return;
    }
    
    // Get a random problem
    const randomIndex = Math.floor(Math.random() * filteredProblems.length);
    const problem = filteredProblems[randomIndex];
    problem.platform = 'leetcode';
    
    // Add a slight delay to simulate API call
    setTimeout(() => {
        displayProblem(problem);
    }, 500);
}

/**
 * Display a problem on the page
 * @param {Object} problem - The problem object (from Codeforces API or LeetCode)
 */
function displayProblem(problem) {
    // Hide loading indicator
    document.getElementById('problem-loading').classList.add('hidden');
    
    if (problem.platform === 'codeforces') {
        displayCodeforcesProblem(problem);
    } else if (problem.platform === 'leetcode') {
        displayLeetCodeProblem(problem);
    }
    
    // Show the problem content with animation
    const problemContent = document.getElementById('problem-content');
    problemContent.classList.remove('hidden');
    problemContent.classList.add('fade-in');
}

/**
 * Display a Codeforces problem
 * @param {Object} problem - The problem object from Codeforces API
 */
function displayCodeforcesProblem(problem) {
    // Set problem details
    document.getElementById('problem-title').textContent = problem.name;
    document.getElementById('problem-id').textContent = `CF-${problem.contestId}${problem.index}`;
    
    // Set problem difficulty
    let difficultyClass = 'medium';
    let difficultyText = 'Medium';
    
    if (problem.rating) {
        if (problem.rating < 1400) {
            difficultyClass = 'easy';
            difficultyText = 'Easy';
        } else if (problem.rating >= 1900) {
            difficultyClass = 'hard';
            difficultyText = 'Hard';
        }
    }
    
    const difficultyElement = document.getElementById('problem-difficulty');
    difficultyElement.textContent = difficultyText;
    difficultyElement.className = `difficulty ${difficultyClass}`;
    
    // Set problem link
    const problemLink = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
    document.getElementById('problem-link').href = problemLink;
    
    // Set problem description
    const description = `Problem from Codeforces with tags: ${problem.tags.join(', ')}`;
    document.getElementById('problem-description').textContent = description;
    
    // Store current problem
    const currentProblem = {
        platform: 'codeforces',
        id: `CF-${problem.contestId}${problem.index}`,
        contestId: problem.contestId,
        index: problem.index,
        title: problem.name,
        difficulty: difficultyText,
        rating: problem.rating || 'Unknown',
        tags: problem.tags,
        link: problemLink,
        date: new Date().toISOString(),
        status: 'new'
    };
    
    // Save current problem to localStorage
    localStorage.setItem('cp_current_problem', JSON.stringify(currentProblem));
}

/**
 * Display a LeetCode problem
 * @param {Object} problem - The problem object from LeetCode
 */
function displayLeetCodeProblem(problem) {
    // Set problem details
    document.getElementById('problem-title').textContent = problem.title;
    document.getElementById('problem-id').textContent = `LC-${problem.id}`;
    
    // Set problem difficulty
    let difficultyClass = problem.difficulty;
    let difficultyText = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);
    
    const difficultyElement = document.getElementById('problem-difficulty');
    difficultyElement.textContent = difficultyText;
    difficultyElement.className = `difficulty ${difficultyClass}`;
    
    // Set problem link
    document.getElementById('problem-link').href = problem.link;
    
    // Set problem description
    document.getElementById('problem-description').textContent = problem.description;
    
    // Store current problem
    const currentProblem = {
        platform: 'leetcode',
        id: `LC-${problem.id}`,
        leetcodeId: problem.id,
        title: problem.title,
        difficulty: difficultyText,
        description: problem.description,
        link: problem.link,
        date: new Date().toISOString(),
        status: 'new'
    };
    
    // Save current problem to localStorage
    localStorage.setItem('cp_current_problem', JSON.stringify(currentProblem));
}

/**
 * Mark the current problem as solved or pending
 * @param {string} status - The status to set ('solved' or 'pending')
 */
function markCurrentProblem(status) {
    // Get current problem
    const currentProblemJson = localStorage.getItem('cp_current_problem');
    if (!currentProblemJson) {
        showNotification('No problem to mark. Generate a problem first.', 'error');
        return;
    }
    
    const currentProblem = JSON.parse(currentProblemJson);
    currentProblem.status = status;
    
    // Update the problem in history or add it if it doesn't exist
    const existingIndex = problemsHistory.findIndex(p => p.id === currentProblem.id);
    if (existingIndex >= 0) {
        problemsHistory[existingIndex] = currentProblem;
    } else {
        problemsHistory.push(currentProblem);
    }
    
    // Save to localStorage
    saveProblemHistory();
    
    // Update the UI
    displayProblemHistory('all');
    
    // Show notification
    const message = status === 'solved' 
        ? `Problem ${currentProblem.id} marked as solved!` 
        : `Problem ${currentProblem.id} marked as pending.`;
    const type = status === 'solved' ? 'success' : 'info';
    showNotification(message, type);
}

/**
 * Display the problem history based on filter
 * @param {string} filter - The filter to apply ('all', 'solved', or 'pending')
 */
function displayProblemHistory(filter) {
    const historyList = document.getElementById('problem-history-list');
    
    // Filter problems based on selection
    let filteredProblems = problemsHistory;
    if (filter === 'solved') {
        filteredProblems = problemsHistory.filter(p => p.status === 'solved');
    } else if (filter === 'pending') {
        filteredProblems = problemsHistory.filter(p => p.status === 'pending');
    }
    
    // Sort problems by date (newest first)
    filteredProblems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate the HTML
    if (filteredProblems.length === 0) {
        historyList.innerHTML = `
            <p class="empty-state">
                <i class="fas fa-info-circle"></i>
                No ${filter !== 'all' ? filter : ''} problems in your history yet.
            </p>
        `;
    } else {
        historyList.innerHTML = '';
        
        filteredProblems.forEach(problem => {
            const date = new Date(problem.date).toLocaleDateString();
            const problemElement = document.createElement('div');
            problemElement.className = 'problem-item';
            problemElement.innerHTML = `
                <div class="problem-item-info">
                    <div class="problem-item-title">
                        <span>${problem.title}</span>
                        <span class="status-badge ${problem.status}">${problem.status === 'solved' ? 'Solved' : 'Pending'}</span>
                    </div>
                    <div class="problem-item-meta">
                        ${problem.platform === 'leetcode' ? '<i class="fas fa-code"></i> LeetCode' : '<i class="fas fa-code"></i> Codeforces'} · 
                        ID: ${problem.id} · 
                        Difficulty: ${problem.difficulty || problem.rating} · 
                        Added: ${date}
                    </div>
                </div>
                <div class="problem-item-links">
                    <a href="${problem.link}" target="_blank" class="btn small outline">
                        <i class="fas fa-external-link-alt"></i> Open
                    </a>
                </div>
            `;
            historyList.appendChild(problemElement);
        });
    }
}
