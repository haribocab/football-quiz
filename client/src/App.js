import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import PlayerDetail from "./pages/PlayerDetail";

function App() {
  const [players, setPlayers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2019);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const fetchPlayers = async () => {
    try {
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };
  
      const response = await fetch("http://localhost:3030/response", requestOptions);
      const result = await response.json();
      setPlayers(result.map(player => player.player));
    } catch (error) {
      console.log("error", error);
    }
  };

  // const apiKey = process.env.REACT_APP_API_KEY;
  // const fetchPlayers = async () => {
  //   try {
  //     const response = await axios.get(`https://v3.football.api-sports.io/players?season=${selectedYear}&team=${selectedTeam}`, {
  //       headers: {
  //         'x-rapidapi-key': `${apiKey}`,
  //         'x-rapidapi-host': 'v3.football.api-sports.io'
  //       }
  //     });
  //     const result = response.data.response;
  //     setPlayers(result.map(player => player.player));
  //   } catch (error) {
  //     console.error("Error fetching players:", error);
  //   }
  // };
  
  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <Router>
      <div className="App bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-9 px-4 py-4">
                {players.map((player) => (
                  <Link key={player.id} to={`/player/${player.id}`} className="rounded shadow-lg grid bg-white hover:scale-105 transition">
                    <h2 className="my-2">{player.name}</h2>
                    <img src={player.photo} alt="" className="rounded-b" width="150" height="150" />
                  </Link>
                ))}
              </div>
            } />
            <Route path="/player/:playerId" element={<PlayerDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;