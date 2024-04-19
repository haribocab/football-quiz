import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import axios from "axios";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";

function App() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const apiKey = process.env.REACT_APP_API_KEY;

  const fetchSeasons = async () => {
    try {
      const response = await fetch('./../seasons.json');
      const result = await response.json();
      setSeasons(result);
    } catch (error) {
      console.log("error", error);
    }
  }
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        var requestOptions = {
          method: "GET",
          redirect: "follow",
        };
    
        const response = await fetch("http://localhost:3031/response", requestOptions);
        const result = await response.json();
        setTeams(result.map(team => team.team));
      } catch (error) {
        console.log("error", error);
      }
    };

    // const fetchTeams = async () => {
    //   try {
    //     const response = await axios.get(`https://v3.football.api-sports.io/teams?season=${selectedYear}&league=${selectedLeague}`, {
    //       headers: {
    //         'x-rapidapi-key': `${apiKey}`,
    //         'x-rapidapi-host': 'v3.football.api-sports.io'
    //       }
    //     });
  
    //     const result = response.data.response;
    //     setTeams(result.map(team => team.team));
    //   } catch (error) {
    //     console.error("Error fetching players:", error);
    //   }
    // };

    fetchSeasons();
    fetchTeams();
  }, [apiKey, selectedLeague, selectedYear]);


  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleLeagueChange = (leagueId) => {
    setSelectedLeague(leagueId);
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
  };

  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="px-4 py-4 grid place-content-center min-h-screen">
              <div className="w-64 rounded shadow-lg grid bg-white p-4 gap-2">
                <select 
                onChange={(e) => handleYearChange(e.target.value)} 
                value={selectedYear}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option>Select Season</option>
                  {seasons.map(season => (
                    <option key={season.year} value={season.year}>{season.year}</option>
                  ))}
                </select>
              
                <select 
                onChange={(e) => handleLeagueChange(e.target.value)} 
                value={selectedLeague}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                disabled={!selectedYear}
                >
                  <option>Select League</option>
                  {selectedYear && seasons.find(season => season.year === parseInt(selectedYear))?.leagues.map(league => (
                    <option key={league.id} value={league.id}>{league.name}</option>
                  ))}
                </select>

                <select 
                onChange={(e) => handleTeamChange(e.target.value)} 
                value={selectedTeam}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                disabled={!selectedLeague}
                >
                  <option>Select Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>

                <Link to={`/${selectedYear}/${selectedTeam}`} 
                className={`text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ${selectedTeam ? '' : 'opacity-25'}`}>Let's Quiz</Link>
              </div>
            </div>
          } />
          <Route path="/:selectedYear/:selectedTeam" element={<Players />} />
          <Route path="/player/:playerId" element={<PlayerDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;