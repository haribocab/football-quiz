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
  
      if (process.env.NODE_ENV === 'development') {
        // Fetch data from the local JSON file in development
        const response = await fetch("http://localhost:3030/response");
        const result = await response.json();
        playersData = result.map(player => player.player);
      } else {
        // Fetch data from the API in production
        const response = await axios.get(
          `https://v3.football.api-sports.io/players?season=${selectedYear}&team=${selectedTeamId}`, 
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
  
  return (<>
    <div className={"w-screen place-content-center grid py-4"}>
      {!quizStarted ? (
        <button onClick={handleStartQuiz}
        className="text-center bg-white text-blue-700 font-semibold hover:scale-105 py-2 px-4 border border-blue-500 rounded"
        >Start Quiz</button>
      ) : (
       <button onClick={handleShowAnswer}
        className="text-center bg-white text-blue-700 font-semibold hover:scale-105 py-2 px-4 border border-blue-500 rounded"
        >Show Answer</button>
      )}
    </div>

    {showAnswer && (
      <div className="fixed h-screen w-screen flex items-center justify-center z-10">
        <div className="rounded shadow-xl bg-white p-10 pointer-events-auto text-center">
          <div className="grid mb-6">
              <div>{team.season.name}</div>
              <div>{team.country}</div>
              <div>{team.name}</div>
              <img src={team.logo} alt={team.name} />
          </div>
          <Link 
          to={`/`} 
          className="text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Once More Quiz</Link>
        </div>
      </div>
    )}

    <div className="max-w-4xl mx-auto min-h-screen place-content-center">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-8 px-4 py-4">
        {players.map((player) => (
          <Link key={player.id} to={`/player/${selectedYear}/${player.id}`} className="rounded shadow-lg grid hover:scale-105 transition truncate relative">
             {!quizStarted && <div className="bg-gray grid place-content-center absolute w-full h-full bg-emerald-300">?</div>}
             <img src={player.photo} alt={player.name} className="rounded" width="150" height="150" /> 
          </Link>
        ))}
      </div>
    </div>
  </>);
}

export default Players;