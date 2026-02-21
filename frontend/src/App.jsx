import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import UserDetails from "./pages/UserDetails";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const App = () => {
  return (
   <QueryClientProvider client={queryClient}>
    <BrowserRouter> 
     <Navbar />
     <div className="mx-auto mt-4">
       <Routes>
        <Route path ="/" element={<Home />} /> 
        <Route path ="/add" element={<AddUser />} /> 
        <Route path ="/edit/:Id" element={<EditUser />} /> 
        <Route path ="/user/:Id" element={<UserDetails />} /> 
       </Routes>
  </div>
  </BrowserRouter>
  </QueryClientProvider>
  );
};


export default App;