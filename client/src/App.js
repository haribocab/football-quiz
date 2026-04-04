import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import axios from "axios";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";

function App() {
  const [selectedYear, setSelectedYear] = useState(localStorage.getItem('selectedYear') || '0');
  const [selectedTeamId, setSelectedTeamId] = useState(localStorage.getItem('selectedTeamId') || '0');
  const [selectedLeagueId, setSelectedLeagueId] = useState(localStorage.getItem('selectedLeagueId') || '0');
  const [selectedTeam, setSelectedTeam] = useState(() => {
    const team = localStorage.getItem('selectedTeam');
    return team ? JSON.parse(team) : null;
  });

  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState(false);

  const apiKey = process.env.REACT_APP_API_KEY;
  const [randomQuiz, setRandomQuiz] = useState(false);

  // -------------------------
  // localStorage
  // -------------------------
  useEffect(() => {
    localStorage.setItem('selectedYear', selectedYear);
    localStorage.setItem('selectedTeamId', selectedTeamId);
    localStorage.setItem('selectedLeagueId', selectedLeagueId);
    localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam));
  }, [selectedYear, selectedLeagueId, selectedTeamId, selectedTeam]);

  // -------------------------
  // Seasons
  // -------------------------
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('./../seasons.json');
        const result = await response.json();
        setSeasons(result);

        if (selectedYear && selectedYear !== '0') {
          const matchSeason = result.find(
            season => season.season.year === parseInt(selectedYear, 10)
          );
          if (matchSeason) {
            setSelectedSeason(matchSeason.season);
            setLeagues(matchSeason.leagues);
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchSeasons();
  }, [selectedYear]);

  // -------------------------
  // Teams
  // -------------------------
  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      setTeamsError(false);

      try {
        let teamsData;

      
        if (process.env.REACT_APP_SOURCE === "local") {
          const response = await fetch(process.env.REACT_APP_SOURCE_LOCAL + '/response');
          const result = await response.json();
          teamsData = result.map(team => team.team);
        } else {
          const response = await axios.get(
            process.env.REACT_APP_SOURCE_API +
            `/teams?season=${selectedYear}&league=${selectedLeagueId}`,
            {
              headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io',
              },
            }
          );
          const result = response.data.response;
          teamsData = result.map(team => team.team);
        }

        if (!teamsData || teamsData.length === 0) {
          setTeams([]);
          setTeamsError(true);
        } else {
          setTeams(teamsData);
        }

      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeams([]);
        setTeamsError(true);
      } finally {
        setLoadingTeams(false);
      }
    };

    if (selectedLeagueId !== '0') {
      fetchTeams();
    }
  }, [selectedLeagueId, selectedYear]);

  // -------------------------
  // Handlers
  // -------------------------
  const handleYearChange = (year) => {
    setSelectedYear(year);

    const matchSeason = seasons.find(
      season => season.season.year === parseInt(year, 10)
    );

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
    const team = teams.find(team => team.id === parseInt(teamId, 10));
    setSelectedTeam(team);
  };

  const handleQuizCreate = (selectedTeam) => {
    localStorage.removeItem("quizStarted");
    localStorage.removeItem("timerFinished");
    localStorage.removeItem("players");
    localStorage.removeItem("showAnswer");
    setSelectedTeam(selectedTeam);
  };

  // -------------------------
  // Random Quiz
  // -------------------------
  const handleRandomQuiz = async () => {
    if (seasons.length === 0) return;

    setLoadingTeams(true);
    setTeamsError(false);
    setRandomQuiz(true);

    try {
      const randomSeasonIdx = Math.floor(Math.random() * seasons.length);
      const randomSeasonObj = seasons[randomSeasonIdx];
      const randomYear = randomSeasonObj.season.year;

      const randomLeagueIdx = Math.floor(Math.random() * randomSeasonObj.leagues.length);
      const randomLeague = randomSeasonObj.leagues[randomLeagueIdx];
      const randomLeagueId = randomLeague.id;

      setSelectedYear(randomYear.toString());
      setSelectedSeason(randomSeasonObj.season);
      setLeagues(randomSeasonObj.leagues);
      setSelectedLeagueId(randomLeagueId.toString());

      let teamsData;

      if (process.env.REACT_APP_SOURCE === "local") {
        const response = await fetch(process.env.REACT_APP_SOURCE_LOCAL + '/response');
        const result = await response.json();
        teamsData = result.map(team => team.team);
      } else {
        const response = await axios.get(
          `${process.env.REACT_APP_SOURCE_API}/teams?season=${randomYear}&league=${randomLeagueId}`,
          {
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': 'v3.football.api-sports.io',
            },
          }
        );
        const result = response.data.response;
        teamsData = result.map(team => team.team);
      }

      if (!teamsData || teamsData.length === 0) {
        throw new Error("No teams found for this selection");
      }

      setTeams(teamsData);
      const randomTeam = teamsData[Math.floor(Math.random() * teamsData.length)];
      
      setSelectedTeamId(randomTeam.id.toString());
      setSelectedTeam(randomTeam);

      handleQuizCreate(randomTeam);

    } catch (error) {
      console.error("Error in Random Quiz:", error);
      setTeamsError(true);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="px-6 flex flex-col items-center justify-center min-h-screen py-10">
              
              {/* --- Header --- */}
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-slate-800 mb-2">
                  Football Quiz
                </h1>
                <p className="text-slate-500 text-sm">
                  Guess the team name from the players' faces.
                </p>
              </div>

              {/* --- Main Card --- */}
              <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                
                <div className="relative">
                  {/* Random Mode Overlay */}
                  {randomQuiz && (
                    <div className="absolute inset-0 z-10 backdrop-blur-sm flex items-center justify-center">
                      <button 
                        onClick={() => setRandomQuiz(false)} 
                        className="text-xs font-semibold text-blue-600 border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50"
                      >
                        Change selection
                      </button>
                    </div>
                  )}

                  <div className={`space-y-4 ${randomQuiz ? 'opacity-20' : ''}`}>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Season</label>
                      <select
                        onChange={(e) => handleYearChange(e.target.value)}
                        value={selectedYear}
                        className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="0">Select Season</option>
                        {seasons.map(season => (
                          <option key={season.season.year} value={season.season.year}>
                            {season.season.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">League</label>
                      <select
                        onChange={(e) => handleLeagueChange(e.target.value)}
                        value={selectedLeagueId}
                        disabled={!selectedYear || selectedYear === '0'}
                        className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="0">Select League</option>
                        {leagues.map(league => (
                          <option key={league.id} value={league.id}>
                            {league.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Team</label>
                      <select
                        onChange={(e) => handleTeamChange(e.target.value)}
                        value={selectedTeamId}
                        disabled={!selectedLeagueId || selectedLeagueId === '0'}
                        className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="0">Select Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                <div className="h-6 mt-2 text-center">
                  {loadingTeams && <span className="text-[11px] text-slate-400 animate-pulse">Updating teams...</span>}
                  {teamsError && <span className="text-[11px] text-red-400">Failed to load data.</span>}
                </div>

                {/* Buttons */}
                <div className="grid gap-3 mt-4">
                  <button
                    onClick={handleRandomQuiz}
                    className="w-full bg-slate-800 text-white text-sm font-medium py-3 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    🎲 Random Quiz
                  </button>

                  <Link
                    to={`/team/${selectedYear}/${selectedTeamId}`}
                    className={`w-full text-center text-sm font-bold py-3 rounded-lg transition-all ${
                      selectedTeamId === '0' || teamsError
                        ? 'bg-slate-100 text-slate-300 pointer-events-none'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                    }`}
                    onClick={() => handleQuizCreate(selectedTeam)}
                  >
                    Start Quiz
                  </Link>
                </div>

              </div>

              <footer className="mt-12 text-slate-400 text-[10px] tracking-widest uppercase">
                Football API Integration
              </footer>
            </div>
          } />

          <Route
            path="/team/:selectedYear/:selectedTeamId"
            element={
              selectedTeam && (
                <Players
                  team={{
                    season: selectedSeason,
                    country: selectedTeam.country,
                    name: selectedTeam.name,
                    logo: selectedTeam.logo
                  }}
                />
              )
            }
          />
          <Route path="/player/:selectedYear/:playerId" element={<PlayerDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;