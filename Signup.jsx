import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    setError("");
    navigate("/home");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="auth-image"></div>

        <div className="auth-form">
          <h2>Welcome</h2>
          <p className="subtitle">Create your account</p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button className="primary-btn" onClick={handleSignup}>
            Sign Up
          </button>

          <p className="switch">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
