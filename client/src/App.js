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
  const apiKey = process.env.REACT_APP_API_KEY;
  const [randomQuiz, setRandomQuiz] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedYear', selectedYear);
    localStorage.setItem('selectedTeamId', selectedTeamId);
    localStorage.setItem('selectedLeagueId', selectedLeagueId);
    localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam));
  }, [selectedYear, selectedLeagueId, selectedTeamId, selectedTeam]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('./../seasons.json');
        const result = await response.json();
        setSeasons(result);
        if(selectedYear & selectedYear != undefined){
          const matchSeason = result.find(season => season.season.year === parseInt(selectedYear, 10));
          setSelectedSeason(matchSeason.season);
          setLeagues(matchSeason.leagues);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchSeasons();
  }, [selectedYear]); 

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        let teamsData;
    
        if (process.env.NODE_ENV === 'development') {
          // Fetch data from the local JSON file in development
          const response = await fetch("http://localhost:3031/response");
          const result = await response.json();
          teamsData = result.map(team => team.team);
        } else {
          // Fetch data from the API in production
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
    
        setTeams(teamsData);
        console.log("Fetched teams");
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    
    if (selectedLeagueId !== '0') {
      fetchTeams();
    }
  }, [selectedLeagueId,]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    const matchSeason = seasons.find(season => season.season.year === parseInt(year, 10));
    if (matchSeason) {
      setSelectedSeason(matchSeason.season);
      setLeagues(matchSeason.leagues);
    }
    setSelectedLeagueId('0');
    setSelectedTeamId('0');
  };

  const handleLeagueChange = (leagueId) => {
    setSelectedLeagueId(leagueId);
    setSelectedTeamId('0');
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
  }

  const handleRandomQuiz = () => {

    if (seasons.length === 0) return;

    setRandomQuiz(true);

    // Zufällige Season wählen
    const randomSeason = seasons[Math.floor(Math.random() * seasons.length)];
    const randomYear = randomSeason.season.year;
    setSelectedYear(randomYear);
    setSelectedSeason(randomSeason.season);
    setLeagues(randomSeason.leagues);

    // Zufällige League wählen
    const randomLeague = randomSeason.leagues[Math.floor(Math.random() * randomSeason.leagues.length)];
    const randomLeagueId = randomLeague.id;
    setSelectedLeagueId(randomLeagueId);

    // Teams holen
    const fetchTeamsForLeague = async () => {
      try {
        let teamsData;

        if (process.env.NODE_ENV === 'development') {
          const response = await fetch("http://localhost:3031/response");
          const result = await response.json();
          teamsData = result.map(team => team.team);
        } else {
          const response = await axios.get(
            `https://v3.football.api-sports.io/teams?season=${randomYear}&league=${randomLeagueId}`,
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

        setTeams(teamsData);

        if (teamsData.length > 0) {
          const randomTeam = teamsData[Math.floor(Math.random() * teamsData.length)];
          setSelectedTeam(randomTeam);
          setSelectedTeamId(randomTeam.id);
          // Startet das Quiz direkt
          handleQuizCreate(randomTeam);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeamsForLeague();
  };


  
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="px-4 py-4 grid place-content-center min-h-screen">
              <div className="w-64 rounded shadow-lg grid bg-white p-4 gap-2">

                <div className="relative">
                  <div className={`absolute w-full h-full flex items-center justify-center z-10 rounded ${!randomQuiz ? 'hidden' : ''}`}>
                    <button onClick={() => setRandomQuiz(false)} className={'z-10 py-2 px-4 bg-white rounded text-blue-600 border border-blue-600'}>Select</button>
                  </div>

                  <div className={`${randomQuiz ? 'blur-sm' : ''}`}>
                      <select
                        onChange={(e) => handleYearChange(e.target.value)}
                        value={selectedYear}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option>Select Season</option>
                        {seasons.map(season => (
                          <option key={season.season.year} value={season.season.year}>{season.season.name}</option>
                        ))}
                      </select>

                      <select
                        onChange={(e) => handleLeagueChange(e.target.value)}
                        value={selectedLeagueId}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        disabled={!selectedYear}
                      >
                        <option>Select League</option>
                        {leagues.map(league => (
                          <option key={league.id} value={league.id}>{league.name}</option>
                        ))}
                      </select>

                      <select
                        onChange={(e) => handleTeamChange(e.target.value)}
                        value={selectedTeamId}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        disabled={!selectedLeagueId}
                      >
                        <option>Select Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>

                  </div>
                </div>

                <button
                  onClick={handleRandomQuiz}
                  className="text-center bg-purple-500 text-white font-semibold py-2 px-4 rounded hover:bg-purple-600 transition"
                >
                  🎲 Random Quiz
                </button>

                <Link to={`/team/${selectedYear}/${selectedTeamId}`}
                  className={`text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ${selectedTeamId === '0' ? 'opacity-25' : ''}`}
                  onClick={() => handleQuizCreate(selectedTeam)}>Let's Quiz</Link>
              </div>
            </div>
          } />
          <Route path="/team/:selectedYear/:selectedTeamId" element={selectedTeam && <Players team={{ season:selectedSeason, country:selectedTeam.country, name:selectedTeam.name, logo:selectedTeam.logo}} />} />
          <Route path="/player/:selectedYear/:playerId" element={<PlayerDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;