import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import { setSearch, fetchHotels } from '../features/hotels/hotelsSlice';

const SearchBar = ({ placeholder = "Search hotels by title..." }) => {
  const dispatch = useDispatch();
  const currentSearch = useSelector((state) => state.hotels.filters.search);
  const [searchTerm, setSearchTerm] = useState(currentSearch || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearch(searchTerm.trim()));
    dispatch(fetchHotels());
  };

  const handleClear = () => {
    setSearchTerm('');
    dispatch(setSearch(''));
    dispatch(fetchHotels());
  };

  return (
    <form onSubmit={handleSubmit} className="input-group" role="search">
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search hotels"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="btn btn-outline-secondary"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
      <button
        type="submit"
        className="btn btn-primary-blue"
        aria-label="Submit search"
      >
        <Search size={16} />
      </button>
    </form>
  );
};

export default SearchBar;

