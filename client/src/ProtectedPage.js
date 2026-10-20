
import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";

export default function ProtectedPage() {
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ password: pass })
      });

      if (res.ok) {
        setOk(true);
        setPass("");
      } else {
        setOk(false);
        setError("Incorrect password");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fromDate) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/download?from=${encodeURIComponent(fromDate)}`,
        {
          method: "GET",
          credentials: "include"
        }
      );

      if (res.status === 401) {
        setOk(false);
        setError("Your session expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        throw new Error("Download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const today = new Date().toISOString().split("T")[0];
      link.download = `KIND-${today}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {
      setError("Unable to download the file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: 400,
    margin: "450px auto 0",
    padding: "30px",
    paddingBottom: "120px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontFamily: "Arial, sans-serif"
  };

  const buttonStyle = {
    padding: "10px 15px",
    background: "#007ACC",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  };

  if (!ok) {
    return (
      <div style={containerStyle}>
        <Header />

        <h2>Enter password</h2>

        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              handleLogin();
            }
          }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginBottom: "15px",
            boxSizing: "border-box"
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Checking..." : "Enter"}
        </button>

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <Footer />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Header />

      <h2>Protected page</h2>

      <label
        htmlFor="fromDate"
        style={{ fontWeight: "bold" }}
      >
        Select start date:
      </label>

      <input
        id="fromDate"
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "15px",
          marginTop: "5px",
          boxSizing: "border-box"
        }}
      />

      <button
        onClick={handleDownload}
        disabled={!fromDate || loading}
        style={{
          ...buttonStyle,
          background:
            fromDate && !loading ? "#007ACC" : "#999",
          cursor:
            fromDate && !loading
              ? "pointer"
              : "not-allowed"
        }}
      >
        {loading
          ? "Downloading..."
          : "Download registration"}
      </button>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      <Footer />
    </div>
  );
}
