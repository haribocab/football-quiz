import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";

function App() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedTeam(null);
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
  };

  const btnClass = 'text-center bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded';

  return (
    <Router>
      <div className="bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="px-4 py-4 grid place-content-center min-h-screen">
                <div className="w-64 rounded shadow-lg grid bg-white p-4 gap-2">
                  <ul className="grid gap-2">
                    <li onClick={() => handleYearChange(2018)}
                        className={`${btnClass} ${selectedYear === 2018 ? 'bg-blue-500 text-white' : ''}`}>2018</li>
                    <li onClick={() => handleYearChange(2019)}
                        className={`${btnClass} ${selectedYear === 2019 ? 'bg-blue-500 text-white' : ''}`}>2019</li>
                    <li onClick={() => handleYearChange(2020)}
                        className={`${btnClass} ${selectedYear === 2020 ? 'bg-blue-500 text-white' : ''}`}>2020</li>
                  </ul>
    
                  <ul className="grid gap-2">
                    <li onClick={() => handleTeamChange(25)}
                        className={`${btnClass} ${selectedYear ? '' : 'opacity-25'} ${selectedTeam === 25 ? 'bg-blue-500 text-white' : ''}`}>Team 25</li>
                    <li onClick={() => handleTeamChange(26)} 
                        className={`${btnClass} ${selectedYear ? '' : 'opacity-25'} ${selectedTeam === 26 ? 'bg-blue-500 text-white' : ''}`}>Team 26</li>
                    <li onClick={() => handleTeamChange(27)} 
                        className={`${btnClass} ${selectedYear ? '' : 'opacity-25'} ${selectedTeam === 27 ? 'bg-blue-500 text-white' : ''}`}>Team 27</li>
                  </ul>

                  <Link to={`/${selectedYear}/${selectedTeam}`} 
                  className={`${btnClass} ${selectedTeam ? 'hover:scale-105' : 'opacity-25'}`}>Let's Quiz ({selectedYear} {selectedTeam})</Link>
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