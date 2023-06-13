import React, { useState } from 'react';

function Player({ details, rank }) {
  const [info, setInfo] = useState(details);
  const [text, setText] = useState('');
  const [r, setRank] = useState(rank);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const red = {
    color: "red"
  }
  const black = {
    color: "black"
  }
  const green = {
    color: "green"
  }
  const yellow = {
    color: "yellow"
  }

  return (
    <div>
        <h3 className='player' style={text === '0' ? black : text === '1' ? green : text === '0.5' ? yellow : red}>
            {r != null ? '('+(r+1)+') ' : ''}
            {info.name +' '}
            {/* {'('+info.org+') '} */}
            {'['+info.score+']'}
            <input className='scorebox' type="text" value={text} onChange={handleChange} />
        </h3>
    </div>
  );
}

export default Player;
