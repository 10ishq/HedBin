import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/:productHash" element={<Home />} />
        <Route path="*" element={<h1>404 Invalid route</h1>} />
      </Routes>
    </Router>
  );
}
