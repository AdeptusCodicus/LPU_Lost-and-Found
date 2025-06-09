import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
// import Header from '../components/Header'; // If you have a consistent header
import ReportCard from '../components/ReportCard';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Reports.css'; // Styles for this page
import '../styles/ItemCard.css'; // Re-use some item card styles

const API_BASE_URL = 'https://lpu-lostfound-tyh24.ondigitalocean.app';

interface ReportItem {
  id: number;
  name: string;
  description?: string | null;
  location: string;
  contact: string;
  date_reported: string;
  type: 'Lost' | 'Found' | 'lost' | 'found';
  status: 'pending' | 'approved' | 'rejected';
  user_email?: string | null;
  reporterID?: number | null;
}

type ReportStatusTab = 'pending' | 'approved' | 'rejected';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportStatusTab>('pending');
  const [allReports, setAllReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchReports = useCallback(async () => {
    if (!token) {
      setFetchError("Authentication token not found. Please log in.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get<{ reports: ReportItem[] }>(`${API_BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllReports(response.data.reports || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      if (axios.isAxiosError(error) && error.response) {
        setFetchError(error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`);
      } else {
        setFetchError('An unexpected error occurred while fetching reports.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    document.title = 'Manage Reports | LPU Lost & Found Admin';
    fetchReports();
  }, [fetchReports]);

  const handleApproveReport = async (id: number) => {
    if (!token) {
      alert("Authentication error.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/admin/reports/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Report ${id} approved successfully.`);
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error(`Error approving report ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Failed to approve report: ${error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`}`);
      } else {
        alert('Failed to approve report. Check console for details.');
      }
    }
  };

  const handleRejectReport = async (id: number) => {
    if (!token) {
      alert("Authentication error.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/admin/reports/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Report ${id} rejected successfully.`);
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error(`Error rejecting report ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Failed to reject report: ${error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`}`);
      } else {
        alert('Failed to reject report. Check console for details.');
      }
    }
  };

  const filteredReports = allReports.filter(report => report.status === activeTab);

  return (
    <div className="reports-container">
      {/* <Header /> */}
      <main className="reports-main">
        <div className="tabs-container">
          {(['pending', 'approved', 'rejected'] as ReportStatusTab[]).map((tabStatus) => (
            <button
              key={tabStatus}
              className={`tab-button ${activeTab === tabStatus ? 'active' : ''}`}
              onClick={() => setActiveTab(tabStatus)}
            >
              {tabStatus.charAt(0).toUpperCase() + tabStatus.slice(1)} Reports
              ({allReports.filter(report => report.status === tabStatus).length})
            </button>
          ))}
        </div>

        {isLoading && <p className="loading-message">Loading reports...</p>}
        {fetchError && <p className="error-message">{fetchError}</p>}
        {!isLoading && !fetchError && (
          <div className="report-card-container">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  {...report}
                  onApprove={report.status === 'pending' ? handleApproveReport : undefined}
                  onReject={report.status === 'pending' ? handleRejectReport : undefined}
                />
              ))
            ) : (
              <p className="no-reports-message">
                No {activeTab} reports to display.
              </p>
            )}
          </div>
        )}
      </main>
      <Navbar />
    </div>
  );
};

export default Reports;