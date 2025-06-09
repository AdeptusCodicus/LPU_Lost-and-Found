import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AddItem.css';

const API_BASE_URL = 'https://lpu-lostfound-tyh24.ondigitalocean.app';

interface AddItemFormState {
  name: string;
  description: string;
  location: string;
  contact: string;
  date_found: string;
}

const AddItem: React.FC = () => {
  const { token } = useAuth();
  const [formState, setFormState] = useState<AddItemFormState>({
    name: '',
    description: '',
    location: '',
    contact: '',
    date_found: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Add Item | LPU Lost & Found Admin';
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setSubmitError('Authentication error. Please log in again.');
      return;
    }

    // Basic validation
    if (!formState.name || !formState.location || !formState.date_found || !formState.contact) {
        setSubmitError('Please fill in all required fields: Item Name, Location, Contact, and Date Found.');
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/items`, formState, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubmitSuccess(response.data.message || 'Item added successfully!');
      // Reset form
      setFormState({
        name: '',
        description: '',
        location: '',
        contact: '',
        date_found: '',
      });
    } catch (error: any) {
      console.error('Error adding item:', error);
      if (axios.isAxiosError(error) && error.response) {
        setSubmitError(error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`);
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-item-page-container">
      <main className="add-item-main">
        <div className="add-item-form-container">
          <h1>Add New Found Item</h1>
          {submitSuccess && <p className="success-message">{submitSuccess}</p>}
          {submitError && <p className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>{submitError}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Item Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="e.g., Black iPhone 12"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleChange}
                placeholder="e.g., Small scratch on top left corner, LPU sticker on back"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location Found*</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formState.location}
                onChange={handleChange}
                placeholder="e.g., Library 3rd Floor, Canteen Table 5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact Info (of finder or where to inquire)*</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formState.contact}
                onChange={handleChange}
                placeholder="e.g., Student Affairs Office, Security Desk"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_found">Date Found*</label>
              <input
                type="date"
                id="date_found"
                name="date_found"
                value={formState.date_found}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Item'}
            </button>
          </form>
        </div>
      </main>
      <Navbar />
    </div>
  );
};

export default AddItem;