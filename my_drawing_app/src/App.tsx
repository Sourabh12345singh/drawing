import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DrawingPage from "./components/Drawingpage";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<DrawingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
