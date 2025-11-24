// App.jsx (or wherever your routes are defined)
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminProducts from './components/AdminProducts'; // adjust path if needed

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        {/* other routes */}
      </Routes>
    </BrowserRouter>
  );
}