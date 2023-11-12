import "./App.css";
import NoteBook from "./NoteBook";
import { Route, Routes } from "react-router-dom";
import Upload from "./Upload";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<NoteBook />} />
        <Route path="/admin" element={<Upload />} />
      </Routes>
    </>
  );
}

export default App;
