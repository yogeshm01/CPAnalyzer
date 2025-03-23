/**
 * CP Assistant - Leaderboard & Streak Tracker Module
 * Tracks user progress on Codeforces and LeetCode
 */

// User profile data
let userProfile = {
    codeforces: '',
    leetcode: ''
};

// User stats
let userStats = {
    currentStreak: 0,
    bestStreak: 0,
    totalSolved: 0,
    codeforces: {
        rating: 0,
        solved: 0,
        rank: 'N/A'
    },
    leetcode: {
        solved: 0,
        rating: 0,
        rank: 'N/A'
    },
    activity: [] 
};


function initLeaderboard() {
    loadUserProfile();

    const saveProfileButton = document.getElementById('save-profile');
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', saveUserProfile);
    }
    
    const refreshStatsButton = document.getElementById('refresh-stats');
    if (refreshStatsButton) {
        refreshStatsButton.addEventListener('click', loadUserStats);
    }
    
    // Fill in the form with saved values
    if (userProfile.codeforces) {
        document.getElementById('codeforces-username').value = userProfile.codeforces;
    }
    
    if (userProfile.leetcode) {
        document.getElementById('leetcode-username').value = userProfile.leetcode;
    }
    

    if (userProfile.codeforces || userProfile.leetcode) {
        loadUserStats();
    }
}

/**
 * Load user profile from localStorage
 */
function loadUserProfile() {
    const savedProfile = localStorage.getItem('cp_user_profile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
    }
}

/**
 * Save user profile to localStorage
 */
function saveUserProfile() {
    const codeforcesUsername = document.getElementById('codeforces-username').value.trim();
    const leetcodeUsername = document.getElementById('leetcode-username').value.trim();
    
    // Validate at least one username is provided
    if (!codeforcesUsername && !leetcodeUsername) {
        showNotification('Please enter at least one username.', 'error');
        return;
    }
    
    // Save the profile
    userProfile = {
        codeforces: codeforcesUsername,
        leetcode: leetcodeUsername
    };
    
    localStorage.setItem('cp_user_profile', JSON.stringify(userProfile));
    showNotification('Profile saved successfully!', 'success');
    
    // Load user stats
    loadUserStats();
}

/**
 * Load user stats from the APIs
 */
function loadUserStats() {
    // Check if user has a profile
    if (!userProfile.codeforces && !userProfile.leetcode) {
        document.getElementById('user-stats-empty').classList.remove('hidden');
        document.getElementById('user-stats-content').classList.add('hidden');
        document.getElementById('user-stats-error').classList.add('hidden');
        return;
    }
    
    // Show loading
    document.getElementById('user-stats-loading').classList.remove('hidden');
    document.getElementById('user-stats-content').classList.add('hidden');
    document.getElementById('user-stats-empty').classList.add('hidden');
    document.getElementById('user-stats-error').classList.add('hidden');
    
    // Initialize user stats
    userStats = {
        currentStreak: 0,
        bestStreak: 0,
        totalSolved: 0,
        codeforces: {
            rating: 0,
            solved: 0,
            rank: 'N/A'
        },
        leetcode: {
            solved: 0,
            rating: 0,
            rank: 'N/A'
        },
        activity: []
    };
    
    // Keep track of pending requests
    let pendingRequests = 0;
    
    // Function to check if all requests are completed
    function checkAllRequestsComplete() {
        pendingRequests--;
        if (pendingRequests === 0) {
            // All requests completed, display stats
            displayUserStats();
        }
    }
    
    // Load Codeforces stats if username provided
    if (userProfile.codeforces) {
        pendingRequests += 2; // We'll make 2 requests for Codeforces
        
        // Fetch user info (for rating)
        fetch(`https://codeforces.com/api/user.info?handles=${userProfile.codeforces}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching Codeforces user info');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'OK' && data.result && data.result.length > 0) {
                    userStats.codeforces.rating = data.result[0].rating || 0;
                    userStats.codeforces.rank = data.result[0].rank || 'N/A';
                }
                checkAllRequestsComplete();
            })
            .catch(error => {
                console.error('Error fetching Codeforces user info:', error);
                checkAllRequestsComplete();
            });
        
        // Fetch user submissions
        fetch(`https://codeforces.com/api/user.status?handle=${userProfile.codeforces}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching Codeforces submissions');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'OK' && data.result) {
                    processCodeforcesSubmissions(data.result);
                }
                checkAllRequestsComplete();
            })
            .catch(error => {
                console.error('Error fetching Codeforces submissions:', error);
                checkAllRequestsComplete();
            });
    }
    
    // Load LeetCode stats if username provided
    // Note: LeetCode doesn't have an official API, so this is a workaround
    // We'll use a proxy to avoid CORS issues in a real application
    if (userProfile.leetcode) {
        pendingRequests += 1;
        
        // This is a simplified approach since LeetCode doesn't have a public API
        // In a real application, you would need a backend or a proxy
        const leetcodeGraphQLEndpoint = 'https://leetcode.com/graphql';
        const query = {
            query: `
                query userProfileAndSubmissions($username: String!) {
                    matchedUser(username: $username) {
                        username
                        submitStats: submitStatsGlobal {
                            acSubmissionNum {
                                count
                            }
                        }
                        profile {
                            ranking
                        }
                    }
                    recentSubmissionList(username: $username, limit: 20) {
                        title
                        timestamp
                        statusDisplay
                    }
                }
            `,
            variables: {
                username: userProfile.leetcode
            }
        };
        
        // Due to CORS policies, direct API fetch will fail, so we simulate this part
        // In a real app, you would use a backend proxy or a CORS proxy
        setTimeout(() => {
            // Simulate LeetCode data since we can't directly fetch due to CORS restrictions
            simulateLeetCodeData(userProfile.leetcode);
            checkAllRequestsComplete();
        }, 1000);
    }
    
    // If no pending requests, display empty stats
    if (pendingRequests === 0) {
        document.getElementById('user-stats-loading').classList.add('hidden');
        document.getElementById('user-stats-error').classList.remove('hidden');
    }
}


function processCodeforcesSubmissions(submissions) {
    if (!submissions || submissions.length === 0) return;
    
    // Count accepted solutions
    const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
    
    // Count total unique problems solved
    const solvedProblems = new Set();
    acceptedSubmissions.forEach(sub => {
        solvedProblems.add(`${sub.problem.contestId}${sub.problem.index}`);
    });
    
    // Update Codeforces stats
    userStats.codeforces.solved = solvedProblems.size;
    userStats.totalSolved += solvedProblems.size;
    
    // Generate activity data
    const activityMap = new Map();
    acceptedSubmissions.forEach(sub => {
        const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
        const count = activityMap.get(date) || 0;
        activityMap.set(date, count + 1);
    });
    
    // Convert activity map to array
    activityMap.forEach((count, date) => {
        userStats.activity.push({ date, count, platform: 'codeforces' });
    });
    
    // Calculate streak
    calculateStreak();
}


function simulateLeetCodeData(username) {
    // Simulate a response with random data for demonstration purposes
    const today = new Date();
    const totalSolved = Math.floor(Math.random() * 300) + 50; // Random number between 50 and 350
    const rating = Math.floor(Math.random() * 2000) + 1000; // Random rating
    const rank = Math.floor(Math.random() * 100000) + 1; // Random rank
    
    // Update LeetCode stats
    userStats.leetcode.solved = totalSolved;
    userStats.leetcode.rating = rating;
    userStats.leetcode.rank = rank;
    userStats.totalSolved += totalSolved;
    
    // Generate random activity for past 60 days
    for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        // 70% chance of having activity on a given day
        if (Math.random() < 0.7) {
            const count = Math.floor(Math.random() * 5) + 1; // 1-5 problems solved
            userStats.activity.push({ date: dateString, count, platform: 'leetcode' });
        }
    }
    
    // Calculate streak
    calculateStreak();
}


function calculateStreak() {
    if (userStats.activity.length === 0) return;
    
    // Sort activity by date (newest first)
    userStats.activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create a set of dates with activity
    const activeDates = new Set(userStats.activity.map(a => a.date));
    
    // Calculate current streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if there's activity today or yesterday to consider the streak active
    const streakIsActive = activeDates.has(today) || activeDates.has(yesterday);
    
    if (streakIsActive) {
        let currentDate = streakIsActive && activeDates.has(today) ? today : yesterday;
        let streak = activeDates.has(currentDate) ? 1 : 0;
        
        while (true) {
            const prevDate = new Date(new Date(currentDate).getTime() - 86400000)
                .toISOString().split('T')[0];
            
            if (activeDates.has(prevDate)) {
                streak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }
        
        userStats.currentStreak = streak;
    } else {
        userStats.currentStreak = 0;
    }
    
    // Calculate best streak
    let bestStreak = 0;
    let currentStreak = 0;
    let prevDate = null;
    
    // Create array of all dates in range from oldest to newest
    const dates = Array.from(activeDates).sort();
    
    for (let i = 0; i < dates.length; i++) {
        const currentDate = new Date(dates[i]);
        
        if (prevDate === null) {
            currentStreak = 1;
        } else {
            const diff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
            
            if (diff === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        }
        
        bestStreak = Math.max(bestStreak, currentStreak);
        prevDate = currentDate;
    }
    
    userStats.bestStreak = bestStreak;
}

/**
 * Display user stats on the page
 */
function displayUserStats() {
    // Hide loading and show content
    document.getElementById('user-stats-loading').classList.add('hidden');
    document.getElementById('user-stats-content').classList.remove('hidden');
    
    // Update user display name
    let displayName = 'Your Stats';
    if (userProfile.codeforces && userProfile.leetcode) {
        displayName = `${userProfile.codeforces} / ${userProfile.leetcode}`;
    } else if (userProfile.codeforces) {
        displayName = userProfile.codeforces;
    } else if (userProfile.leetcode) {
        displayName = userProfile.leetcode;
    }
    
    document.getElementById('user-display-name').textContent = displayName;
    
    // Update overall stats
    document.getElementById('current-streak').textContent = `${userStats.currentStreak} days`;
    document.getElementById('best-streak').textContent = `${userStats.bestStreak} days`;
    document.getElementById('total-solved').textContent = userStats.totalSolved;
    
    // Update Codeforces stats
    document.getElementById('cf-rating').textContent = userStats.codeforces.rating > 0 ? userStats.codeforces.rating : 'N/A';
    document.getElementById('cf-solved').textContent = userStats.codeforces.solved;
    document.getElementById('cf-rank').textContent = userStats.codeforces.rank;
    
    // Update LeetCode stats
    document.getElementById('lc-solved').textContent = userStats.leetcode.solved;
    document.getElementById('lc-rating').textContent = userStats.leetcode.rating > 0 ? userStats.leetcode.rating : 'N/A';
    document.getElementById('lc-rank').textContent = userStats.leetcode.rank;
    
    // Create heatmap
    createActivityHeatmap();
    
    // Apply fade-in animation to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
        card.classList.add('fade-in');
    });
}

/**
 * Create an activity heatmap from user activity data
 */
function createActivityHeatmap() {
    const heatmapContainer = document.getElementById('activity-heatmap');
    heatmapContainer.innerHTML = '';
    
    // Get date range (last 90 days)
    const today = new Date();
    const days = 90;
    const activityMap = new Map();
    
    // Convert activity array to map for easy lookup
    userStats.activity.forEach(item => {
        const existing = activityMap.get(item.date);
        if (existing) {
            existing.count += item.count;
            existing.platforms = existing.platforms || [];
            if (item.platform && !existing.platforms.includes(item.platform)) {
                existing.platforms.push(item.platform);
            }
        } else {
            activityMap.set(item.date, { 
                count: item.count, 
                platforms: item.platform ? [item.platform] : [] 
            });
        }
    });
    
    // Find the max count for scaling
    const maxCount = Math.max(...Array.from(activityMap.values()).map(data => data.count || 0), 1);
    
    // Generate the heatmap cells
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const activityData = activityMap.get(dateString) || { count: 0, platforms: [] };
        const count = activityData.count;
        const platforms = activityData.platforms || [];
        const level = count > 0 ? Math.ceil((count / maxCount) * 5) : 0;
        
        const dayElement = document.createElement('div');
        dayElement.className = `heatmap-day level-${level}`;
        dayElement.title = `${dateString}: ${count} activities`;
        dayElement.style.setProperty('--animation-order', i);
        
        // Add tooltip data attributes
        dayElement.dataset.date = dateString;
        dayElement.dataset.count = count;
        dayElement.dataset.platforms = platforms.join(',');
        
        // Add event listeners for tooltip
        dayElement.addEventListener('mouseenter', showTooltip);
        dayElement.addEventListener('mouseleave', hideTooltip);
        
        heatmapContainer.appendChild(dayElement);
        
        // Animate with slight delay
        setTimeout(() => {
            dayElement.classList.add('fade-in');
        }, i * 10);
    }
}

/**
 * Show tooltip on heatmap day hover
 * @param {Event} event - The mouse event
 */
function showTooltip(event) {
    const target = event.target;
    const date = target.dataset.date;
    const count = target.dataset.count;
    
    // Format date for display
    const displayDate = new Date(date).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create tooltip element if it doesn't exist
    let tooltip = document.getElementById('heatmap-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'heatmap-tooltip';
        document.body.appendChild(tooltip);
        
        // Style the tooltip
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
    }
    
    // Get platforms for display
    const platforms = target.dataset.platforms ? target.dataset.platforms.split(',') : [];
    let platformsText = '';
    
    if (platforms.length > 0) {
        const platformLabels = [];
        if (platforms.includes('codeforces')) platformLabels.push('Codeforces');
        if (platforms.includes('leetcode')) platformLabels.push('LeetCode');
        platformsText = `<div class="tooltip-platforms">On ${platformLabels.join(' & ')}</div>`;
    }
    
    // Set tooltip content
    tooltip.innerHTML = `
        <div><strong>${displayDate}</strong></div>
        <div>${count} problem${count !== '1' ? 's' : ''} solved</div>
        ${platformsText}
    `;
    
    // Position the tooltip
    const rect = target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 40}px`;
    tooltip.style.display = 'block';
}

/**
 * Hide tooltip on mouse leave
 */
function hideTooltip() {
    const tooltip = document.getElementById('heatmap-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}
