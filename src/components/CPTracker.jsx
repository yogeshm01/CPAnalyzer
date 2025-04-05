"use client"

import { useState, useEffect } from "react"
import { useNotification } from "../context/NotificationContext"

const CPTracker = () => {
  const { showNotification } = useNotification()

  const [userProfile, setUserProfile] = useState({
    codeforces: "",
    leetcode: "",
  })

  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    totalSolved: 0,
    codeforces: {
      rating: 0,
      solved: 0,
      rank: "N/A",
    },
    leetcode: {
      solved: 0,
      rating: 0,
      rank: "N/A",
    },
    activity: [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)

  // Load user profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("cp_user_profile")
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setUserProfile(profile)

      if (profile.codeforces || profile.leetcode) {
        loadUserStats(profile)
      }
    }
  }, [])

  const saveUserProfile = () => {
    const codeforcesUsername = userProfile.codeforces.trim()
    const leetcodeUsername = userProfile.leetcode.trim()

    // Validate at least one username is provided
    if (!codeforcesUsername && !leetcodeUsername) {
      showNotification("Please enter at least one username.", "error")
      return
    }

    // Save the profile
    const profile = {
      codeforces: codeforcesUsername,
      leetcode: leetcodeUsername,
    }

    localStorage.setItem("cp_user_profile", JSON.stringify(profile))
    showNotification("Profile saved successfully!", "success")

    // Load user stats
    loadUserStats(profile)
  }

  const loadUserStats = (profile) => {
    // Check if user has a profile
    if (!profile.codeforces && !profile.leetcode) {
      setStatsVisible(false)
      setError(false)
      return
    }

    // Show loading
    setLoading(true)
    setError(false)

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Generate mock data
        const mockStats = generateMockStats(profile)
        setUserStats(mockStats)
        setStatsVisible(true)
        setLoading(false)
      } catch (error) {
        console.error("Error loading stats:", error)
        setError(true)
        setLoading(false)
      }
    }, 1000)
  }

  const generateMockStats = (profile) => {
    // Mock data generation for demonstration
    const stats = {
      currentStreak: Math.floor(Math.random() * 10) + 1,
      bestStreak: Math.floor(Math.random() * 30) + 10,
      totalSolved: 0,
      codeforces: {
        rating: 0,
        solved: 0,
        rank: "N/A",
      },
      leetcode: {
        solved: 0,
        rating: 0,
        rank: "N/A",
      },
      activity: [],
    }

    // Generate Codeforces stats if username provided
    if (profile.codeforces) {
      stats.codeforces = {
        rating: Math.floor(Math.random() * 1000) + 1000,
        solved: Math.floor(Math.random() * 200) + 50,
        rank: ["Newbie", "Pupil", "Specialist", "Expert", "Candidate Master"][Math.floor(Math.random() * 5)],
      }
      stats.totalSolved += stats.codeforces.solved
    }

    // Generate LeetCode stats if username provided
    if (profile.leetcode) {
      stats.leetcode = {
        solved: Math.floor(Math.random() * 300) + 50,
        rating: Math.floor(Math.random() * 2000) + 1000,
        rank: Math.floor(Math.random() * 100000) + 1,
      }
      stats.totalSolved += stats.leetcode.solved
    }

    // Generate activity data for the last 90 days
    const today = new Date()
    const activity = []

    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      // 70% chance of having activity on a given day
      if (Math.random() < 0.7) {
        const count = Math.floor(Math.random() * 5) + 1 // 1-5 problems solved
        const platform = Math.random() < 0.5 ? "codeforces" : "leetcode"
        activity.push({ date: dateString, count, platform })
      }
    }

    stats.activity = activity

    return stats
  }

  const createActivityHeatmap = () => {
    // Get date range (last 90 days)
    const today = new Date()
    const days = 90
    const activityMap = new Map()

    // Convert activity array to map for easy lookup
    userStats.activity.forEach((item) => {
      const existing = activityMap.get(item.date)
      if (existing) {
        existing.count += item.count
        existing.platforms = existing.platforms || []
        if (item.platform && !existing.platforms.includes(item.platform)) {
          existing.platforms.push(item.platform)
        }
      } else {
        activityMap.set(item.date, {
          count: item.count,
          platforms: item.platform ? [item.platform] : [],
        })
      }
    })

    // Find the max count for scaling
    const maxCount = Math.max(...Array.from(activityMap.values()).map((data) => data.count || 0), 1)

    // Generate the heatmap cells
    const heatmapCells = []
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const activityData = activityMap.get(dateString) || { count: 0, platforms: [] }
      const count = activityData.count
      const platforms = activityData.platforms || []
      const level = count > 0 ? Math.ceil((count / maxCount) * 5) : 0

      heatmapCells.push(
        <div
          key={dateString}
          className={`heatmap-day level-${level} fade-in`}
          title={`${dateString}: ${count} activities`}
          style={{ "--animation-order": i }}
          data-date={dateString}
          data-count={count}
          data-platforms={platforms.join(",")}
        />,
      )
    }

    return heatmapCells
  }

  return (
    <section>
      <div className="section-header">
        <h2>CP Tracker & Analytics</h2>
      </div>

      <div className="leaderboard-container">
        <div className="profile-setup">
          <h3>Set Up Your Profile</h3>
          <div className="input-group">
            <label htmlFor="codeforces-username">Codeforces Username</label>
            <input
              type="text"
              id="codeforces-username"
              placeholder="Enter your Codeforces username"
              value={userProfile.codeforces}
              onChange={(e) => setUserProfile({ ...userProfile, codeforces: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="leetcode-username">LeetCode Username</label>
            <input
              type="text"
              id="leetcode-username"
              placeholder="Enter your LeetCode username"
              value={userProfile.leetcode}
              onChange={(e) => setUserProfile({ ...userProfile, leetcode: e.target.value })}
            />
          </div>
          <button className="btn primary" onClick={saveUserProfile}>
            <i className="fas fa-save"></i> Save Profile
          </button>
        </div>

        <div className="user-stats">
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading stats...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              <p>Failed to load user stats. Please check your username and try again.</p>
            </div>
          )}

          {!loading && !error && !statsVisible && (
            <div className="empty-state">
              <i className="fas fa-user-circle"></i>
              <p>Enter your Codeforces and/or LeetCode username to see your stats.</p>
            </div>
          )}

          {!loading && !error && statsVisible && (
            <div className="user-stats-content fade-in">
              <div className="user-header">
                <h3>
                  {userProfile.codeforces && userProfile.leetcode
                    ? `${userProfile.codeforces} / ${userProfile.leetcode}`
                    : userProfile.codeforces || userProfile.leetcode}
                </h3>
                <div className="refresh-btn">
                  <button className="btn outline small" onClick={() => loadUserStats(userProfile)}>
                    <i className="fas fa-sync-alt"></i> Refresh
                  </button>
                </div>
              </div>

              <div className="platform-stats">
                <div className="platform-section">
                  <h3 className="platform-title">
                    <i className="fas fa-code"></i> Overall Stats
                  </h3>
                  <div className="stats-cards">
                    <div className="stat-card fade-in" style={{ "--animation-order": 0 }}>
                      <div className="stat-icon">
                        <i className="fas fa-fire"></i>
                      </div>
                      <div className="stat-content">
                        <h4>Current Streak</h4>
                        <p>{userStats.currentStreak} days</p>
                      </div>
                    </div>
                    <div className="stat-card fade-in" style={{ "--animation-order": 1 }}>
                      <div className="stat-icon">
                        <i className="fas fa-trophy"></i>
                      </div>
                      <div className="stat-content">
                        <h4>Best Streak</h4>
                        <p>{userStats.bestStreak} days</p>
                      </div>
                    </div>
                    <div className="stat-card fade-in" style={{ "--animation-order": 2 }}>
                      <div className="stat-icon">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="stat-content">
                        <h4>Total Problems</h4>
                        <p>{userStats.totalSolved}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {userProfile.codeforces && (
                  <div className="platform-section">
                    <h3 className="platform-title">
                      <img
                        src="https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/codeforces.svg"
                        alt="Codeforces"
                        className="platform-icon"
                      />
                      Codeforces Stats
                    </h3>
                    <div className="stats-cards">
                      <div className="stat-card fade-in" style={{ "--animation-order": 3 }}>
                        <div className="stat-icon">
                          <i className="fas fa-chart-line"></i>
                        </div>
                        <div className="stat-content">
                          <h4>Rating</h4>
                          <p>{userStats.codeforces.rating || "N/A"}</p>
                        </div>
                      </div>
                      <div className="stat-card fade-in" style={{ "--animation-order": 4 }}>
                        <div className="stat-icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-content">
                          <h4>Problems Solved</h4>
                          <p>{userStats.codeforces.solved}</p>
                        </div>
                      </div>
                      <div className="stat-card fade-in" style={{ "--animation-order": 5 }}>
                        <div className="stat-icon">
                          <i className="fas fa-award"></i>
                        </div>
                        <div className="stat-content">
                          <h4>Contest Rank</h4>
                          <p>{userStats.codeforces.rank}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userProfile.leetcode && (
                  <div className="platform-section">
                    <h3 className="platform-title">
                      <img
                        src="https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/leetcode.svg"
                        alt="LeetCode"
                        className="platform-icon"
                      />
                      LeetCode Stats
                    </h3>
                    <div className="stats-cards">
                      <div className="stat-card fade-in" style={{ "--animation-order": 6 }}>
                        <div className="stat-icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-content">
                          <h4>Problems Solved</h4>
                          <p>{userStats.leetcode.solved}</p>
                        </div>
                      </div>
                      <div className="stat-card fade-in" style={{ "--animation-order": 7 }}>
                        <div className="stat-icon">
                          <i className="fas fa-award"></i>
                        </div>
                        <div className="stat-content">
                          <h4>Contest Rating</h4>
                          <p>{userStats.leetcode.rating || "N/A"}</p>
                        </div>
                      </div>
                      <div className="stat-card fade-in" style={{ "--animation-order": 8 }}>
                        <div className="stat-icon">
                          <i className="fas fa-crown"></i>
                        </div>
                        <div className="stat-content">
                          <h4>Global Rank</h4>
                          <p>{userStats.leetcode.rank}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="activity-calendar">
                <h4>Activity Calendar</h4>
                <div className="heatmap-container">{createActivityHeatmap()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CPTracker

