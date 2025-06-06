import React from 'react';
import '../styles/SearchBar.css'; // Import the CSS file for styling

const SearchBar: React.FC = () => (
  <div className="search-bar">
    <input type="text" placeholder="Item Name" className="search-input" />
    <button className="search-button">
      <img
        src="https://cdn-icons-png.flaticon.com/512/54/54481.png"
        alt="Search Icon"
        className="search-icon"
      />
    </button>
  </div>
);

export default SearchBar;