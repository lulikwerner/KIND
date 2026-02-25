import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppMain from "./AppMain";
import ProtectedPage from "./ProtectedPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main page */}
        <Route path="/" element={<AppMain />} />

        {/* Protected page*/}
        <Route path="/login" element={<ProtectedPage />} />
      </Routes>
    </Router>
  );
}

export default App;
