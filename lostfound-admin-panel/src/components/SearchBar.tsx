import React from 'react';
import '../styles/SearchBar.css';
interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

// This is a common way to define a component that doesn't take props yet,
// or takes props but not onSearch.
// Actual implementation details might vary.
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder for existing change handling logic
    // console.log(event.target.value);
    onSearch(event.target.value); // Call the onSearch prop with the new value
  };

  return (
  <div className="search-bar">
    <input type="text" placeholder="Item Name" className="search-input" onChange={handleChange}/>
    <button className="search-button">
      <img
        src="https://cdn-icons-png.flaticon.com/512/54/54481.png"
        alt="Search Icon"
        className="search-icon"
      />
    </button>
  </div>
  );
};

export default SearchBar;