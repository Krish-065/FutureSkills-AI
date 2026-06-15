import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);

      await API.post("/auth/signup", {
        name,
        email,
        password,
      });

      const loginRes =
        await API.post(
          "/auth/login",
          {
            email,
            password,
          }
        );

      localStorage.setItem(
        "token",
        loginRes.data.token
      );

      navigate("/dashboard");

    } catch (err) {

      alert(
        err.response?.data?.message ||
          "Signup Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Create Account</h1>

        <p>
          Join the AI Job Market
          Intelligence Platform
        </p>

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button onClick={handleSignup}>
          {loading
            ? "Creating..."
            : "Create Account"}
        </button>

        <div className="auth-link">
          Already have account?{" "}
          <Link to="/">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;