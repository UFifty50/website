import React from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Home from "./pages/home";
import Scrapbook from "./pages/Scrapbook";

class App extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <Router>
        <div className="layout flex items-center justify-between bg-[#141414] p-4 text-white selection:bg-zinc-300 selection:text-black">
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-zinc-400">
              Home
            </Link>
            <Link to="/scrapbook" className="hover:text-zinc-400">
              My Hack-Club scrapbook
            </Link>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scrapbook" element={<Scrapbook />} />
        </Routes>
      </Router>
    );
  }
}

export default App;
