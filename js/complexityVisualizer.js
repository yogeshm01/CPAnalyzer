/**
 * CP Assistant - Complexity Visualizer Module
 * Analyzes code to estimate its time complexity using regex patterns
 */

/**
 * Initialize the Complexity Visualizer component
 */
function initComplexityVisualizer() {
    const analyzeButton = document.getElementById('analyze-complexity');
    const languageSelect = document.getElementById('complexity-language');
    const codeInput = document.getElementById('complexity-code');
    
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzeComplexity);
    }
    
    if (languageSelect && codeInput) {
        // Update placeholder based on selected language
        languageSelect.addEventListener('change', updateCodePlaceholder);
        
        // Initialize with the default language placeholder
        updateCodePlaceholder();
    }
}

/**
 * Update the code textarea placeholder based on the selected language
 */
function updateCodePlaceholder() {
    const languageSelect = document.getElementById('complexity-language');
    const codeInput = document.getElementById('complexity-code');
    
    if (!languageSelect || !codeInput) return;
    
    const language = languageSelect.value;
    
    const placeholders = {
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
}`
    };
    
    codeInput.placeholder = placeholders[language] || placeholders.javascript;
}

/**
 * Analyze the code complexity
 */
function analyzeComplexity() {
    // Get the code from textarea
    const codeInput = document.getElementById('complexity-code');
    const code = codeInput.value.trim();
    
    // Get the selected language
    const languageSelect = document.getElementById('complexity-language');
    const language = languageSelect ? languageSelect.value : 'javascript';
    
    // Validate input
    if (!code) {
        showNotification('Please enter some code to analyze.', 'error');
        return;
    }
    
    // Show loading
    document.getElementById('complexity-loading').classList.remove('hidden');
    document.getElementById('complexity-display').innerHTML = '';
    document.getElementById('complexity-visualization').classList.add('hidden');
    
    // Simulate a small delay for analysis (for UX purposes)
    setTimeout(() => {
        // Analyze the code to determine complexity
        const complexityResult = determineComplexity(code, language);
        
        // Display the result
        displayComplexityResult(complexityResult);
        
        // Hide loading
        document.getElementById('complexity-loading').classList.add('hidden');
    }, 800);
}

/**
 * Determine the time complexity of the code
 * @param {string} code - The code to analyze
 * @param {string} language - The programming language of the code
 * @returns {Object} The complexity result object
 */
function determineComplexity(code, language = 'javascript') {
    // Default to unknown complexity
    let complexity = {
        type: 'unknown',
        display: 'Unknown',
        description: 'Could not determine the complexity of this code.',
        details: 'The code pattern doesn\'t match known complexity patterns.',
        cssClass: 'other'
    };
    
    // Clean code and prepare regex patterns based on language
    let cleanCode = code;
    let nestedLoopRegex, tripleNestedLoopRegex, singleLoopRegex, logarithmicRegex, nLogNRegex;
    
    switch(language) {
        case 'javascript':
            // Remove comments and string literals to simplify analysis
            cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'[^']*'|"[^"]*"/g, '');
            
            // Check for nested loops - O(n^2) or higher
            nestedLoopRegex = /for\s*\([^{]*\)\s*{[^}]*for\s*\([^{]*\)/;
            tripleNestedLoopRegex = /for\s*\([^{]*\)\s*{[^}]*for\s*\([^{]*\)[^}]*{[^}]*for\s*\([^{]*\)/;
            
            // Check for single loops - O(n)
            singleLoopRegex = /for\s*\([^{]*\)|while\s*\([^{]*\)/;
            
            // Check for logarithmic patterns - O(log n)
            logarithmicRegex = /\/=\s*2|>>=\s*1|\/=\s*10|\*=\s*0\.5|\/\s*2\s*;|\*\s*0\.5\s*;|\/\s*10\s*;/;
            
            // Check for n log n patterns (often in sorting algorithms)
            nLogNRegex = /(quicksort|mergesort|sort\s*\(|heapsort|divide\s*and\s*conquer)/i;
            break;
        
        case 'python':
            // Remove comments and string literals to simplify analysis
            cleanCode = code.replace(/#.*|'''[\s\S]*?'''|"""[\s\S]*?"""|'[^']*'|"[^"]*"/g, '');
            
            // Check for nested loops - O(n^2) or higher
            nestedLoopRegex = /for\s+[^\:]*\:[\s\S]*?for\s+[^\:]*\:/;
            tripleNestedLoopRegex = /for\s+[^\:]*\:[\s\S]*?for\s+[^\:]*\:[\s\S]*?for\s+[^\:]*\:/;
            
            // Check for single loops - O(n)
            singleLoopRegex = /for\s+[^\:]*\:|while\s+[^\:]*\:/;
            
            // Check for logarithmic patterns - O(log n)
            logarithmicRegex = /\/\/=\s*2|>>=\s*1|\/\/=\s*10|\*=\s*0\.5|\/\/\s*2|\/\/\s*10/;
            
            // Check for n log n patterns (often in sorting algorithms)
            nLogNRegex = /(quicksort|mergesort|sort\s*\(|heapsort|divide\s*and\s*conquer)/i;
            break;
        
        case 'cpp':
            // Remove comments and string literals to simplify analysis
            cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'[^']*'|"[^"]*"/g, '');
            
            // Check for nested loops - O(n^2) or higher
            nestedLoopRegex = /for\s*\([^{]*\)\s*{[\s\S]*?for\s*\([^{]*\)/;
            tripleNestedLoopRegex = /for\s*\([^{]*\)\s*{[\s\S]*?for\s*\([^{]*\)[\s\S]*?{[\s\S]*?for\s*\([^{]*\)/;
            
            // Check for single loops - O(n)
            singleLoopRegex = /for\s*\([^{]*\)|while\s*\([^{]*\)/;
            
            // Check for logarithmic patterns - O(log n)
            logarithmicRegex = /\/=\s*2|>>=\s*1|\/=\s*10|\*=\s*0\.5|\/\s*2\s*;|\*\s*0\.5\s*;|\/\s*10\s*;/;
            
            // Check for n log n patterns (often in sorting algorithms)
            nLogNRegex = /(quicksort|mergesort|sort\s*\(|heapsort|divide\s*and\s*conquer)/i;
            break;
            
        case 'java':
            // Remove comments and string literals to simplify analysis
            cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'[^']*'|"[^"]*"/g, '');
            
            // Check for nested loops - O(n^2) or higher
            nestedLoopRegex = /for\s*\([^{]*\)\s*{[\s\S]*?for\s*\([^{]*\)/;
            tripleNestedLoopRegex = /for\s*\([^{]*\)\s*{[\s\S]*?for\s*\([^{]*\)[\s\S]*?{[\s\S]*?for\s*\([^{]*\)/;
            
            // Check for single loops - O(n)
            singleLoopRegex = /for\s*\([^{]*\)|while\s*\([^{]*\)/;
            
            // Check for logarithmic patterns - O(log n)
            logarithmicRegex = /\/=\s*2|>>=\s*1|\/=\s*10|\*=\s*0\.5|\/\s*2\s*;|\*\s*0\.5\s*;|\/\s*10\s*;/;
            
            // Check for n log n patterns (often in sorting algorithms)
            nLogNRegex = /(quicksort|mergesort|sort|heapsort|divide\s*and\s*conquer)/i;
            break;
            
        default:
            // Default to JavaScript patterns if unsupported language
            cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'[^']*'|"[^"]*"/g, '');
            nestedLoopRegex = /for\s*\([^{]*\)\s*{[^}]*for\s*\([^{]*\)/;
            tripleNestedLoopRegex = /for\s*\([^{]*\)\s*{[^}]*for\s*\([^{]*\)[^}]*{[^}]*for\s*\([^{]*\)/;
            singleLoopRegex = /for\s*\([^{]*\)|while\s*\([^{]*\)/;
            logarithmicRegex = /\/=\s*2|>>=\s*1|\/=\s*10|\*=\s*0\.5|\/\s*2\s*;|\*\s*0\.5\s*;|\/\s*10\s*;/;
            nLogNRegex = /(quicksort|mergesort|sort\s*\(|heapsort|divide\s*and\s*conquer)/i;
    }
    
    // Make the determination based on regex matches
    if (tripleNestedLoopRegex && tripleNestedLoopRegex.test(cleanCode)) {
        complexity = {
            type: 'O(n^3)',
            display: 'O(n³)',
            description: 'Cubic Time Complexity',
            details: `The code contains three nested loops, resulting in a cubic time complexity. This means if the input size doubles, the running time will increase by approximately 8 times.`,
            cssClass: 'on2' // Reusing the on2 class for styling
        };
    } else if (nestedLoopRegex && nestedLoopRegex.test(cleanCode)) {
        complexity = {
            type: 'O(n^2)',
            display: 'O(n²)',
            description: 'Quadratic Time Complexity',
            details: `The code contains nested loops, resulting in a quadratic time complexity. This means if the input size doubles, the running time will increase by approximately 4 times.`,
            cssClass: 'on2'
        };
    } else if (nLogNRegex && nLogNRegex.test(cleanCode)) {
        complexity = {
            type: 'O(n log n)',
            display: 'O(n log n)',
            description: 'Linearithmic Time Complexity',
            details: `The code appears to use a divide-and-conquer or sorting algorithm, resulting in a linearithmic time complexity. This is common in efficient sorting algorithms like merge sort and quicksort.`,
            cssClass: 'onlogn'
        };
    } else if (singleLoopRegex && singleLoopRegex.test(cleanCode)) {
        if (logarithmicRegex && logarithmicRegex.test(cleanCode)) {
            complexity = {
                type: 'O(log n)',
                display: 'O(log n)',
                description: 'Logarithmic Time Complexity',
                details: `The code contains a loop with a pattern of dividing by a constant in each iteration, resulting in logarithmic time complexity. This is common in binary search algorithms.`,
                cssClass: 'ologn'
            };
        } else {
            complexity = {
                type: 'O(n)',
                display: 'O(n)',
                description: 'Linear Time Complexity',
                details: `The code contains a single loop that iterates through the input, resulting in linear time complexity. This means the running time grows linearly with the input size.`,
                cssClass: 'on'
            };
        }
    } else if (logarithmicRegex && logarithmicRegex.test(cleanCode)) {
        complexity = {
            type: 'O(log n)',
            display: 'O(log n)',
            description: 'Logarithmic Time Complexity',
            details: `The code contains a pattern of dividing by a constant, resulting in logarithmic time complexity. This is common in binary search algorithms.`,
            cssClass: 'ologn'
        };
    } else {
        // Check if the code has any control structures
        let controlStructureRegex;
        
        switch(language) {
            case 'python':
                controlStructureRegex = /for|while|if|elif|else|def|class|with|try|except/;
                break;
            case 'cpp':
            case 'java':
                controlStructureRegex = /for|while|if|else|switch|case|class|try|catch|throw/;
                break;
            default: // javascript
                controlStructureRegex = /for|while|if|else|\?|:|switch|case|try|catch|throw/;
        }
        
        if (!controlStructureRegex.test(cleanCode)) {
            // If no control structures are found, it might be constant time
            complexity = {
                type: 'O(1)',
                display: 'O(1)',
                description: 'Constant Time Complexity',
                details: `The code has no loops or recursive calls, resulting in constant time complexity. This means the running time doesn't depend on the input size.`,
                cssClass: 'o1'
            };
        }
    }
    
    return complexity;
}

/**
 * Display the complexity result on the page
 * @param {Object} complexity - The complexity result object
 */
function displayComplexityResult(complexity) {
    const displayElement = document.getElementById('complexity-display');
    const visualizationElement = document.getElementById('complexity-visualization');
    
    // Generate the display HTML
    displayElement.innerHTML = `
        <div class="complexity-result-card">
            <div class="complexity-badge ${complexity.cssClass}">${complexity.display}</div>
            <h4>${complexity.description}</h4>
            <p>${complexity.details}</p>
        </div>
    `;
    
    // Set up the visualization
    visualizationElement.classList.remove('hidden');
    const graphLine = visualizationElement.querySelector('.graph-line');
    
    // Remove existing animation classes
    graphLine.className = 'graph-line';
    
    // Add the appropriate animation class
    graphLine.classList.add(`${complexity.cssClass}-animation`);
    
    // Update the explanation based on complexity
    const explanationElement = visualizationElement.querySelector('.complexity-explanation');
    explanationElement.innerHTML = getComplexityExplanation(complexity.type);
}

/**
 * Get a detailed explanation for a given complexity type
 * @param {string} type - The complexity type
 * @returns {string} HTML explanation content
 */
function getComplexityExplanation(type) {
    // Get the selected language for examples
    const languageSelect = document.getElementById('complexity-language');
    const language = languageSelect ? languageSelect.value : 'javascript';
    
    // Define language-specific code examples
    const codeExamples = {
        'O(1)': {
            javascript: `function constantTime(arr) {
    return arr[0]; // O(1) - direct access
}`,
            python: `def constant_time(arr):
    return arr[0]  # O(1) - direct access`,
            cpp: `int constantTime(vector<int>& arr) {
    return arr[0]; // O(1) - direct access
}`,
            java: `int constantTime(int[] arr) {
    return arr[0]; // O(1) - direct access
}`
        },
        'O(log n)': {
            javascript: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}`,
            python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1`,
            cpp: `int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}`,
            java: `int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}`
        },
        'O(n)': {
            javascript: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}`,
            python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
            cpp: `int linearSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
            java: `int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
        },
        'O(n log n)': {
            javascript: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    let result = [], leftIdx = 0, rightIdx = 0;
    
    while (leftIdx < left.length && rightIdx < right.length) {
        if (left[leftIdx] < right[rightIdx]) {
            result.push(left[leftIdx]);
            leftIdx++;
        } else {
            result.push(right[rightIdx]);
            rightIdx++;
        }
    }
    
    return result.concat(left.slice(leftIdx)).concat(right.slice(rightIdx));
}`,
            python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
            
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
            cpp: `void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> leftArr(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);
    
    int i = 0, j = 0, k = left;
    while (i < leftArr.size() && j < rightArr.size()) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        k++;
    }
    
    while (i < leftArr.size()) {
        arr[k] = leftArr[i];
        i++;
        k++;
    }
    
    while (j < rightArr.size()) {
        arr[k] = rightArr[j];
        j++;
        k++;
    }
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        merge(arr, left, mid, right);
    }
}`,
            java: `void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    int L[] = new int[n1];
    int R[] = new int[n2];
    
    for (int i = 0; i < n1; ++i)
        L[i] = arr[left + i];
    for (int j = 0; j < n2; ++j)
        R[j] = arr[mid + 1 + j];
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }
    
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
}

void mergeSort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        merge(arr, left, mid, right);
    }
}`
        },
        'O(n^2)': {
            javascript: `function bubbleSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    
    return arr;
}`,
            python: `def bubble_sort(arr):
    n = len(arr)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                
    return arr`,
            cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
            java: `void bubbleSort(int arr[]) {
    int n = arr.length;
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`
        },
        'O(n^3)': {
            javascript: `function naiveMatrixMultiply(A, B) {
    const n = A.length;
    let C = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    return C;
}`,
            python: `def naive_matrix_multiply(A, B):
    n = len(A)
    C = [[0 for _ in range(n)] for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]
                
    return C`,
            cpp: `vector<vector<int>> naiveMatrixMultiply(vector<vector<int>>& A, vector<vector<int>>& B) {
    int n = A.size();
    vector<vector<int>> C(n, vector<int>(n, 0));
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            for (int k = 0; k < n; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    return C;
}`,
            java: `int[][] naiveMatrixMultiply(int[][] A, int[][] B) {
    int n = A.length;
    int[][] C = new int[n][n];
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            for (int k = 0; k < n; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    return C;
}`
        }
    };
    
    // Get example code for the selected language
    const example = codeExamples[type] ? codeExamples[type][language] || codeExamples[type].javascript : null;
    
    // Basic explanations
    const explanations = {
        'O(1)': `
            <h4>Constant Time - O(1)</h4>
            <p>Constant time algorithms perform the same number of operations regardless of the input size. These are the most efficient algorithms.</p>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>Array access by index</li>
                <li>Simple arithmetic operations</li>
                <li>Hash map lookups (in the average case)</li>
            </ul>
        `,
        'O(log n)': `
            <h4>Logarithmic Time - O(log n)</h4>
            <p>Logarithmic time algorithms reduce the problem size by a constant factor in each step. They're very efficient, especially for large inputs.</p>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>Binary search</li>
                <li>Operations in balanced binary search trees</li>
                <li>Finding exponents using repeated squaring</li>
            </ul>
        `,
        'O(n)': `
            <h4>Linear Time - O(n)</h4>
            <p>Linear time algorithms have a runtime that is directly proportional to the input size. They typically process each input element once.</p>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>Linear search</li>
                <li>Traversing arrays or linked lists</li>
                <li>Finding maximum/minimum in an unsorted array</li>
            </ul>
        `,
        'O(n log n)': `
            <h4>Linearithmic Time - O(n log n)</h4>
            <p>Linearithmic time algorithms are often divide-and-conquer algorithms that split the input, solve the subproblems, and combine the results.</p>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>Merge sort</li>
                <li>Quick sort (average case)</li>
                <li>Heap sort</li>
            </ul>
        `,
        'O(n^2)': `
            <h4>Quadratic Time - O(n²)</h4>
            <p>Quadratic time algorithms often involve nested loops, where each loop iterates through the input. They can be inefficient for large inputs.</p>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>Bubble sort</li>
                <li>Insertion sort</li>
                <li>Simple matrix multiplication</li>
            </ul>
        `,
        'O(n^3)': `
            <h4>Cubic Time - O(n³)</h4>
            <p>Cubic time algorithms often involve triply nested loops. They can be very inefficient for large inputs.</p>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>Naive matrix multiplication</li>
                <li>Some dynamic programming solutions</li>
                <li>Floyd-Warshall algorithm for all-pairs shortest paths</li>
            </ul>
        `,
        'unknown': `
            <h4>Unknown Complexity</h4>
            <p>The complexity of this code could not be determined automatically. Consider the following:</p>
            <ul>
                <li>Check for nested loops and recursive calls</li>
                <li>Look for divide-and-conquer patterns</li>
                <li>Analyze how the runtime changes as the input size increases</li>
            </ul>
        `
    };
    
    // Combine the explanation with the code example if available
    let result = explanations[type] || explanations['unknown'];
    
    if (example) {
        result += `
            <div class="code-example">
                <h4>Example Code (${language}):</h4>
                <pre class="code-block">${example}</pre>
            </div>
        `;
    }
    
    return result;
}
