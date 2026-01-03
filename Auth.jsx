import { useState } from "react";
import "../styles/auth.css";

export default function Auth() {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        
        {/* LEFT IMAGE */}
        <div className="auth-image">
          {/* replace with your own image */}
        </div>

        {/* RIGHT FORM */}
        <div className="auth-form">
          <h2>Welcome!</h2>

          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Log In
            </button>
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />

          {mode === "login" && (
            <div className="row">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <span className="link">Forgot password?</span>
            </div>
          )}

          <button className="primary-btn">
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>

          <div className="divider">or</div>

          <div className="social">
            <button>Google</button>
            <button>Telegram</button>
          </div>
        </div>

      </div>
    </div>
  );
}
