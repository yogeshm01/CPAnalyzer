/**
 * CP Assistant - Utility Functions
 * Common utility functions used across the application
 */

/**
 * Format a date to a readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (optional)
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * Calculate the difference between two dates in days
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Difference in days
 */
function dateDiffInDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    // Convert to UTC to avoid DST issues
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    // Convert milliseconds to days
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Get a random item from an array
 * @param {Array} array - The array to pick from
 * @returns {*} A random item from the array
 */
function getRandomItem(array) {
    if (!array || array.length === 0) {
        return null;
    }
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Debounce a function to limit how often it can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} The debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    
    return function(...args) {
        const context = this;
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Throttle a function to limit how often it can be called
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function
 */
function throttle(func, limit = 300) {
    let lastCall = 0;
    
    return function(...args) {
        const now = Date.now();
        
        if (now - lastCall >= limit) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

/**
 * Generate a random ID
 * @param {number} length - The length of the ID (default: 8)
 * @returns {string} A random ID
 */
function generateId(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return id;
}

/**
 * Safely parse JSON with error handling
 * @param {string} json - The JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} The parsed object or fallback value
 */
function safeJsonParse(json, fallback = null) {
    try {
        return JSON.parse(json);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return fallback;
    }
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @param {string} suffix - The suffix to add to truncated strings
 * @returns {string} The truncated string
 */
function truncateString(str, length = 50, suffix = '...') {
    if (!str) return '';
    
    if (str.length <= length) {
        return str;
    }
    
    return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} Whether the copy was successful
 */
function copyToClipboard(text) {
    // Modern approach using the Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(error => {
                console.error('Failed to copy to clipboard:', error);
                return false;
            });
    } 
    
    // Fallback for older browsers
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve(true);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return Promise.resolve(false);
    }
}
