import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";

export default function ProtectedPage() {
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass })
      });

      if (res.ok) {
        setOk(true);
        setError("");
      } else {
        setError("Incorrect password");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleDownload = () => {
    window.location.href = "/api/download";
  };

  const containerStyle = {
    maxWidth: 400,
    margin: "150px auto 0",
    paddingBottom: "120px",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontFamily: "Arial, sans-serif"
  };

  if (!ok) {
    return (
      <div style={containerStyle}>
        <Header />

        <h2>Enter password</h2>

        <input
          type="password"
          onChange={(e) => setPass(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginBottom: "15px"
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            padding: "10px 15px",
            background: "#007ACC",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Enter
        </button>
     
        {error && <p style={{ color: "red" }}>{error}</p>}
         <Footer />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2>Protected page</h2>

      <button
        onClick={handleDownload}
        style={{
          padding: "10px 15px",
          background: "#007ACC",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Download registration
      </button>

      <Footer />
    </div>
  );
}
