import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useParams } from "react-router-dom";

function Players({ team }) {
  const [players, setPlayers] = useState(JSON.parse(localStorage.getItem("players")) || []);
  const {selectedYear, selectedTeamId} = useParams();
  const [timer, setTimer] = useState(10);
  const [quizStarted, setQuizStarted] = useState(localStorage.getItem("quizStarted") === "true" ? true : false);
  const [timerFinished, setTimerFinished] = useState(localStorage.getItem("timerFinished") === "true" ? true : false);
  const [showAnswer, setShowAnswer] = useState(localStorage.getItem("showAnswer") === "true" ? true : false)
  const apiKey = process.env.REACT_APP_API_KEY;

  const fetchPlayers = async () => {
    try {
      let playersData;
  
      if (process.env.REACT_APP_SOURCE === "local") {
        // Fetch data from the local JSON file in development
        const response = await fetch(process.env.REACT_APP_SOURCE_LOCAL + '/response');
        const result = await response.json();
        playersData = result.map(player => player.player);
      } else {
        // Fetch data from the API in production
        const response = await axios.get(
          process.env.REACT_APP_SOURCE_API +
          `/players?season=${selectedYear}&team=${selectedTeamId}`, 
          {
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': 'v3.football.api-sports.io',
            },
          }
        );
        const result = response.data.response;
        playersData = result.map(player => player.player);
      }
  
      setPlayers(playersData);
      localStorage.setItem("players", JSON.stringify(playersData));
      console.log("Fetched players");
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };  

  useEffect(() => {
    if (players.length === 0) {
      fetchPlayers();
    }
  }, [players]);

  useEffect(() => {
    if (!timerFinished & quizStarted) {
      let interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 0) {
            clearInterval(interval);
            setTimerFinished(true);
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    localStorage.setItem("quizStarted", quizStarted);
    localStorage.setItem("timerFinished", timerFinished);

    localStorage.setItem("showAnswer", showAnswer);
  }, [quizStarted, timerFinished, showAnswer]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleShowAnswer = () => {
    if(showAnswer) {
      setShowAnswer(false);
    } else {
      setShowAnswer(true);
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-800">
      {/* --- Header / Controls --- */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 mb-8">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400">Quiz Mode</h2>
          
          {!quizStarted ? (
            <button 
              onClick={handleStartQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-lg transition-all shadow-sm shadow-blue-100"
            >
              Start Quiz
            </button>
          ) : (
            <button 
              onClick={handleShowAnswer}
              className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold py-2 px-6 rounded-lg transition-all shadow-sm"
            >
              Show Answer
            </button>
          )}
        </div>
      </div>

      {/* --- Answer Modal --- */}
      {showAnswer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          {/* 背景のオーバーレイ */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Correct Answer</span>
            
            <div className="my-6 flex flex-col items-center">
              <img src={team.logo} alt={team.name} className="w-24 h-24 object-contain mb-4" />
              <h3 className="text-2xl font-bold text-slate-800">{team.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{team.country} • {team.season.name}</p>
            </div>

            <Link 
              to="/" 
              className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
            >
              Once More Quiz
            </Link>
          </div>
        </div>
      )}

      {/* --- Players Grid --- */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-6">
          {players.map((player) => (
            <Link 
              key={player.id} 
              to={`/player/${selectedYear}/${player.id}`} 
              className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 transition-all hover:border-blue-400 hover:shadow-md"
            >
              {/* Overlay before quiz starts */}
              {!quizStarted && (
                <div className="absolute inset-0 z-10 bg-slate-100 flex items-center justify-center text-slate-300 font-black text-2xl">
                  ?
                </div>
              )}
              
              <div className="aspect-square w-full bg-slate-50">
                <img 
                  src={player.photo} 
                  alt={player.name} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                  loading="lazy"
                />
              </div>
              
              {/* Optional: 名前を隠す場合はここを調整 */}
              <div className="p-2 bg-white">
                <div className="h-1 w-8 bg-slate-100 rounded-full group-hover:bg-blue-400 transition-colors"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Players;