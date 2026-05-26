import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import CreateArticle from "./pages/CreateArticle";
import EditArticle from "./pages/EditArticle";
import ArticleDetails from "./pages/ArticleDetails";
import Search from "./pages/Search";

function App() {
  return (
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />

    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/search" element={<Search />} />
    <Route path="/create" element={<CreateArticle />} />
    <Route path="/article/:id" element={<ArticleDetails />} />
    <Route path="/edit/:id" element={<EditArticle />} />
  </Routes>
</BrowserRouter>
  );
}

export default App;