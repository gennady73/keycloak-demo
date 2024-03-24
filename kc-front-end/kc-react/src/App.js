import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Secured from "./components/Secured";
import SecuredPage from "./pages/Securedpage";
import Footer from './pages/Footer';
import ErrorBoundary from "./components/ErrorBoundary";

function App() {

  //const axiosInstance = require('./interceptors/KeycloakInterceptor.js').axiosInstance;

  return (
    <>
    <div className="App">
      <ErrorBoundary>
      <Secured>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SecuredPage/>} />
          </Routes>
        </BrowserRouter>
      </Secured>
      <Footer/>
      </ErrorBoundary>
    </div>
    </>
  );
}


export default App;
