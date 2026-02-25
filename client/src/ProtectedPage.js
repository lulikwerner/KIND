import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";

export default function ProtectedPage() {
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState(""); // <-- NUEVO

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
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
    if (!fromDate) return; 
    window.location.href = `/download?from=${fromDate}`;
  };

  const containerStyle = {
    maxWidth: 400,
    margin: "450px auto 0",
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

      <label style={{ fontWeight: "bold" }}>Select start date:</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "15px",
          marginTop: "5px"
        }}
      />

      <button
        onClick={handleDownload}
        disabled={!fromDate}
        style={{
          padding: "10px 15px",
          background: fromDate ? "#007ACC" : "#999",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: fromDate ? "pointer" : "not-allowed"
        }}
      >
        Download registration
      </button>

      <Footer />
    </div>
  );
}
