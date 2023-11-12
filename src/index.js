import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ChakraBaseProvider } from "@chakra-ui/react";
import "./App.css";
import "./BookStyles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraBaseProvider>
        <App />
      </ChakraBaseProvider>
    </BrowserRouter>
  </React.StrictMode>
);
