"use client"

const Header = ({ activeTab, onTabChange }) => {
  return (
    <header>
      <div className="container">
        <div className="logo">
          <i className="fas fa-code"></i>
          <h1>CP Analyzer</h1>
        </div>
        <nav>
          <ul className="nav-tabs">
            <li
              className={`nav-tab ${activeTab === "problems" ? "active" : ""}`}
              onClick={() => onTabChange("problems")}
            >
              <i className="fas fa-puzzle-piece"></i> Daily Problems
            </li>
            <li
              className={`nav-tab ${activeTab === "complexity" ? "active" : ""}`}
              onClick={() => onTabChange("complexity")}
            >
              <i className="fas fa-chart-line"></i> Complexity Visualizer
            </li>
            <li
              className={`nav-tab ${activeTab === "leaderboard" ? "active" : ""}`}
              onClick={() => onTabChange("leaderboard")}
            >
              <i className="fas fa-trophy"></i> CP Tracker
            </li>
            <li
              className={`nav-tab ${activeTab === "debugger" ? "active" : ""}`}
              onClick={() => onTabChange("debugger")}
            >
              <i className="fas fa-bug"></i> Debug Helper
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header

