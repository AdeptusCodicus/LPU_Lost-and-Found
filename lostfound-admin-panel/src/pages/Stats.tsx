import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import "../styles/Stats.css";

const Stats: React.FC = () => {
  useEffect(() => {
    document.title = 'Stats | LPU Lost & Found'; // Set the browser tab title
  }, []);

  return (
    <div className="stats-container">
      <Navbar />
      <main className="stats-main">
        <h1 className="stats-title">Stats</h1>
        <section className="stats-overview">
          <h2>Overview</h2>
          <p>Total Items Reported: 150</p>
          <p>Total Lost Items: 90</p>
          <p>Total Found Items: 60</p>
          <p>Total Items Reunited: 75 (83% reunion rate)</p>
          <p>Active Cases: 15 Lost | 10 Found</p>
        </section>
        <section className="stats-category">
          <h2>Breakdown by Category</h2>
          <p>Most Commonly Lost Items: Wallets, Phones, Keys</p>
          <p>Most Commonly Found Items: Umbrellas, Books, IDs</p>
        </section>
        <section className="stats-location">
          <h2>Breakdown by Location</h2>
          <p>Top Lost Locations: Library, Cafeteria, Gym</p>
          <p>Top Found Locations: Library, Main Building, Parking Lot</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Stats;