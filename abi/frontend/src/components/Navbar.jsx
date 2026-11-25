import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Heart, ShoppingCart, User } from 'lucide-react';
import { setSearch } from '../features/hotels/hotelsSlice';
import { addToast } from '../features/ui/uiSlice';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wishlist, bookings } = useSelector((state) => state.ui);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearch(searchInput));
    navigate('/');
  };

  const handleAuthClick = (e) => {
    e.preventDefault();
    dispatch(addToast({ type: 'info', message: 'User signed in as Guest.' }));
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    dispatch(addToast({
      type: 'info',
      message: `You have ${wishlist.length} item(s) in your Wishlist.`
    }));
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    dispatch(addToast({
      type: 'info',
      message: `You have ${bookings.length} hotel booking(s) in My cart.`
    }));
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg mdb-top-navbar" aria-label="Main Navigation">
        <div className="container">
          {/* Logo on Left: Stylized MMK */}
          <Link to="/" className="mdb-navbar-brand text-decoration-none" aria-label="MMK Hotels Home">
            <span className="brand-letter-m">M</span>
            <span className="brand-letter-d">M</span>
            <span className="brand-letter-b">K</span>
          </Link>

          {/* Search bar in Center */}
          <div className="d-none d-md-flex mx-auto mdb-search-wrapper">
            <form onSubmit={handleSearchSubmit} className="input-group w-100" role="search">
              <input
                type="text"
                className="form-control mdb-search-input"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search"
              />
              <button
                type="submit"
                className="btn mdb-search-btn"
                aria-label="Submit search"
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Right Actions: Sign in, Wishlist, My cart */}
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={handleAuthClick}
              className="mdb-nav-link"
              aria-label="Sign in"
            >
              <User size={16} className="text-muted" />
              <span>Sign in</span>
            </button>

            <button
              onClick={handleWishlistClick}
              className="mdb-nav-link"
              aria-label={`Wishlist with ${wishlist.length} items`}
            >
              <Heart size={16} className="text-muted" />
              <span>Wishlist</span>
            </button>

            <button
              onClick={handleCartClick}
              className="mdb-nav-link"
              aria-label={`My cart with ${bookings.length} items`}
            >
              <ShoppingCart size={16} className="text-muted" />
              <span>My cart</span>
              {bookings.length > 0 && (
                <span className="mdb-cart-badge">{bookings.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="container d-md-none mt-2 pt-2 border-top">
          <form onSubmit={handleSearchSubmit} className="input-group w-100" role="search">
            <input
              type="text"
              className="form-control mdb-search-input"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search"
            />
            <button
              type="submit"
              className="btn mdb-search-btn"
              aria-label="Submit search"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
