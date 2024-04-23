import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import axios from "axios";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";

function App() {
  const [selectedYearId, setSelectedYearId] = useState(localStorage.getItem('selectedYearId') || '0');
  const [selectedTeamId, setSelectedTeamId] = useState(localStorage.getItem('selectedTeamId') || '0');
  const [selectedLeagueId, setSelectedLeagueId] = useState(localStorage.getItem('selectedLeagueId') || '0');
  const [selectedTeam, setSelectedTeam] = useState(localStorage.getItem('selectedTeam') ? JSON.parse(localStorage.getItem('selectedTeam')) : null);
  const [seasons, setSeasons] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const apiKey = process.env.REACT_APP_API_KEY;

  const storeSelectedValues = () => {
    localStorage.setItem('selectedYearId', selectedYearId);
    localStorage.setItem('selectedTeamId', selectedTeamId);
    localStorage.setItem('selectedLeagueId', selectedLeagueId);
    localStorage.setItem('selectedTeam', JSON.stringify(selectedTeam));
  };

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('./../seasons.json');
        const result = await response.json();
        setSeasons(result);
        if(selectedYearId){
          const matchSeason = result.find(season => season.year.id === parseInt(selectedYearId, 10));
          setSelectedYear(matchSeason.year);
          setLeagues(matchSeason.leagues);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchSeasons();
  }, []); 

  useEffect(() => {
    // const fetchTeams = async () => {
    //   try {
    //     const response = await axios.get(`https://v3.football.api-sports.io/teams?season=${selectedYear.date}&league=${selectedLeagueId}`, {
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

    fetchTeams();
  }, [apiKey, selectedYearId, selectedLeagueId]);

  useEffect(() => {
    storeSelectedValues();
  }, [selectedYearId, selectedLeagueId, selectedTeamId, selectedTeam]);

  const handleYearChange = (yearId) => {
    setSelectedYearId(yearId);
    const matchSeason = seasons.find(season => season.year.id === parseInt(yearId, 10));
    if (matchSeason) {
      setSelectedYear(matchSeason.year);
      setLeagues(matchSeason.leagues);
    }
    setSelectedLeagueId(0);
    setSelectedTeamId(0);
  };

  const handleLeagueChange = (leagueId) => {
    setSelectedLeagueId(leagueId);
    setSelectedTeamId(0);
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeamId(teamId);
    const team = teams.find(team => team.id === parseInt(teamId, 10));
    setSelectedTeam(team);
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
                  value={selectedYearId}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option>Select Season</option>
                  {seasons.map(season => (
                    <option key={season.year.id} value={season.year.id}>{season.year.name}</option>
                  ))}
                </select>

                <select
                  onChange={(e) => handleLeagueChange(e.target.value)}
                  value={selectedLeagueId}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  disabled={!selectedYearId}
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

                <Link to={`/${selectedYearId}/${selectedTeamId}`}
                  className={`text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ${selectedTeamId ? '' : 'opacity-25'}`}>Let's Quiz</Link>
              </div>
            </div>
          } />
          <Route path="/:selectedYearId/:selectedTeamId" element={selectedTeam && <Players team={{ season:selectedYear.name, country:selectedTeam.country, name:selectedTeam.name, logo:selectedTeam.logo}} />} />
          <Route path="/player/:playerId" element={<PlayerDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;