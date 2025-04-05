import { useState, useEffect } from "react";
import Header from "./components/Header";
import ProblemGenerator from "./components/ProblemGenerator";
import ComplexityVisualizer from "./components/ComplexityVisualizer";
import CPTracker from "./components/CPTracker";
import DebugHelper from "./components/DebugHelper";
import Footer from "./components/Footer";
import { NotificationProvider } from "./context/NotificationContext.jsx";

function App() {
  const [activeTab, setActiveTab] = useState("problems");

  useEffect(() => {
    // Restore active tab from localStorage if available
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem("activeTab", tabId);
  };

  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen">
        <Header activeTab={activeTab} onTabChange={handleTabChange} />

        <main>
          <div className="container">
            {activeTab === "problems" && <ProblemGenerator />}
            {activeTab === "complexity" && <ComplexityVisualizer />}
            {activeTab === "leaderboard" && <CPTracker />}
            {activeTab === "debugger" && <DebugHelper />}
          </div>
        </main>

        <Footer />
      </div>
    </NotificationProvider>
  );
}

export default App;