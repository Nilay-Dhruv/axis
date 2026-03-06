import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="flex items-center justify-center h-screen bg-slate-900 text-white text-4xl font-bold">AXIS — Day 1 ✅</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App