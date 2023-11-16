import "./App.css";
import NoteBook from "./NoteBook";
import { Route, Routes } from "react-router-dom";
import Upload from "./Upload";
import Login from "./Login";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <Box m="0" p="0">
      <Routes>
        <Route path="/" element={<NoteBook />} />
        <Route path="/admin" element={<Upload />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Box>
  );
}

export default App;
