import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SessionPage from "./pages/SessionPage";
import DrawingBoard from "./components/DrawingBoard";

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false}
      toastOptions={{
        duration: 1500, //  (1.5s)
      }}
       />
      <Routes>
       <Route path="/" element={<SessionPage />} /> 
        {/* <Route path="/" element={<DrawingBoard />} /> */}
        <Route path="/draw/:sessionId" element={<DrawingBoard />} /> 
      </Routes>
    </Router>
  );
};

export default App;


