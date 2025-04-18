import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { useNotification } from "../context/NotificationContext"

const CPTracker = () => {

  const [userProfile, setUserProfile] = useState({ codeforces: '', leetcode: '' });
  const [userStats, setUserStats] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadUserStats(userProfile);
  }, []);

  const fetchCodeforcesStats = async (username) => {
    try {
      const userInfoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
      const userInfoData = await userInfoResponse.json();
      if (userInfoData.status !== 'OK') {
        throw new Error('Failed to fetch Codeforces user info');
      }
      const user = userInfoData.result[0];
      const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
      const submissionsData = await submissionsResponse.json();

      if (submissionsData.status !== 'OK') {

        throw new Error('Failed to fetch Codeforces submissions');

      }

      const solvedProblems = new Set();
      submissionsData.result.forEach((submission) => {
        if (submission.verdict === 'OK') {
          solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
        }
      });

      return {

        rating: user.rating || 0,

        solved: solvedProblems.size,

        rank: user.rank || 'N/A',

      };

    } catch (error) {

      console.error('Error fetching Codeforces data:', error);

      return {

        rating: 0,

        solved: 0,

        rank: 'N/A',

      };
    }
  };

  const fetchLeetcodeStats = async (username) => {
    try {
      const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error('Failed to fetch LeetCode stats');
      }
      return {

        solved: data.totalSolved || 0,

        rating: data.totalSolved || 0, // Placeholder as LeetCode doesn't have rating

        rank: data.ranking || 'N/A',

      };

    } catch (error) {

      console.error('Error fetching LeetCode data:', error);

      return {

        solved: 0,

        rating: 0,

        rank: 'N/A',

      };

    }

  };

  const loadUserStats = async (profile) => {

    if (!profile.codeforces && !profile.leetcode) {

      setStatsVisible(false);

      setError(false);

      return;

    }



    setLoading(true);

    setError(false);



    try {

      const [cfStats, lcStats] = await Promise.all([

        profile.codeforces ? fetchCodeforcesStats(profile.codeforces) : Promise.resolve({ rating: 0, solved: 0, rank: 'N/A' }),

        profile.leetcode ? fetchLeetcodeStats(profile.leetcode) : Promise.resolve({ solved: 0, rating: 0, rank: 'N/A' }),

      ]);



      const totalSolved = (cfStats.solved || 0) + (lcStats.solved || 0);



      const stats = {

        currentStreak: 0, // Placeholder

        bestStreak: 0,    // Placeholder

        totalSolved,

        codeforces: cfStats,

        leetcode: lcStats,

        activity: [],     // Placeholder

      };



      setUserStats(stats);

      setStatsVisible(true);

      setLoading(false);

    } catch (error) {

      console.error('Error loading stats:', error);

      setError(true);

      setLoading(false);

    }

  };

  const saveUserProfile = () => {
    loadUserStats(userProfile);
  };

  return (
    <div className="leaderboard-container grid gap-4">
      <div className="profile-setup space-y-4">
        <h3 className="text-xl font-semibold">Set Up Your Profile</h3>
        <div className="input-group space-y-2">
          <label htmlFor="codeforces-username">Codeforces Username</label>
          <input
            type="text"
            id="codeforces-username"
            placeholder="Enter your Codeforces username"
            value={userProfile.codeforces}
            onChange={(e) => setUserProfile({ ...userProfile, codeforces: e.target.value })}
            className="border px-3 py-2 rounded w-full"

          />

        </div>

        <div className="input-group space-y-2">

          <label htmlFor="leetcode-username">LeetCode Username</label>

          <input

            type="text"

            id="leetcode-username"

            placeholder="Enter your LeetCode username"

            value={userProfile.leetcode}

            onChange={(e) => setUserProfile({ ...userProfile, leetcode: e.target.value })}

            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <Button className="btn primary" onClick={saveUserProfile}>

          Save Profile

        </Button>

      </div>



      <div className="user-stats">

        {loading && (

          <div className="flex items-center justify-center space-x-2 text-muted-foreground">

            <Loader2 className="animate-spin w-5 h-5" />

            <span>Fetching CP Stats...</span>

          </div>

        )}



        {error && (

          <div className="flex flex-col items-center justify-center space-y-2 text-red-600">

            <p>⚠️ Error loading stats. Please try again.</p>

            <Button variant="outline" className="flex items-center space-x-1" onClick={() => loadUserStats(userProfile)}>

              <RefreshCw className="w-4 h-4" />

              <span>Retry</span>

            </Button>

          </div>

        )}



        {!loading && !error && !statsVisible && (

          <div className="text-center text-muted-foreground">

            <p>Enter your Codeforces and/or LeetCode username to see your stats.</p>

          </div>

        )}



        {statsVisible && userStats && (

          <Card className="p-4 mt-4">
            <CardContent className="space-y-4">
              <div className="text-xl font-bold">CP Stats</div>
              <div>Total Solved: {userStats.totalSolved}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Codeforces</h3>
                  <p>Rating: {userStats.codeforces.rating}</p>
                  <p>Rank: {userStats.codeforces.rank}</p>
                  <p>Solved: {userStats.codeforces.solved}</p>
                </div>
                <div>
                  <h3 className="font-semibold">LeetCode</h3>
                  <p>Solved: {userStats.leetcode.solved}</p>
                  <p>Rank: {userStats.leetcode.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <Button variant="outline" size="sm" onClick={() => loadUserStats(userProfile)}>
                  <RefreshCw className="w-4 h-4 mr-1 inline-block" /> Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CPTracker;