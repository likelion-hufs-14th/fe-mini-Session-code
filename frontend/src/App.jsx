/** 앱 라우팅 — 모든 페이지를 등록한다. */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavPage from "./pages/NavPage";
import HomePage from "./pages/HomePage";
import PaperPage from "./pages/PaperPage";
import FeedPage from "./pages/FeedPage";
import DetailPage from "./pages/DetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/paper" element={<PaperPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/feed/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
