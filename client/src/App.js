import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppMain from "./AppMain";
import ProtectedPage from "./ProtectedPage";
import LoginPage from "./LoginPage"; // ← tu formulario de login

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Page */}
        <Route path="/" element={<AppMain />} />

        {/* Login Page*/}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Page*/}
        <Route path="/dashboard" element={<ProtectedPage />} />

             {/* Download Page */}
        <Route path="/download" element={<ProtectedPage><DownloadPage /></ProtectedPage>} />
      </Routes>
    </Router>
  );
}

export default App;


