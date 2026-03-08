import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ParkDetail from './pages/ParkDetail';
import ParkReviews from './pages/ParkReviews';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/park/:id" element={<ParkDetail />} />
          <Route path="/park/:id/reviews" element={<ParkReviews />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
