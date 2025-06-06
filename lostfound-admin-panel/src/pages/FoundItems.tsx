import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import "../styles/FoundItems.css";

interface FoundItem {
  id: string;
  name: string;
  dateFound: string;
  location: string;
  description: string;
  status: string; // e.g., "Reported", "Pending Claim", "Claimed", "Archived"
  finder: string;
  contact: string;
  imageUrl?: string; // Optional image URL for thumbnail
}

const FoundItems: React.FC = () => {
  const [foundItems, setFoundItems] = useState<FoundItem[]>([
    {
      id: 'LPU-F-001',
      name: 'Wallet',
      dateFound: '2025-06-05',
      location: 'Library, Ground Floor',
      description: 'Black leather wallet with ID cards inside.',
      status: 'Reported',
      finder: 'John Doe',
      contact: 'john.doe@example.com',
    },
    {
      id: 'LPU-F-002',
      name: 'Keys',
      dateFound: '2025-06-03',
      location: 'Main Building, Entrance',
      description: 'Set of keys with a red keychain.',
      status: 'Pending Claim',
      finder: 'Jane Smith',
      contact: 'jane.smith@example.com',
    },
  ]);

  useEffect(() => {
    document.title = 'Found Items | LPU Lost & Found'; // Set the browser tab title
  }, []);

  const handleMarkAsClaimed = (id: string) => {
    alert(`Item with ID ${id} marked as claimed!`);
    setFoundItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, status: 'Claimed' } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    alert(`Item with ID ${id} removed from the list!`);
    setFoundItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <div className="found-items-container">
      <Navbar />
      <main className="found-items-main">
        <h1 className="found-items-title">Found Items</h1>
        <table className="found-items-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Date Found</th>
              <th>Location</th>
              <th>Description</th>
              <th>Status</th>
              <th>Finder</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foundItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.dateFound}</td>
                <td>{item.location}</td>
                <td>{item.description}</td>
                <td className={`status ${item.status.toLowerCase()}`}>
                  {item.status}
                </td>
                <td>{item.finder}</td>
                <td>
                  <button
                    className="action-button claimed-button"
                    onClick={() => handleMarkAsClaimed(item.id)}
                  >
                    Mark as Claimed
                  </button>
                  <button
                    className="action-button remove-button"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <Footer />
    </div>
  );
};

export default FoundItems;