import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HotelListingPage from './pages/HotelListingPage';
import HotelDetailPage from './pages/HotelDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import Footer from './components/Footer';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HotelListingPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {/* Signature MDB Blue 5-Column Footer */}
      <Footer />
    </div>
  );
}

export default App;

