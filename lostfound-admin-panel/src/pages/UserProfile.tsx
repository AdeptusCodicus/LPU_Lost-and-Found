import React, { useState, useCallback, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import "../styles/UserProfile.css";

interface AdminProfileData {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  accountCreated: string;
  lastLogin: string;
  image?: string;
  accessLevel: string;
  permissions: string[];
}

interface AdminAction {
  id: string;
  action: string;
  itemId: string;
  timestamp: string;
  type: string;
}

const UserProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<AdminProfileData>({
    id: 'ADMIN-001',
    employeeId: 'LPU-EMP-98765',
    name: 'Mr. John Chen',
    role: 'Lost & Found Administrator',
    email: 'John.chen@lpu.edu.ph',
    phone: '+63 912 345 6789',
    accountCreated: 'January 15, 2023',
    lastLogin: 'June 7, 2025, 10:30 AM PST',
    image: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
    accessLevel: 'Full Administrator',
    permissions: [
      'Can View All Lost Reports',
      'Can Edit Found Item Details',
      'Can Mark Items as Reunited',
      'Can Access User Management',
      'Can Generate Reports',
      'Can Manage System Settings'
    ]
  });

  const [recentActions] = useState<AdminAction[]>([
    {
      id: '1',
      action: 'Marked as Reunited',
      itemId: 'LPU-F-00456',
      timestamp: 'June 7, 2025, 09:15 AM',
      type: 'Reunion'
    },
    {
      id: '2',
      action: 'Archived due to expiry',
      itemId: 'LPU-L-00123',
      timestamp: 'June 6, 2025, 04:30 PM',
      type: 'Archive'
    },
    {
      id: '3',
      action: 'Edited description',
      itemId: 'LPU-F-00789',
      timestamp: 'June 6, 2025, 02:45 PM',
      type: 'Edit'
    }
  ]);

  const [isDataChanged, setIsDataChanged] = useState(false);

  useEffect(() => {
    document.title = 'Admin Profile | LPU Lost & Found';
  }, []);

  const handleDataChanged = useCallback((updatedData: Partial<AdminProfileData>) => {
    setProfileData((prevData) => ({ ...prevData, ...updatedData }));
    setIsDataChanged(true);
  }, []);

  const handleSave = useCallback(() => {
    alert('Profile data saved!');
    setIsDataChanged(false);
  }, []);

  const handleCancel = useCallback(() => {
    alert('Changes canceled!');
    setIsDataChanged(false);
  }, []);

  const handleChangePassword = () => {
    alert('Change password functionality');
  };

  const handleEnable2FA = () => {
    alert('Enable 2FA functionality');
  };

  return (
    <div className="user-profile-container">
      <Navbar />
      <main className="user-profile-main">
        <h1 className="user-profile-title">Admin Profile</h1>
        
        {/* Admin Identity Section */}
        <div className="profile-section">
          <h2 className="section-title">Admin Identity & Overview</h2>
          <div className="profile-card">
            <div className="profile-card-header">
              <img
                src={profileData.image}
                alt={profileData.name}
                className="profile-image"
              />
              <div className="profile-info">
                <h3>{profileData.name}</h3>
                <p className="admin-badge">🛡️ {profileData.role}</p>
                <p><strong>Admin ID:</strong> {profileData.id}</p>
                <p><strong>Employee ID:</strong> {profileData.employeeId}</p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.phone}</p>
                <p><strong>Account Created:</strong> {profileData.accountCreated}</p>
                <p><strong>Last Login:</strong> {profileData.lastLogin}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Permissions Section */}
        <div className="profile-section">
          <h2 className="section-title">Admin Permissions & Access Control</h2>
          <div className="profile-card">
            <p><strong>Access Level:</strong> {profileData.accessLevel}</p>
            <div className="permissions-list">
              <h4>Assigned Permissions:</h4>
              <ul>
                {profileData.permissions.map((permission, index) => (
                  <li key={index} className="permission-item">
                     {permission}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Admin Actions Section */}
        <div className="profile-section">
          <h2 className="section-title">Recent Admin Actions</h2>
          <div className="profile-card">
            <div className="actions-table">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Item ID</th>
                    <th>Type</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActions.map((action) => (
                    <tr key={action.id}>
                      <td>{action.action}</td>
                      <td>
                        <a
                          href={`/Reports/ItemDetails/${action.itemId}`}
                          style={{ color: 'blue', textDecoration: 'underline' }}
                        >
                          {action.itemId}
                        </a>
                      </td>
                      <td className={`action-type ${action.type.toLowerCase()}`}>
                        {action.type}
                      </td>
                      <td>{action.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Admin Settings Section */}
        <div className="profile-section">
          <h2 className="section-title">Admin Settings & Security</h2>
          <div className="profile-card">
            <div className="security-options">
              <button className="security-button" onClick={handleChangePassword}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/483/483408.png"
                  alt="Lock Icon"
                  style={{ width: '16px', height: '16px', marginRight: '8px' }}
                />
                Change Password
              </button>
              {/* Add a dedicated 2FA enable button */}
              <button className="security-button" onClick={handleEnable2FA}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/709/709701.png"
                  alt="Shield Icon"
                  style={{ width: '16px', height: '16px', marginRight: '8px' }}
                />Enable Two-Factor Authentication
              </button>
            </div>
          </div>
        </div>

        {/* Save/Cancel Actions */}
        <div className="profile-actions">
          <button
            className="action-button save-button"
            onClick={handleSave}
            disabled={!isDataChanged}
          >
            Save Changes
          </button>
          <button
            className="action-button cancel-button"
            onClick={handleCancel}
            disabled={!isDataChanged}
          >
            Cancel
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;