import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
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
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="responsive table">
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Date Found</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Finder</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {foundItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.dateFound}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className={`status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </TableCell>
                  <TableCell>{item.finder}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleMarkAsClaimed(item.id)}
                      sx={{ marginBottom: 1, marginRight: 1 }} // Added spacing below and to the right

                    >
                      Mark as Claimed
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                      sx={{ marginBottom: 1 }} // Added spacing below
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </main>
      <Footer />
    </div>
  );
};

export default FoundItems;