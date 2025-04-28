import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import { UserProvider } from './UserContext';

function App() {
  const [user, setUser] = useState({ id: null });

  const unsetUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem("isAdmin");
    setUser({ id: null });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUserId) {
      setUser({ id: storedUserId });
    } else if (token) {
      fetch('https://fitnessapp-api-ln8u.onrender.com/users/details', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser({ id: data.user._id });
          localStorage.setItem('userId', data.user._id);
        } else {
          setUser({ id: null });
        }
      })
      .catch(() => setUser({ id: null }));
    }
  }, []);

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Router>
        <AppNavbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/getMovie/:id" element={<MovieDetails />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
