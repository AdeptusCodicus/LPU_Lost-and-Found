import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import "../styles/LostItems.css";

interface LostItem {
  id: string;
  name: string;
  dateLost: string;
  location: string;
  description: string;
  status: string; // e.g., "Reported", "Reunited", "Archived"
  reporter: string;
  contact: string;
}

const LostItems: React.FC = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>([
    {
      id: 'LPU-L-001',
      name: 'Wallet',
      dateLost: '2025-06-05',
      location: 'Library, Ground Floor',
      description: 'Black leather wallet with ID cards inside.',
      status: 'Reported',
      reporter: 'John Doe',
      contact: 'john.doe@example.com',
    },
    {
      id: 'LPU-L-002',
      name: 'Keys',
      dateLost: '2025-06-03',
      location: 'Main Building, Entrance',
      description: 'Set of keys with a red keychain.',
      status: 'Reported',
      reporter: 'Jane Smith',
      contact: 'jane.smith@example.com',
    },
  ]);

  useEffect(() => {
    document.title = 'Lost Items | LPU Lost & Found'; // Set the browser tab title
  }, []);

  const handleMarkAsFound = (id: string) => {
    alert(`Item with ID ${id} marked as found!`);
    setLostItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, status: 'Reunited' } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    alert(`Item with ID ${id} removed from the list!`);
    setLostItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <div className="lost-items-container">
      <Navbar />
      <main className="lost-items-main">
        <h1 className="lost-items-title">Lost Items</h1>
        <table className="lost-items-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Date Lost</th>
              <th>Location</th>
              <th>Description</th>
              <th>Status</th>
              <th>Reporter</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lostItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.dateLost}</td>
                <td>{item.location}</td>
                <td>{item.description}</td>
                <td className={`status ${item.status.toLowerCase()}`}>
                  {item.status}
                </td>
                <td>{item.reporter}</td>
                <td>
                  <button
                    className="action-button found-button"
                    onClick={() => handleMarkAsFound(item.id)}
                  >
                    Found
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

export default LostItems;