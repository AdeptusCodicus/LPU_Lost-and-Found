import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import ItemCard from '../components/Itemcard'; // Reusing ItemCard for display
import { useAuth } from '../contexts/AuthContext';
import '../styles/Archive.css'; // Styles for this page

const API_BASE_URL = 'https://lpu-lostfound-tyh24.ondigitalocean.app';

interface ArchivedItem {
  id: number;
  name: string;
  description?: string | null;
  location: string;
  contact: string;
  date_reported: string;
  itemType: 'Lost' | 'Found';
  status: 'claimed' | 'found' | 'expired' | string;
  user_email?: string | null;
  date_found?: string;
  date_lost?: string;
  owner?: string;
}

type ArchiveTab = 'Claimed' | 'Reunited' | 'Expired';

const Archive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ArchiveTab>('Claimed');
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ArchivedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const { token } = useAuth();

  const fetchArchivedData = useCallback(async () => {
    if (!token) {
      setFetchError("Authentication token not found. Please log in.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    setArchivedItems([]);
    setFilteredItems([]);

    try {
      let queryType = '';
      if (activeTab === 'Claimed') queryType = 'claimed';
      else if (activeTab === 'Reunited') queryType = 'reunited';
      else if (activeTab === 'Expired') queryType = 'expired';

      const response = await axios.get<{ items: ArchivedItem[] }>(
        `${API_BASE_URL}/admin/archive?type=${queryType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const items = response.data.items || [];
      setArchivedItems(items);
      setFilteredItems(items);
    } catch (error: any) {
      console.error(`Error fetching ${activeTab} items:`, error);
      if (axios.isAxiosError(error) && error.response) {
        setFetchError(error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`);
      } else {
        setFetchError(`An unexpected error occurred while fetching ${activeTab.toLowerCase()} items.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(archivedItems);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = archivedItems.filter(item =>
        item.name.toLowerCase().includes(lowerSearchQuery) ||
        item.location.toLowerCase().includes(lowerSearchQuery) ||
        item.description?.toLowerCase().includes(lowerSearchQuery) ||
        item.contact.toLowerCase().includes(lowerSearchQuery) ||
        item.user_email?.toLowerCase().includes(lowerSearchQuery)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, archivedItems]);

  useEffect(() => {
    document.title = `Archive - ${activeTab} | LPU Lost & Found Admin`;
    fetchArchivedData();
  }, [fetchArchivedData]); // fetchArchivedData is memoized and includes activeTab

  const handleDeleteItem = async (itemId: number, itemType: 'Lost' | 'Found') => {
    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this item? This action is permanent and cannot be undone.');
    if (!confirmDelete) return;

    setDeletingItemId(itemId);
    try {
      await axios.delete(`${API_BASE_URL}/admin/item/delete/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { itemId, itemType: itemType.toLowerCase() }
      });

      const updatedItems = archivedItems.filter(item => item.id !== itemId);
      setArchivedItems(updatedItems);
      // Re-filter based on current search query
      if (!searchQuery.trim()) {
        setFilteredItems(updatedItems);
      } else {
        const lowerSearchQuery = searchQuery.toLowerCase();
        setFilteredItems(updatedItems.filter(item =>
          item.name.toLowerCase().includes(lowerSearchQuery) ||
          item.location.toLowerCase().includes(lowerSearchQuery) ||
          item.description?.toLowerCase().includes(lowerSearchQuery) ||
          item.contact.toLowerCase().includes(lowerSearchQuery) ||
          item.user_email?.toLowerCase().includes(lowerSearchQuery)
        ));
      }
      alert('Item deleted successfully.');
    } catch (error: any) {
      console.error('Error deleting item:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data?.error || error.response.data?.message || `Error: ${error.response.status}`);
      } else {
        alert('An unexpected error occurred while deleting the item.');
      }
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => setSearchQuery('');

  const tabDisplayNames: Record<ArchiveTab, string> = {
    Claimed: "Claimed Items",
    Reunited: "Reunited Items",
    Expired: "Expired Items"
  };

  return (
    <div className="archive-page-container">
      <main className="archive-main">
        <div className="tabs-container">
          {(['Claimed', 'Reunited', 'Expired'] as ArchiveTab[]).map((tabStatus) => (
            <button
              key={tabStatus}
              className={`tab-button ${activeTab === tabStatus ? 'active' : ''}`}
              onClick={() => setActiveTab(tabStatus)}
            >
              {tabDisplayNames[tabStatus]}
            </button>
          ))}
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} items...`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="clear-search-button">✕</button>
            )}
          </div>
          {searchQuery && (
            <p className="search-results-count">
              Found {filteredItems.length} of {archivedItems.length} items
            </p>
          )}
        </div>

        {isLoading && <p className="loading-message">Loading {activeTab.toLowerCase()} items...</p>}
        {fetchError && <p className="error-message">{fetchError}</p>}
        {!isLoading && !fetchError && (
          <div className="item-card-container archive-item-card-container">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ItemCard
                  key={`${item.itemType}-${item.id}`}
                  id={item.id}
                  name={item.name}
                  date_reported={item.date_reported}
                  location={item.location}
                  description={item.description}
                  itemType={item.itemType}
                  status={item.status}
                  contact={item.contact}
                  user_email={item.user_email || undefined}
                  onDelete={handleDeleteItem} // Passed to ItemCard
                  isDeleting={deletingItemId === item.id} // Passed to ItemCard
                  isArchived={true} // This flag tells ItemCard to show the delete button
                />
              ))
            ) : searchQuery ? (
              <p className="no-items-message">
                No {activeTab.toLowerCase()} items match your search for "{searchQuery}".
              </p>
            ) : (
              <p className="no-items-message">
                No {activeTab.toLowerCase()} items to display.
              </p>
            )}
          </div>
        )}
      </main>
      <Navbar />
    </div>
  );
};

export default Archive;