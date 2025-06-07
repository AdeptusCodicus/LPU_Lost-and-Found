import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import ItemCard from '../components/Itemcard';
import "../styles/Home.css";
import "../styles/Footer.css";

const Home: React.FC = () => {
  interface Item {
    name: string;
    date: string;
    location: string;
    description: string;
    type: 'Lost' | 'Found'; 
  }

  const dummyItems: Item[] = [
    {
      name: 'Wallet',
      date: '2025-06-05',
      location: 'Library',
      description: 'Black leather wallet with ID cards inside.',
      type: 'Lost', 
    },
    {
      name: 'Umbrella',
      date: '2025-06-04',
      location: 'Cafeteria',
      description: 'Blue umbrella left near the dining table.',
      type: 'Found', 
    },
    {
      name: 'Keys',
      date: '2025-06-03',
      location: 'Main Building',
      description: 'Set of keys with a red keychain.',
      type: 'Lost', 
    },
  ];


  useEffect(() => {
    document.title = 'Lost Items | LPU Lost & Found';
  }, []);

  return (
    <div className="home-container">
      <Navbar />
      <main className="home-main">
        <h1 className="home-title">Reports</h1> {/* Added class for styling */}
        <div className="item-card-container">
          {dummyItems.map((item, index) => (
            <ItemCard
              key={index}
              name={item.name}
              date={item.date}
              location={item.location}
              description={item.description}
              Type={item.type}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
