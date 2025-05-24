import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameSocket } from './utils/GameSocket';

import HomePage from './pages/HomePage';
import PlayArea from './pages/PlayArea';

function App() {
  return (
    <GameSocket>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayArea />} />
        </Routes>
      </BrowserRouter>
    </GameSocket>
  );
}

export default App;
