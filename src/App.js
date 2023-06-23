import React, { useState } from 'react';
import './App.css';
import Player from './Player.js';

const WHITE = 1, BLACK = 0;

function App() {
  const [whitePlayers, setWhitePlayers] = useState([]);
  const [blackPlayers, setBlackPlayers] = useState([]);
  const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
  const [curScreen, setCurScreen] = useState("PAIRING");
  const [leaderboard, setLeaderboard] = useState([]);
  const [board1, setBoard1] = useState(1);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [score, setScore] = useState(0);
  const [org, setOrg] = useState('');

  const fileChangeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsFilePicked(true);
	};

  function compareByScore(a, b){
    if (a.score === b.score){
      return b.rating - a.rating;
    }
    return b.score - a.score;
  }

  const handleSubmission = () => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const contents = e.target.result;
      const jsonData = JSON.parse(contents);
      
      // Do something with the parsed JSON data
      console.log(jsonData);

      const newBoard = [];

      for (var key in jsonData){
        newBoard.push(jsonData[key]);
      }
      newBoard.sort(compareByScore);

      setLeaderboard(newBoard);
    };

    reader.readAsText(selectedFile);
  };

  const switchScreen = () => {
    if (curScreen === "PAIRING"){
      setCurScreen("SCOREBOARD");
    }
    else{
      setCurScreen("PAIRING");
    }
  }

  const toPrint = () => {
    setCurScreen("PRINT");
  }

  const removePlayers = () => {
    const ele = document.querySelectorAll('#center div');
    var ind = -1;
    var newPlayers = [];
    console.log(ele);

    ele.forEach((div) => {
      if (ind >= 0){
        var boxScore = div.getElementsByClassName('scorebox')[0].value;
        if (boxScore !== '1'){
          newPlayers.push(leaderboard[ind]);
        }
      } 
      
      ind++;
    })
    setLeaderboard(newPlayers);
  }

  const addPlayer = () => {
    const newP = {
      name: name,
      opps: [],
      score: score,
      org: org,
      numWhite: 0,
      numBlack: 0,
      rating: rating
    }
    setLeaderboard(leaderboard.concat(newP));

    console.log(leaderboard);
  }

  const exportLeaderboard = () => {
    console.log(leaderboard);
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(leaderboard)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data.json";

    link.click();
  }

  const findPlayer = (name) => {
    for (var i=0; i<leaderboard.length; i++){
      if (leaderboard[i].name === name){
        return i;
      }
    }
    return -1;
  }
  
  const updateLeaderboard = () => {
    const ele = document.querySelectorAll('#flex-child div');
    const newPlayers = leaderboard;

    console.log(newPlayers);

    ele.forEach((div) => {
      var boxScore = parseFloat(div.getElementsByClassName('scorebox')[0].value);
      var line = div.innerText;
      var ind = line.indexOf("[");
      var ind2 = line.indexOf("]")
      var name = line.substring(0, ind-1);
      var points = parseFloat(line.substring(ind+1, ind2));
      newPlayers[findPlayer(name)].score = points+boxScore;
    });
    
    newPlayers.sort(compareByScore);
    setLeaderboard(newPlayers);
  }

  const getColorDue = (player) => {
    if (player.numWhite > player.numBlack) return BLACK;
    if (player.numBlack > player.numWhite) return WHITE;
    if (Math.random() < 0.5) return WHITE;
    return BLACK;
  }

  const hasPlayed = (p1, p2) => {
    for (var i=0; i<p1.opps.length; i++){
      if (p1.opps[i] === p2.name) return true;
    }
    return false;
  }

  const pairRound = () => {
    const white = [];
    const black = [];
    const used = new Array(leaderboard.length).fill(0);

    for (var i=0; i<leaderboard.length; i++){
      if (used[i] !== 0) continue; //already paired
      const pDue = getColorDue(leaderboard[i]);
      const curPlayer = leaderboard[i];

      //next player with same score, opposite color, diff org
      for (var k=i+1; k<leaderboard.length; k++){
        const oppPlayer = leaderboard[k];
        if (used[k] !== 0) continue; //already paired
        if (oppPlayer.score !== curPlayer.score) break; //different score
        if (oppPlayer.org === curPlayer.org) continue; // same org
        if (getColorDue(oppPlayer) === pDue) continue; // same color
        if (hasPlayed(curPlayer, oppPlayer)) continue; //already played

        if (pDue === WHITE){
          curPlayer.numWhite ++;
          oppPlayer.numBlack ++;
          white.push(curPlayer);
          black.push(oppPlayer);
        }
        else{
          curPlayer.numBlack ++;
          oppPlayer.numWhite ++;
          black.push(curPlayer);
          white.push(oppPlayer);
        }
        
        curPlayer.opps.push(oppPlayer.name);
        oppPlayer.opps.push(curPlayer.name);
        used[i] = 1;
        used[k] = 1;
        break;
      }
      if (used[i] !== 0) continue; //already paired
      
      //next player that has opposite color and same score
      for (k=i+1; k<leaderboard.length; k++){
        const oppPlayer = leaderboard[k];
        if (used[k] !== 0) continue; //already paired
        if (oppPlayer.score !== curPlayer.score) break; //different score
        if (getColorDue(oppPlayer) === pDue) continue; // same color
        if (hasPlayed(curPlayer, oppPlayer)) continue; //already played
        if (pDue === WHITE){
          curPlayer.numWhite ++;
          oppPlayer.numBlack ++;
          white.push(curPlayer);
          black.push(oppPlayer);
        }
        else{
          curPlayer.numBlack ++;
          oppPlayer.numWhite ++;
          black.push(curPlayer);
          white.push(oppPlayer);
        }

        curPlayer.opps.push(oppPlayer.name);
        oppPlayer.opps.push(curPlayer.name);
        used[i] = 1;
        used[k] = 1;
        break;
      }
      if (used[i] !== 0) continue; //already paired

      //next player that has same score
      for (k=i+1; k<leaderboard.length; k++){
        const oppPlayer = leaderboard[k];
        if (used[k] !== 0) continue; //already paired
        if (oppPlayer.score !== curPlayer.score) break; //different score
        if (hasPlayed(curPlayer, oppPlayer)) continue; //already played
        if (pDue === WHITE){
          curPlayer.numWhite ++;
          oppPlayer.numBlack ++;
          white.push(curPlayer);
          black.push(oppPlayer);
        }
        else{
          curPlayer.numBlack ++;
          oppPlayer.numWhite ++;
          black.push(curPlayer);
          white.push(oppPlayer);
        }

        curPlayer.opps.push(oppPlayer.name);
        oppPlayer.opps.push(curPlayer.name);
        used[i] = 1;
        used[k] = 1;
        break;
      }
      if (used[i] !== 0) continue; //already paired

      //next player that has opp color and diff score by max(0.5)
      for (k=i+1; k<leaderboard.length; k++){
        const oppPlayer = leaderboard[k];
        if (used[k] !== 0) continue; //already paired
        if (Math.abs(oppPlayer.score - curPlayer.score) > 0.5) break; //different score by too much
        if (getColorDue(oppPlayer) === pDue) continue; // same color
        if (hasPlayed(curPlayer, oppPlayer)) continue; //already played
        if (pDue === WHITE){
          curPlayer.numWhite ++;
          oppPlayer.numBlack ++;
          white.push(curPlayer);
          black.push(oppPlayer);
        }
        else{
          curPlayer.numBlack ++;
          oppPlayer.numWhite ++;
          black.push(curPlayer);
          white.push(oppPlayer);
        }

        curPlayer.opps.push(oppPlayer.name);
        oppPlayer.opps.push(curPlayer.name);
        used[i] = 1;
        used[k] = 1;
        break;
      }
      if (used[i] !== 0) continue; //already paired

      //next player that has diff score by max(0.5)
      for (k=i+1; k<leaderboard.length; k++){
        const oppPlayer = leaderboard[k];
        if (used[k] !== 0) continue; //already paired
        if (Math.abs(oppPlayer.score - curPlayer.score) > 0.5) break; //different score by too much
        if (hasPlayed(curPlayer, oppPlayer)) continue; //already played
        if (pDue === WHITE){
          curPlayer.numWhite ++;
          oppPlayer.numBlack ++;
          white.push(curPlayer);
          black.push(oppPlayer);
        }
        else{
          curPlayer.numBlack ++;
          oppPlayer.numWhite ++;
          black.push(curPlayer);
          white.push(oppPlayer);
        }

        curPlayer.opps.push(oppPlayer.name);
        oppPlayer.opps.push(curPlayer.name);
        used[i] = 1;
        used[k] = 1;
        break;
      }
      if (used[i] !== 0) continue; //already paired

      //next player that has diff score by max(1) and opposite color
      for (k=i+1; k<leaderboard.length; k++){
        const oppPlayer = leaderboard[k];
        if (used[k] !== 0) continue; //already paired
        if (Math.abs(oppPlayer.score - curPlayer.score) > 1) break; //different score by too much
        if (getColorDue(oppPlayer) === pDue) continue; // same color
        if (hasPlayed(curPlayer, oppPlayer)) continue; //already played
        if (pDue === WHITE){
          curPlayer.numWhite ++;
          oppPlayer.numBlack ++;
          white.push(curPlayer);
          black.push(oppPlayer);
        }
        else{
          curPlayer.numBlack ++;
          oppPlayer.numWhite ++;
          black.push(curPlayer);
          white.push(oppPlayer);
        }

        curPlayer.opps.push(oppPlayer.name);
        oppPlayer.opps.push(curPlayer.name);
        used[i] = 1;
        used[k] = 1;
        break;
      }
      if (used[i] !== 0) continue; //already paired

      //next player
      for (k=i+1; k<leaderboard.length; k++){
        const oppPlayer = leaderboard[k];
        if (used[k] !== 0) continue; //already paired
        if (hasPlayed(curPlayer, oppPlayer)) continue; //already played
        if (pDue === WHITE){
          curPlayer.numWhite ++;
          oppPlayer.numBlack ++;
          white.push(curPlayer);
          black.push(oppPlayer);
        }
        else{
          curPlayer.numBlack ++;
          oppPlayer.numWhite ++;
          black.push(curPlayer);
          white.push(oppPlayer);
        }

        curPlayer.opps.push(oppPlayer.name);
        oppPlayer.opps.push(curPlayer.name);
        used[i] = 1;
        used[k] = 1;
        break;
      }

    }
    setWhitePlayers(white);
    setBlackPlayers(black);
  }

  function pairingBoard(){
    return  (
      <div>
        <div id = 'flex-container'>
          <div id='flex-child'>
            <h1>White</h1>
            {whitePlayers.map((item, index) => (
              <Player details = {item}></Player>
            ))}
          </div>

          <div id='flex-child'>
            <h1>Black</h1>
            {blackPlayers.map((item, index) => (
              <Player details = {item}></Player>
            ))}
          </div>
        </div>      

        <button className="button" id='first' onClick={switchScreen}>Scoreboard</button>
        <button className="button" id='second' onClick={toPrint}>Go to Print Sheet</button>
        <button className='button' id='third' onClick={pairRound}>Pair</button>
        <button className='button' id='right1' onClick={updateLeaderboard}>Update</button>

      </div>
    );
  }

  function scoreBoard(){
    return (
      <div>
        <h1 id='center'>Leaderboard</h1>
        <div id='center'>
          <div id='flex-child'>
            {leaderboard.map((item, index) => (
              <Player details = {item} rank = {index}></Player>
            ))}
          </div>
        </div>

        <button className="button" id='first' onClick={switchScreen}>Go to Pairings Sheet</button>
        <button className="button" id='second' onClick={toPrint}>Go to Print Sheet</button>
        <button className='button' id='third' onClick={pairRound}>Pair</button>
        <button className='button' id='fourth' onClick={removePlayers}>Remove</button>
        <button className='button' id='fifth' onClick={addPlayer}>Add</button>

        <h3 className='labels' id='first'>Name</h3>
        <h3 className='labels' id='second'>Rating</h3>
        <h3 className='labels' id='third'>Score</h3>
        <h3 className='labels' id='fourth'>Org</h3>

        <input  className='textfield' type='text' value={name} id='first' onChange={(event) => setName(event.target.value)}></input>
        <input  className='textfield' type='text' value={rating} id='second' onChange={(event) => setRating(event.target.value)}></input>
        <input  className='textfield' type='text' value={score} id='third' onChange={(event) => setScore(event.target.value)}></input>
        <input  className='textfield' type='text' value={org} id='fourth' onChange={(event) => setOrg(event.target.value)}></input>

        <div>
          <input type="file" name="file" id='right1' onChange={fileChangeHandler} />
            <div>
              <button className='button' id = 'right2' onClick={handleSubmission}>Import Leaderboard</button>
            </div>
        </div>
        <button className='button' type="button" id = 'right1' onClick={exportLeaderboard}>Export Leaderboard</button>
      </div>
    );
  }

  function printSheet(){
    return (
      <div>
        <div id = 'flex-container2'>
          <div id='flex-child2' >
            {whitePlayers.map((item, index) => (
              <h1 className='boardnum'>{parseInt(board1)+parseInt(index)}</h1>
            ))}
          </div>
          <div id='flex-child'>
            {whitePlayers.map((item, index) => (
              <Player details = {item}></Player>
            ))}
          </div>

          <div id='flex-child'>
            {blackPlayers.map((item, index) => (
              <Player details = {item}></Player>
            ))}
          </div>
        </div>     

        <button className="button" onClick={switchScreen}>Go to Pairings Sheet</button>
        <input type='text' value={board1} onChange={(event) => setBoard1(event.target.value)}></input>
        <button className='button' id='right1' onClick={updateLeaderboard}>Update</button>
      </div>
    )
    
  }

  function display(){
    if (curScreen === "PAIRING"){
      return pairingBoard();
    }
    if (curScreen === "SCOREBOARD"){
      return scoreBoard();
    }
    if (curScreen === "PRINT"){
      return printSheet();
    }
  }

  return (
    <div>
      {
        display()
      }
    </div>
  );
}

export default App;
