import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";

function App() {
  const [selectedYear, setSelectedYear] = useState(2018);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [seasons, setSeasons] = useState([]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedTeam(null);
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
  };

  const fetchSeasons = async () => {
    try {
      const response = await fetch('./../seasons.json');
      const result = await response.json();
      setSeasons(result);
      console.log(result);
    } catch (error) {
      console.log("error", error);
    }
  }

  useEffect(() => {
    fetchSeasons();
  }, []);

  return (
    <Router>
      <div className="bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="px-4 py-4 grid place-content-center min-h-screen">
                <div className="w-64 rounded shadow-lg grid bg-white p-4 gap-2">
                  <ul className="grid gap-2">
                    {seasons.map(season => (
                      <li key={season.year} onClick={() => handleYearChange(season.year)}
                          className={`text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ${selectedYear === season.year ? 'bg-blue-500 text-white' : ''}`}>{season.year}</li>
                    ))}
                  </ul>
               
                  {selectedYear &&(
                    <ul className="grid gap-2">
                      {seasons.find(season => season.year === selectedYear)?.teams.map(team => (
                        <li key={team.id} onClick={() => handleTeamChange(team.id)} 
                            className={`text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ${selectedTeam === team.id ? 'bg-blue-500 text-white' : ''}`}>{team.name}</li>
                      ))}
                    </ul>
                  )}
        
                  <Link to={`/${selectedYear}/${selectedTeam}`} 
                  className={`text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ${selectedTeam ? '' : 'opacity-25'}`}>Create a quiz ({selectedYear} {selectedTeam})</Link>
                </div>
              </div>
            } />
            <Route path="/:selectedYear/:selectedTeam" element={<Players />} />
            <Route path="/player/:playerId" element={<PlayerDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;