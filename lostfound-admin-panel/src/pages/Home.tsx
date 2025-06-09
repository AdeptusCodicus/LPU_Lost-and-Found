import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/Itemcard';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import "../styles/Home.css";

// API Base URL (consider moving to a config file or environment variable)
const API_BASE_URL = 'https://lpu-lostfound-tyh24.ondigitalocean.app';

interface Item {
  id: number;
  name: string;
  description?: string | null;
  location: string;
  contact: string;
  date_reported: string;
  itemType: 'Lost' | 'Found'; // 'itemType' from backend should match this
  status: string;
  user_email?: string | null; // Ensure backend can send null
}

interface BackendItemResponse extends Omit<Item, 'itemType' | 'status'> {
  type?: 'Lost' | 'Found' | 'lost' | 'found';
  status?: string | null; // Backend might send null for status
}


const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Found' | 'Lost'>('Found');
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { token } = useAuth();

  const fetchItems = useCallback(async () => {
    if (!token) {
      setFetchError("Authentication token not found. Please log in.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    try {
      const foundItemsResponse = await axios.get<{ items: BackendItemResponse[] }>(`${API_BASE_URL}/found-items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const foundItemsData = foundItemsResponse.data.items.map(item => ({
        ...item,
        id: Number(item.id), // Ensure id is a number
        itemType: 'Found' as 'Found',
        status: String(item.status || 'unknown'), // Ensure status is a string, default if null/undefined
      }));

      const lostItemsResponse = await axios.get<{ items: BackendItemResponse[] }>(`${API_BASE_URL}/lost-items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lostItemsData = lostItemsResponse.data.items.map(item => ({
        ...item,
        id: Number(item.id), // Ensure id is a number
        itemType: 'Lost' as 'Lost',
        status: String(item.status || 'unknown'), // Ensure status is a string, default if null/undefined
      }));

      // Combine and deduplicate items.
      // Create a Map to store items by ID.
      // If an ID exists in both foundItemsData and lostItemsData,
      // the one processed last (lostItemsData) will overwrite the earlier one.
      // This prioritizes 'Lost' items in case of ID collision,
      // or you can choose another strategy if needed.
      const itemsMap = new Map<number, Item>();

      for (const item of foundItemsData) {
        itemsMap.set(item.id, item as Item);
      }
      for (const item of lostItemsData) { // Lost items will overwrite found items if IDs match
        itemsMap.set(item.id, item as Item);
      }

      setAllItems(Array.from(itemsMap.values()));

    } catch (error: any) {
      console.error('Full error object during fetchItems:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Axios error response data:', error.response.data);
          console.error('Axios error response status:', error.response.status);
          console.error('Axios error response headers:', error.response.headers);
          setFetchError(error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`);
        } else if (error.request) {
          console.error('Axios error request:', error.request);
          setFetchError('Network error or no response from server.');
        } else {
          console.error('Axios error message:', error.message);
          setFetchError(`Error setting up request: ${error.message}`);
        }
      } else {
        console.error('Non-Axios error in fetchItems:', error);
        setFetchError(`An unexpected application error occurred: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    document.title = 'Home | LPU Lost & Found Admin';
    fetchItems();
  }, [fetchItems]);

  const filteredItems = allItems
    .filter(item => item.itemType === activeTab)
    .filter(item => {
      if (!searchTerm) return true;
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        (item.description && item.description.toLowerCase().includes(lowerSearchTerm)) ||
        item.location.toLowerCase().includes(lowerSearchTerm)
      );
    });

  const updateItemStatus = async (id: number, newStatus: string, successMessage: string, errorMessage: string) => {
    if (!token) {
      alert("Authentication error. Please log in again.");
      return;
    }

    const itemToUpdate = allItems.find(item => item.id === id);
    if (!itemToUpdate) {
      alert("Item not found.");
      return;
    }

    // DIAGNOSTIC CONSOLE.LOG
    console.log("updateItemStatus called with:", {
      id: id,
      newStatus: newStatus,
      itemTypeFromItemToUpdate: itemToUpdate.itemType,
      fullItemToUpdate: itemToUpdate
    });

    let updateUrl = '';
    let method: 'put' | 'post' = 'put';
    let requestBody: any = { status: newStatus };

    if (itemToUpdate.itemType === 'Found' && newStatus === 'claimed') {
      updateUrl = `${API_BASE_URL}/admin/found-items/${id}/mark-claimed`;
      method = 'post';
      requestBody = {};
    } else if (itemToUpdate.itemType === 'Lost' && newStatus === 'found') {
      updateUrl = `${API_BASE_URL}/admin/lost-items/${id}/mark-found`;
      method = 'post';
      requestBody = {};
    } else if (newStatus === 'expired') {
      updateUrl = `${API_BASE_URL}/admin/item/${id}/mark-expired`; // This endpoint likely needs backend implementation for 'expired'
      method = 'post';
      requestBody = { status: 'expired' };
      console.warn("Warning: 'Mark as Expired' functionality requires a specific backend endpoint or handling for 'expired' status on the generic route.");
    } else {
      // This block should ideally not be hit for standard operations like 'claimed' or 'found' for lost items.
      console.warn(`Using generic status update for status: ${newStatus}. itemType: ${itemToUpdate.itemType}. Ensure backend supports this method and route.`);
      updateUrl = `${API_BASE_URL}/admin/items/${id}/status`;
      method = 'put';
      requestBody = { status: newStatus };
    }

    if (!updateUrl) {
        alert("Could not determine the correct API endpoint for this action.");
        return;
    }

    try {
      if (method === 'post') {
        await axios.post(updateUrl, requestBody, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.put(updateUrl, requestBody, { headers: { Authorization: `Bearer ${token}` } });
      }
      alert(successMessage);
      fetchItems(); // Refresh items after successful update
    } catch (error) {
      console.error(errorMessage, error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Failed to ${errorMessage.toLowerCase()}: ${error.response.data?.error || error.response.data?.message || `Server responded with ${error.response.status}`}`);
      } else {
        alert(`Failed to ${errorMessage.toLowerCase()}. Check console for details.`);
      }
    }
  };

  const handleMarkClaimed = async (id: number) => {
    await updateItemStatus(id, 'claimed', `Item ${id} marked as claimed.`, 'Error marking item as claimed');
  };

  const handleMarkFoundByAdmin = async (id: number) => {
    await updateItemStatus(id, 'found', `Item ${id} marked as found by admin.`, 'Error marking item as found');
  };

  const handleMarkExpired = async (id: number) => {
    await updateItemStatus(id, 'expired', `Item ${id} marked as expired.`, 'Error marking item as expired');
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'Found' ? 'active' : ''}`}
            onClick={() => setActiveTab('Found')}
          >
            Found Items ({allItems.filter(item => item.itemType === 'Found').length})
          </button>
          <button
            className={`tab-button ${activeTab === 'Lost' ? 'active' : ''}`}
            onClick={() => setActiveTab('Lost')}
          >
            Lost Items ({allItems.filter(item => item.itemType === 'Lost').length})
          </button>
        </div>
        <div className="search-section">
          <SearchBar onSearch={setSearchTerm} />
        </div>

        {isLoading && <p className="loading-message">Loading items...</p>}
        {fetchError && <p className="error-message">{fetchError}</p>}
        {!isLoading && !fetchError && (
          <div className="item-card-container">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  date_reported={item.date_reported}
                  location={item.location}
                  description={item.description}
                  itemType={item.itemType}
                  status={item.status}
                  contact={item.contact}
                  user_email={item.user_email || undefined}
                  onMarkClaimed={item.itemType === 'Found' && item.status === 'available' ? () => handleMarkClaimed(item.id) : undefined}
                  onMarkFound={item.itemType === 'Lost' && item.status === 'missing' ? () => handleMarkFoundByAdmin(item.id) : undefined}
                  onMarkExpired={(item.status === 'available' || item.status === 'missing') ? () => handleMarkExpired(item.id) : undefined}
                />
              ))
            ) : (
              <p className="no-items-message">
                {searchTerm ? `No ${activeTab.toLowerCase()} items match your search.` : `No ${activeTab.toLowerCase()} items to display.`}
              </p>
            )}
          </div>
        )}
      </main>
      <Navbar />
    </div>
  );
};

export default Home;