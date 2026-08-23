import { Routes, Route, Navigate } from "react-router-dom";
import Portfolio from "@/pages/Portfolio";
import SocialHome from "@/pages/SocialHome";
import Posts from "@/pages/Posts";
import News from "@/pages/News";
import SocialLinks from "@/pages/SocialLinks";
import Profile from "@/pages/Profile";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/social" element={<SocialHome />} />
      <Route path="/social/posts" element={<Posts />} />
      <Route path="/social/noticias" element={<News />} />
      <Route path="/social/redes-sociales" element={<SocialLinks />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
