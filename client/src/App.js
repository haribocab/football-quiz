import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import axios from "axios";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";

function App() {
  const [selectedYear, setSelectedYear] = useState(0)
  const [selectedTeamId, setSelectedTeamId] = useState(0);
  const [selectedCountryId, setSelectedCountryId] = useState(0);
  const [selectedLeagueIds, setSelectedLeagueIds] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [countries, setCountries] = useState([]);
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

        console.log(selectedLeagueIds);
    
        const response = await fetch("http://localhost:3031/response", requestOptions);
        const result = await response.json();
        setTeams(result.map(team => team.team));
      } catch (error) {
        console.log("error", error);
      }
    };

    // const fetchTeams = async () => {
    //   try {
    //     const response = await axios.get(`https://v3.football.api-sports.io/teams?season=${selectedYear}&league=${selectedLeagueId}`, {
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

  }, [apiKey, selectedLeagueIds, selectedYear]);


  const handleYearChange = (year) => {
    setSelectedYear(year);
    const matchedSeason = seasons.find(season => season.year.id === parseInt(year, 10));
    setCountries(matchedSeason.countries);
  };

  const handleCountryChange = (countryId) => {
    setSelectedCountryId(countryId);
    const matchedCountry = countries.find(country => country.id === countryId);
    setSelectedLeagueIds(matchedCountry.leagues.map(league => league.id));
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeamId(teamId);
    setSelectedTeam(teams.find(team => team.id === parseInt(teamId, 10)));
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
                    <option key={season.year.id} value={season.year.id}>{season.year.name}</option>
                  ))}
                </select>
                
                <select 
                onChange={(e) => handleCountryChange(e.target.value)} 
                value={selectedCountryId}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                disabled={!selectedYear}
                >
                  <option>Select Country</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>

                <select 
                onChange={(e) => handleTeamChange(e.target.value)} 
                value={selectedTeamId}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                disabled={!selectedCountryId}
                >
                  <option>Select Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                
                <Link to={`/${selectedYear}/${selectedTeamId}`} 
                className={`text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ${selectedTeamId ? '' : 'opacity-25'}`}>Let's Quiz</Link>
              </div>
            </div>
          } />
          <Route path="/:selectedYear/:selectedTeamId" element={<Players teamName={selectedTeam.name} />} />
          <Route path="/player/:playerId" element={<PlayerDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;