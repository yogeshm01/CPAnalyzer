"use client"

import { useState, useEffect } from "react"
import { useNotification } from "../context/NotificationContext"

const ProblemGenerator = () => {
  const { showNotification } = useNotification()

  const [platform, setPlatform] = useState("codeforces")
  const [difficulty, setDifficulty] = useState("any")
  const [topic, setTopic] = useState("any")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [problemsHistory, setProblemsHistory] = useState([])
  const [historyFilter, setHistoryFilter] = useState("all")

  // DSA topics for filtering
  const dsaTopics = [
    { value: "any", label: "Any Topic" },
    { value: "two-pointers", label: "Two Pointers" },
    { value: "prefix-sum", label: "Prefix Sum" },
    { value: "2d-array", label: "2D Array" },
    { value: "binary-search", label: "Binary Search" },
    { value: "sorting", label: "Sorting Algorithms" },
    { value: "dp", label: "Dynamic Programming" },
    { value: "recursion", label: "Recursion" },
    { value: "linked-list", label: "Linked List" },
    { value: "stack", label: "Stack" },
    { value: "queue", label: "Queue" },
    { value: "hashing", label: "Hashing" },
    { value: "bst", label: "Binary Search Tree" },
    { value: "graph", label: "Graph Algorithms" },
    { value: "greedy", label: "Greedy Algorithms" },
  ]

  useEffect(() => {
    const savedHistory = localStorage.getItem("cp_problem_history")
    if (savedHistory) {
      setProblemsHistory(JSON.parse(savedHistory))
    }

    const currentProblemJson = localStorage.getItem("cp_current_problem")
    if (currentProblemJson) {
      setCurrentProblem(JSON.parse(currentProblemJson))
    } else {
      generateRandomProblem()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cp_problem_history", JSON.stringify(problemsHistory))
  }, [problemsHistory])

  const generateRandomProblem = () => {
    setLoading(true)
    setError(false)

    if (platform === "codeforces") {
      generateCodeforcesProblem()
    } else if (platform === "leetcode") {
      generateLeetCodeProblem()
    }
  }

  const generateCodeforcesProblem = async () => {
    try {
      const response = await fetch("https://codeforces.com/api/problemset.problems")
      const data = await response.json()

      if (data.status !== "OK") throw new Error("Failed to fetch problems")

      const problems = data.result.problems.filter((p) => p.rating)

      let filtered = problems

      if (difficulty !== "any") {
        filtered = filtered.filter((problem) => {
          if (!problem.rating) return false
          if (difficulty === "easy") return problem.rating < 1000
          if (difficulty === "medium") return problem.rating >= 1000 && problem.rating < 1500
          if (difficulty === "hard") return problem.rating >= 1500
        })
      }

      if (topic !== "any") {
        filtered = filtered.filter((problem) => problem.tags?.includes(topic))
      }

      if (filtered.length === 0) throw new Error("No problems found matching the selected criteria")

      const randomIndex = Math.floor(Math.random() * filtered.length)
      const problem = filtered[randomIndex]
      problem.platform = "codeforces"

      displayCodeforcesProblem(problem)
    } catch (error) {
      console.error("Error fetching problem:", error)
      setError(true)
      setLoading(false)
    }
  }

  const generateLeetCodeProblem = () => {
    setTimeout(() => {
      try {
        const leetcodeProblems = [
            {
              id: 1,
              title: "Two Sum",
              difficulty: "easy",
              description:
                "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
              link: "https://leetcode.com/problems/two-sum/",
              topic: "two-pointers",
            },
            {
              id: 53,
              title: "Maximum Subarray",
              difficulty: "medium",
              description: "Find the contiguous subarray which has the largest sum.",
              link: "https://leetcode.com/problems/maximum-subarray/",
              topic: "dp",
            },
            {
              id: 42,
              title: "Trapping Rain Water",
              difficulty: "hard",
              description:
                "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
              link: "https://leetcode.com/problems/trapping-rain-water/",
              topic: "two-pointers",
            },
            {
              id: 20,
              title: "Valid Parentheses",
              difficulty: "easy",
              description:
                "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
              link: "https://leetcode.com/problems/valid-parentheses/",
              topic: "stack",
            },
            {
              id: 200,
              title: "Number of Islands",
              difficulty: "medium",
              description:
                "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
              link: "https://leetcode.com/problems/number-of-islands/",
              topic: "graph",
            },
            {
              id: 23,
              title: "Merge k Sorted Lists",
              difficulty: "hard",
              description:
                "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
              link: "https://leetcode.com/problems/merge-k-sorted-lists/",
              topic: "linked-list",
            },
            {
              id: 121,
              title: "Best Time to Buy and Sell Stock",
              difficulty: "easy",
              description:
                "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
              link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
              topic: "dp",
            },
            {
              id: 146,
              title: "LRU Cache",
              difficulty: "medium",
              description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
              link: "https://leetcode.com/problems/lru-cache/",
              topic: "hashing",
            },
            {
              id: 10,
              title: "Regular Expression Matching",
              difficulty: "hard",
              description:
                "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' Matches any single character and '*' Matches zero or more of the preceding element.",
              link: "https://leetcode.com/problems/regular-expression-matching/",
              topic: "dp",
            },
            {
              id: 704,
              title: "Binary Search",
              difficulty: "easy",
              description:
                "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
              link: "https://leetcode.com/problems/binary-search/",
              topic: "binary-search",
            },
            {
              id: 217,
              title: "Contains Duplicate",
              difficulty: "easy",
              description:
                "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
              link: "https://leetcode.com/problems/contains-duplicate/",
              topic: "hashing",
            },
            {
              id: 56,
              title: "Merge Intervals",
              difficulty: "medium",
              description:
                "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
              link: "https://leetcode.com/problems/merge-intervals/",
              topic: "sorting",
            },
            {
              id: 98,
              title: "Validate Binary Search Tree",
              difficulty: "medium",
              description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
              link: "https://leetcode.com/problems/validate-binary-search-tree/",
              topic: "bst",
            },
            {
              id: 303,
              title: "Range Sum Query - Immutable",
              difficulty: "easy",
              description:
                "Given an integer array nums, handle multiple queries of the following type: Calculate the sum of the elements of nums between indices left and right inclusive where left <= right.",
              link: "https://leetcode.com/problems/range-sum-query-immutable/",
              topic: "prefix-sum",
            },
            {
              id: 73,
              title: "Set Matrix Zeroes",
              difficulty: "medium",
              description:
                "Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0's.",
              link: "https://leetcode.com/problems/set-matrix-zeroes/",
              topic: "2d-array",
            },
          ]

        let filtered = leetcodeProblems
        if (difficulty !== "any") filtered = filtered.filter((p) => p.difficulty === difficulty)
        if (topic !== "any") filtered = filtered.filter((p) => p.topic === topic)
        if (filtered.length === 0) throw new Error("No problems found matching the selected criteria")

        const problem = filtered[Math.floor(Math.random() * filtered.length)]
        problem.platform = "leetcode"
        displayLeetCodeProblem(problem)
      } catch (error) {
        console.error("Error fetching problem:", error)
        setError(true)
        setLoading(false)
      }
    }, 800)
  }

  const displayCodeforcesProblem = (problem) => {
    let difficultyClass = "medium"
    let difficultyText = "Medium"
    if (problem.rating < 1000) {
      difficultyClass = "easy"
      difficultyText = "Easy"
    } else if (problem.rating >= 1500) {
      difficultyClass = "hard"
      difficultyText = "Hard"
    }

    const link = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`

    const currentProblemObj = {
      platform: "codeforces",
      id: `CF-${problem.contestId}${problem.index}`,
      contestId: problem.contestId,
      index: problem.index,
      title: problem.name,
      difficulty: difficultyText,
      difficultyClass,
      rating: problem.rating,
      tags: problem.tags,
      link,
      date: new Date().toISOString(),
      status: "new",
      topic: problem.tags?.[0] || "unknown",
    }

    setCurrentProblem(currentProblemObj)
    localStorage.setItem("cp_current_problem", JSON.stringify(currentProblemObj))
    setLoading(false)
  }

  const displayLeetCodeProblem = (problem) => {
    const difficultyText = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)
    const currentProblemObj = {
      platform: "leetcode",
      id: `LC-${problem.id}`,
      title: problem.title,
      difficulty: difficultyText,
      difficultyClass: problem.difficulty,
      description: problem.description,
      link: problem.link,
      date: new Date().toISOString(),
      status: "new",
      topic: problem.topic || "unknown",
    }
    setCurrentProblem(currentProblemObj)
    localStorage.setItem("cp_current_problem", JSON.stringify(currentProblemObj))
    setLoading(false)
  }

  const markCurrentProblem = (status) => {
    if (!currentProblem) {
      showNotification("No problem to mark. Generate a problem first.", "error")
      return
    }

    const updated = { ...currentProblem, status }
    const index = problemsHistory.findIndex((p) => p.id === updated.id)
    const newHistory = [...problemsHistory]
    if (index >= 0) newHistory[index] = updated
    else newHistory.push(updated)

    setProblemsHistory(newHistory)
    setCurrentProblem(updated)
    localStorage.setItem("cp_current_problem", JSON.stringify(updated))

    showNotification(
      `Problem ${updated.id} marked as ${status === "solved" ? "solved" : "pending"}.`,
      status === "solved" ? "success" : "info"
    )
  }

  const getFilteredHistory = () => {
    let filtered = problemsHistory
    if (historyFilter === "solved") filtered = filtered.filter((p) => p.status === "solved")
    if (historyFilter === "pending") filtered = filtered.filter((p) => p.status === "pending")
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  return (
    <section>
      <div className="section-header">
        <h2>Daily CP Problem Generator</h2>
        <div className="problem-controls">
          <div className="controls-group">
            <select className="platform-select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="codeforces">Codeforces</option>
              <option value="leetcode">LeetCode</option>
            </select>

            <select className="difficulty-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="any">Any Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select className="topic-select" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {dsaTopics.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn primary" onClick={generateRandomProblem} disabled={loading}>
            <i className="fas fa-sync-alt"></i> Generate New Problem
          </button>
        </div>
      </div>

      <div className="problem-container">
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading problem...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Failed to load problem. Please try again with different criteria.</p>
          </div>
        )}

        {!loading && !error && currentProblem && (
          <div className="problem-content fade-in">
            <div className="problem-header">
              <div>
                <h3>{currentProblem.title}</h3>
                <span className="problem-id">{currentProblem.id}</span>
                <span className={`difficulty ${currentProblem.difficultyClass}`}>{currentProblem.difficulty}</span>
              </div>
              <div className="problem-actions">
                <button className="btn success" onClick={() => markCurrentProblem("solved")}>
                  <i className="fas fa-check"></i> Mark Solved
                </button>
                <button className="btn warning" onClick={() => markCurrentProblem("pending")}>
                  <i className="fas fa-clock"></i> Mark Pending
                </button>
                <a href={currentProblem.link} target="_blank" rel="noopener noreferrer" className="btn outline">
                  <i className="fas fa-external-link-alt"></i> Solve on Platform
                </a>
              </div>
            </div>
            <div className="problem-body">
              {currentProblem.description ? (
                <p>{currentProblem.description}</p>
              ) : (
                <p>
                  Problem from {currentProblem.platform === "codeforces" ? "Codeforces" : "LeetCode"}
                  {currentProblem.tags && currentProblem.tags.length > 0 && (
                    <> with tags: {currentProblem.tags.join(", ")}</>
                  )}
                  {currentProblem.topic && currentProblem.topic !== "unknown" && (
                    <>. Topic: {currentProblem.topic.replace("-", " ")}</>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="problem-history">
        <h3>Your Problem History</h3>
        <div className="tabs">
          <button
            className={`tab-btn ${historyFilter === "all" ? "active" : ""}`}
            onClick={() => setHistoryFilter("all")}
          >
            All
          </button>
          <button
            className={`tab-btn ${historyFilter === "solved" ? "active" : ""}`}
            onClick={() => setHistoryFilter("solved")}
          >
            Solved
          </button>
          <button
            className={`tab-btn ${historyFilter === "pending" ? "active" : ""}`}
            onClick={() => setHistoryFilter("pending")}
          >
            Pending
          </button>
        </div>

        <div className="problem-list">
          {getFilteredHistory().length === 0 ? (
            <p className="empty-state">
              <i className="fas fa-info-circle"></i>
              No {historyFilter !== "all" ? historyFilter : ""} problems in your history yet.
            </p>
          ) : (
            getFilteredHistory().map((problem) => (
              <div className="problem-item" key={problem.id}>
                <div className="problem-item-info">
                  <div className="problem-item-title">
                    <span>{problem.title}</span>
                    <span className={`status-badge ${problem.status}`}>
                      {problem.status === "solved" ? "Solved" : "Pending"}
                    </span>
                  </div>
                  <div className="problem-item-meta">
                    <i className="fas fa-code"></i> {problem.platform === "leetcode" ? "LeetCode" : "Codeforces"} · ID:{" "}
                    {problem.id} · Difficulty: {problem.difficulty || problem.rating} · Added:{" "}
                    {formatDate(problem.date)}
                    {problem.topic && problem.topic !== "unknown" && <> · Topic: {problem.topic.replace("-", " ")}</>}
                  </div>
                </div>
                <div className="problem-item-links">
                  <a href={problem.link} target="_blank" rel="noopener noreferrer" className="btn small outline">
                    <i className="fas fa-external-link-alt"></i> Open
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default ProblemGenerator
