import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PlayerDetail(){
  const {selectedYear, playerId} = useParams();
  const [player, setPlayer] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY;

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
      let playerData;
      
      if (process.env.REACT_APP_SOURCE === "local") {
        // Fetch data from the local JSON file in development
        const response = await fetch(`${process.env.REACT_APP_SOURCE_LOCAL}/response`);
        const result = await response.json();
        playerData = result.find(item => item.player.id === parseInt(playerId, 10)).player;
      } else {
        // Fetch data from the API in production
          const response = await axios.get(
          `${process.env.REACT_APP_SOURCE_API}/players?season=${selectedYear}&id=${playerId}`,
          {
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': 'v3.football.api-sports.io',
            },
          }
        );
        playerData = response.data.response[0].player;
      }

      setPlayer(playerData);
      console.log("Fetched player details");
    } catch (error) {
      console.error("Error fetching player:", error);
    }
  };
  
  useEffect(() => {
    fetchPlayer();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6">
      {player && (
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center p-6 gap-6">
            {/* Player Photo */}
            <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
              <img 
                src={player.photo} 
                alt={player.name} 
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Player Info */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {player.name}
              </h2>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>{player.nationality}</span>
                <span>•</span>
                <span>{player.age} Years</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Birth Date
              </label>
              <p className="text-sm text-slate-600 font-medium">
                {formatDate(player.birth.date)}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Place of Birth
              </label>
              <p className="text-sm text-slate-600 font-medium truncate">
                {player.birth.place || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="p-4 bg-white">
            <button 
              onClick={() => window.history.back()}
              className="w-full py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              ← Back to Squad
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;