// ProtectedPage.jsx
import { useState } from "react";

export default function ProtectedPage() {
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

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
    window.location.href = "/api/download";
  };

  if (!ok) {
    return (   
      <div>
           <Header />
        <h2>Enter password</h2>
        <input
          type="password"
          onChange={(e) => setPass(e.target.value)}
        />
        <button onClick={handleLogin}>Enter</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2>Protected page</h2>
      <button onClick={handleDownload}>
        Download registration
      </button>
      <Footer />
    </div>
  );
}
