import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useParams } from "react-router-dom";

function Players() {
  const [players, setPlayers] = useState([]);
  const {selectedYear, selectedTeam} = useParams();
  const [timer, setTimer] = useState(10);

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
  //     console.log(response.data);
  //     const result = response.data.response;
  //     setPlayers(result.map(player => player.player));
  //   } catch (error) {
  //     console.error("Error fetching players:", error);
  //   }
  // };
  
  useEffect(() => {
    fetchPlayers();

    let interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(interval);
        }
        return prevTimer - 1;
      });
    }, 1000);
  }, []);

  return (<>
    <div className="fixed top-0 right-0 flex justify-center mt-4 mr-4">
      <div class="rounded shadow-lg bg-white">
        {selectedYear} {selectedTeam}
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-5 gap-9 px-4 py-4">
      {players.map((player) => (
        <Link key={player.id} to={`/player/${player.id}`} className="rounded shadow-lg grid bg-white hover:scale-105 transition">
            <img src={player.photo} alt="" className="rounded" width="150" height="150" />
        </Link>
      ))}
    </div>

    <div className="fixed bottom-0 left-0 right-0 flex justify-center mb-4">
        <div className="w-64 bg-gray-300">
          <div className="h-4 bg-blue-500" style={{ width: `${(timer / 10) * 100}%` }} />
        </div>
      </div>
  </>);
}

export default Players;