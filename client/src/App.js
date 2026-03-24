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

        if (process.env.NODE_ENV === 'development') {
          const response = await fetch("http://localhost:3031/response");
          const result = await response.json();
          teamsData = result.map(team => team.team);
        } else {
          const response = await axios.get(
            `https://v3.football.api-sports.io/teams?season=${selectedYear}&league=${selectedLeagueId}`,
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

    setRandomQuiz(true);

    const randomSeason = seasons[Math.floor(Math.random() * seasons.length)];
    const randomYear = randomSeason.season.year;
    const randomLeague = randomSeason.leagues[Math.floor(Math.random() * randomSeason.leagues.length)];

    setSelectedYear(randomYear);
    setSelectedSeason(randomSeason.season);
    setLeagues(randomSeason.leagues);
    setSelectedLeagueId(randomLeague.id);

    try {
      let teamsData;

      if (process.env.NODE_ENV === 'development') {
        const response = await fetch("http://localhost:3031/response");
        const result = await response.json();
        teamsData = result.map(team => team.team);
      } else {
        const response = await axios.get(
          `https://v3.football.api-sports.io/teams?season=${randomYear}&league=${randomLeague.id}`,
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
        setTeamsError(true);
        return;
      }

      setTeams(teamsData);

      const randomTeam = teamsData[Math.floor(Math.random() * teamsData.length)];
      setSelectedTeam(randomTeam);
      setSelectedTeamId(randomTeam.id);

      handleQuizCreate(randomTeam);

    } catch (error) {
      console.error("Error fetching teams:", error);
      setTeamsError(true);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="px-4 py-4 grid place-content-center min-h-screen">
              <div className="w-64 rounded shadow-lg grid bg-white p-4 gap-2">

                <div className="relative">
                  <div className={`absolute w-full h-full flex items-center justify-center z-10 rounded ${!randomQuiz ? 'hidden' : ''}`}>
                    <button onClick={() => setRandomQuiz(false)} className={'z-10 py-2 px-4 bg-white rounded text-blue-600 border border-blue-600'}>
                      Select
                    </button>
                  </div>

                  <div className={`${randomQuiz ? 'blur-sm' : ''}`}>

                    {/* Season */}
                    <select
                      onChange={(e) => handleYearChange(e.target.value)}
                      value={selectedYear}
                      className="bg-gray-50 border p-2.5 w-full"
                    >
                      <option value="0">Select Season</option>
                      {seasons.map(season => (
                        <option key={season.season.year} value={season.season.year}>
                          {season.season.name}
                        </option>
                      ))}
                    </select>

                    {/* League */}
                    <select
                      onChange={(e) => handleLeagueChange(e.target.value)}
                      value={selectedLeagueId}
                      disabled={!selectedYear || selectedYear === '0'}
                      className="bg-gray-50 border p-2.5 w-full"
                    >
                      <option value="0">Select League</option>
                      {leagues.map(league => (
                        <option key={league.id} value={league.id}>
                          {league.name}
                        </option>
                      ))}
                    </select>

                    {/* Team */}
                    <select
                      onChange={(e) => handleTeamChange(e.target.value)}
                      value={selectedTeamId}
                      disabled={!selectedLeagueId || selectedLeagueId === '0'}
                      className="bg-gray-50 border p-2.5 w-full"
                    >
                      <option value="0">Select Team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>

                    {/* Status */}
                    {loadingTeams && (
                      <p className="text-sm text-gray-500">Loading teams...</p>
                    )}

                    {teamsError && (
                      <div className="text-sm text-red-500">
                        <p>Teams could not be loaded. Please change Season</p>
                      </div>
                    )}

                    {!loadingTeams && !teamsError && teams.length === 0 && selectedLeagueId !== '0' && (
                      <p className="text-sm text-yellow-500">
                        No teams found.
                      </p>
                    )}

                  </div>
                </div>

                <button
                  onClick={handleRandomQuiz}
                  className="bg-purple-500 text-white py-2 rounded"
                >
                  🎲 Random Quiz
                </button>

                <Link
                  to={`/team/${selectedYear}/${selectedTeamId}`}
                  className={`text-center py-2 border rounded ${
                    selectedTeamId === '0' ? 'opacity-25 pointer-events-none' : ''
                  }`}
                  onClick={() => handleQuizCreate(selectedTeam)}
                >
                  Let's Quiz
                </Link>

              </div>
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