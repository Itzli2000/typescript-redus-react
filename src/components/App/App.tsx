import React from 'react';
import Calendar from '../Calendar/Calendar';
import Recorder from '../Recorder/Recorder';
import './App.css';

function App() {
  return (
    <>
      <Recorder />
      <div className="calendar">
        <Calendar />
      </div>
    </>
  );
}

export default App;
