import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import News from "./pages/News.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Home />} />
      <Route path="/news" element={<News />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
