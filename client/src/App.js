import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppMain from "./AppMain";
import ProtectedPage from "./ProtectedPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<AppMain />} />

        {/* Login + protected content */}
        <Route path="/login" element={<ProtectedPage />} />

        {/* Download page uses the SAME component */}
        <Route path="/download" element={<ProtectedPage />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;



