import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
// import axios from "axios";

function PlayerDetail(){
  const {playerId} = useParams();
  const [player, setPlayer] = useState(null);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const monthName = monthNames[monthIndex];
    const year = date.getFullYear();
    return `${day} ${monthName} ${year}`;
  }

  const fetchPlayer = async () => {
    try {
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };
  
      const response = await fetch("http://localhost:3030/response", requestOptions);
      const result = await response.json();
      const player = result.find(item => item.player.id === parseInt(playerId, 10));
      setPlayer(player.player);
    } catch (error) {
      console.log("error", error);
    }
  };

  // const apiKey = process.env.REACT_APP_API_KEY;

  // const fetchPlayer = async () => {
  //   try {
  //     const response = await axios.get(`https://v3.football.api-sports.io/players?season=2019&id=${playerId}`, {
  //       headers: {
  //         'x-rapidapi-key': `${apiKey}`,
  //         'x-rapidapi-host': 'v3.football.api-sports.io'
  //       }
  //     });
  //     setPlayer(response.data.response[0].player);
  //   } catch (error) {
  //     console.error("Error fetching player:", error);
  //   }
  // };

  useEffect(() => {
    fetchPlayer();
  }, []);

  return(
      <div className="px-4 py-4 grid place-content-center min-h-screen">
        {player && (
          <div className="max-w-sm rounded shadow-lg grid bg-white mx-auto grid-cols-2">
            <img src={player.photo} alt={player.name} className="rounded-s" />
            <div className="grid place-content-center px-4 text-center">
              <div>{player.name}</div>
              <div>({player.age})</div>
              <div>{formatDate(player.birth.date)}</div>
              <div>{player.nationality}</div>
            </div>
          </div>
        )}
      </div>
  )
}

export default PlayerDetail;