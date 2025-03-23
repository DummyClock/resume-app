import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication tokens or session data
    localStorage.removeItem("token");
    // Redirect to landing page
    navigate("/");
  };

  return (
    <div className="home-container">
      <nav className="home-nav">
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </nav>
      <main className="home-content">
        <h1>Welcome</h1>
        <p>Hello World!</p>
      </main>
    </div>
  );
};

export default Home;
