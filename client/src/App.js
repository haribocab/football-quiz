import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import axios from "axios";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";

function App() {
  // --- States with Safe LocalStorage Access ---
  const [selectedYear, setSelectedYear] = useState(localStorage.getItem('selectedYear') || '0');
  const [selectedTeamId, setSelectedTeamId] = useState(localStorage.getItem('selectedTeamId') || '0');
  const [selectedLeagueId, setSelectedLeagueId] = useState(localStorage.getItem('selectedLeagueId') || '0');
  
  const [selectedTeam, setSelectedTeam] = useState(() => {
    const team = localStorage.getItem('selectedTeam');
    if (team && team !== "undefined" && team !== "null") {
      try {
        return JSON.parse(team);
      } catch (e) {
        console.error("Local storage parse error:", e);
        return null;
      }
    }
    return null;
  });

  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [randomQuiz, setRandomQuiz] = useState(false);

  const apiKey = process.env.REACT_APP_API_KEY;

  // --- Helper: Extract teams from various data structures ---
  const extractTeams = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const uniqueTeams = {};
    data.forEach(item => {
      // Local (Statistics structure) or API (Team structure)
      const t = (item.statistics && item.statistics[0]) ? item.statistics[0].team : item.team;
      if (t && t.id) uniqueTeams[t.id] = t;
    });
    return Object.values(uniqueTeams);
  };

  // --- Helper: Handle and Log API Errors ---
  const handleApiError = (error, context = "") => {
    setTeamsError(true);
    let message = "An error occurred while fetching data.";

    if (error.response) {
      // API returned a non-2xx response (429, 500, etc.)
      const status = error.response.status;
      const apiData = error.response.data;
      console.error(`[${context} API Error] Status: ${status}`, apiData);

      if (status === 429) {
        message = "API Limit reached (100 req/day). Try again tomorrow.";
      } else if (apiData?.errors && Object.keys(apiData.errors).length > 0) {
        message = typeof apiData.errors === 'object' 
          ? Object.values(apiData.errors).join(", ") 
          : apiData.errors;
      }
    } else if (error.request) {
      // Request made but no response (Network error)
      console.error(`[${context} Network Error]`, error.request);
      message = "Network error. Please check your internet connection.";
    } else {
      // Other errors
      console.error(`[${context} Error]`, error.message);
      message = error.message;
    }
    setErrorMessage(message);
  };

  // --- Side Effect: LocalStorage Sync ---
  useEffect(() => {
    localStorage.setItem('selectedYear', selectedYear);
    localStorage.setItem('selectedTeamId', selectedTeamId);
    localStorage.setItem('selectedLeagueId', selectedLeagueId);
    if (selectedTeam) {
      localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam));
    } else {
      localStorage.removeItem('selectedTeam');
    }
  }, [selectedYear, selectedLeagueId, selectedTeamId, selectedTeam]);

  // --- Side Effect: Fetch Seasons ---
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('./../seasons.json');
        const result = await response.json();
        setSeasons(result);

        if (selectedYear && selectedYear !== '0') {
          const matchSeason = result.find(s => s.season.year === parseInt(selectedYear, 10));
          if (matchSeason) {
            setSelectedSeason(matchSeason.season);
            setLeagues(matchSeason.leagues);
          }
        }
      } catch (error) {
        console.error("Seasons list fetch error:", error);
      }
    };
    fetchSeasons();
  }, [selectedYear]);

  // --- Side Effect: Fetch Teams (Manual Selection) ---
  useEffect(() => {
    const fetchTeams = async () => {
      if (selectedLeagueId === '0' || randomQuiz) return;
      setLoadingTeams(true);
      setTeamsError(false);
      setErrorMessage("");

      try {
        let teamsData = [];
        if (process.env.REACT_APP_SOURCE === "local") {
          const res = await fetch(`${process.env.REACT_APP_SOURCE_LOCAL}/response`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          console.log("Full Response Data:", res.data);
          const result = await res.json();
          teamsData = extractTeams(result);
        } else {
          const res = await axios.get(
            `${process.env.REACT_APP_SOURCE_API}/teams?season=${selectedYear}&league=${selectedLeagueId}`,
            { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }
          );
          console.log("Full Response Data:", res.data);
          // API might return 200 with error object inside
          if (res.data.errors && Object.keys(res.data.errors).length > 0) {
            const err = new Error("API Internal Error");
            err.response = res;
            throw err;
          }
          teamsData = res.data.response.map(item => item.team);
        }
        setTeams(teamsData);
        if (teamsData.length === 0) throw new Error("No teams found for this league.");
      } catch (error) {
        handleApiError(error, "Fetch Teams");
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, [selectedLeagueId, selectedYear, apiKey, randomQuiz]);

  // --- Handlers ---
  const handleYearChange = (year) => {
    setSelectedYear(year);
    const matchSeason = seasons.find(s => s.season.year === parseInt(year, 10));
    if (matchSeason) {
      setSelectedSeason(matchSeason.season);
      setLeagues(matchSeason.leagues);
    }
    setSelectedLeagueId('0');
    setSelectedTeamId('0');
    setTeams([]);
  };

  const handleLeagueChange = (leagueId) => {
    setSelectedLeagueId(leagueId);
    setSelectedTeamId('0');
    setTeams([]);
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeamId(teamId);
    const team = teams.find(t => t.id === parseInt(teamId, 10));
    setSelectedTeam(team);
  };

  const handleQuizCreate = (team) => {
    localStorage.removeItem("quizStarted");
    localStorage.removeItem("timerFinished");
    localStorage.removeItem("players");
    localStorage.removeItem("showAnswer");
    setSelectedTeam(team);
  };

  const handleRandomQuiz = async () => {
    if (seasons.length === 0) return;
    setLoadingTeams(true);
    setTeamsError(false);
    setErrorMessage("");
    setRandomQuiz(true);

    try {
      const randomSeasonObj = seasons[Math.floor(Math.random() * seasons.length)];
      const randomYear = randomSeasonObj.season.year;
      const randomLeague = randomSeasonObj.leagues[Math.floor(Math.random() * randomSeasonObj.leagues.length)];

      setSelectedYear(randomYear.toString());
      setSelectedSeason(randomSeasonObj.season);
      setLeagues(randomSeasonObj.leagues);
      setSelectedLeagueId(randomLeague.id.toString());

      let teamsData = [];
      if (process.env.REACT_APP_SOURCE === "local") {
        const res = await fetch(`${process.env.REACT_APP_SOURCE_LOCAL}/response`);
        const result = await res.json();
        teamsData = extractTeams(result);
      } else {
        const res = await axios.get(
          `${process.env.REACT_APP_SOURCE_API}/teams?season=${randomYear}&league=${randomLeague.id}`,
          { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }
        );
        if (res.data.errors && Object.keys(res.data.errors).length > 0) {
          const err = new Error("API Internal Error");
          err.response = res;
          throw err;
        }
        teamsData = res.data.response.map(item => item.team);
      }

      if (teamsData.length === 0) throw new Error("No teams data available.");

      setTeams(teamsData);
      const randomTeam = teamsData[Math.floor(Math.random() * teamsData.length)];
      
      setSelectedTeamId(randomTeam.id.toString());
      setSelectedTeam(randomTeam);
      handleQuizCreate(randomTeam);

    } catch (error) {
      handleApiError(error, "Random Quiz");
    } finally {
      setLoadingTeams(false);
    }
  };

  // --- Render ---
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 transition-colors">
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="px-6 flex flex-col items-center justify-center min-h-screen">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800 mb-2">Football Quiz</h1>
                <p className="text-slate-500 text-sm">Guess the team name from the players' faces.</p>
              </div>

              <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="relative">
                  {randomQuiz && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-lg">
                      <button onClick={() => {setRandomQuiz(false); setTeamsError(false);}} className="text-xs font-semibold text-blue-600 border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 bg-white">
                        Manual Select
                      </button>
                    </div>
                  )}

                  <div className={`space-y-4 ${randomQuiz ? 'opacity-20' : ''}`}>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Season</label>
                      <select onChange={(e) => handleYearChange(e.target.value)} value={selectedYear} className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500">
                        <option value="0">Select Season</option>
                        {seasons.map(s => <option key={s.season.year} value={s.season.year}>{s.season.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">League</label>
                      <select onChange={(e) => handleLeagueChange(e.target.value)} value={selectedLeagueId} disabled={selectedYear === '0'} className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg p-2.5 disabled:opacity-40">
                        <option value="0">Select League</option>
                        {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Team</label>
                      <select onChange={(e) => handleTeamChange(e.target.value)} value={selectedTeamId} disabled={selectedLeagueId === '0'} className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg p-2.5 disabled:opacity-40">
                        <option value="0">Select Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status & Detailed Error UI */}
                <div className="min-h-[40px] mt-2 flex flex-col items-center justify-center">
                  {loadingTeams && <span className="text-[11px] text-blue-500 animate-pulse font-medium">Fetching Data...</span>}
                  {!loadingTeams && teamsError && (
                    <div className="text-center animate-in fade-in slide-in-from-top-1">
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">⚠️ API Error</p>
                      <p className="text-[11px] text-red-400 leading-tight mt-0.5">{errorMessage}</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 mt-2">
                  <button onClick={handleRandomQuiz} className="w-full bg-slate-800 text-white text-sm font-medium py-3 rounded-lg hover:bg-slate-900 transition-colors shadow-sm">
                    🎲 Random Quiz
                  </button>
                  <Link to={`/team/${selectedYear}/${selectedTeamId}`} className={`w-full text-center text-sm font-bold py-3 rounded-lg transition-all ${selectedTeamId === '0' || teamsError ? 'bg-slate-100 text-slate-300 pointer-events-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-100'}`} onClick={() => handleQuizCreate(selectedTeam)}>
                    Start Quiz
                  </Link>
                </div>
              </div>
              <footer className="mt-12 text-slate-300 text-[10px] tracking-widest uppercase font-bold">Football Data Engine</footer>
            </div>
          } />

          <Route path="/team/:selectedYear/:selectedTeamId" element={selectedTeam && <Players team={{ season: selectedSeason, country: selectedTeam.country, name: selectedTeam.name, logo: selectedTeam.logo }} />} />
          <Route path="/player/:selectedYear/:playerId" element={<PlayerDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;