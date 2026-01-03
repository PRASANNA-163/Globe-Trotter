import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password required");
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
          <p className="subtitle">Login to continue your journey</p>

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

          <div className="row">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <span className="link">Forgot password?</span>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="primary-btn" onClick={handleLogin}>
            Log In
          </button>

          <p className="switch">
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
