import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import type { SvgIconProps } from '@mui/material/SvgIcon';

import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InventoryIcon from '@mui/icons-material/Inventory'; // Added for Archive
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import './../styles/DockNavbar.css';
import { useAuth } from '../contexts/AuthContext';

interface DockItemProps {
  title: string;
  icon: React.ReactElement<SvgIconProps>;
  path?: string;
  action?: () => void;
}

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, admin } = useAuth(); // Assuming 'admin' might be used for conditional rendering if needed
  const [isMinimized, setIsMinimized] = useState(false);

  const dockItems: DockItemProps[] = [
    { title: 'Home', icon: <HomeIcon />, path: '/Home' },
    { title: 'Reports', icon: <AssessmentIcon />, path: '/Reports' },
    { title: 'Add Item', icon: <AddCircleOutlineIcon />, path: '/AddItem' },
    { title: 'Archive', icon: <InventoryIcon />, path: '/Archive' }, // New Archive Item
    { title: 'Account', icon: <AccountCircleIcon />, path: '/UserProfile' },
    { title: 'Logout', icon: <LogoutIcon />, action: logout },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <Box className={`dock-navbar ${isMinimized ? 'minimized' : ''}`}>
      {!isMinimized && dockItems.map((item) => (
        <Tooltip title={item.title} key={item.title} placement="top">
          <Box
            className={`dock-item ${item.path && location.pathname === item.path ? 'active' : ''}`}
            onClick={() => {
              if (item.path) {
                handleNavigate(item.path);
              } else if (item.action) {
                item.action();
              }
            }}
          >
            <IconButton className="dock-icon-button">
              {React.cloneElement(item.icon, { className: 'dock-icon' })}
            </IconButton>
            <Typography className="dock-title">{item.title}</Typography>
          </Box>
        </Tooltip>
      ))}
      <Tooltip title={isMinimized ? "Maximize" : "Minimize"} placement="top" >
        <Box className="minimize-toggle-button" onClick={toggleMinimize}>
          {isMinimized ? <KeyboardArrowUpIcon className="toggle-arrow-icon" /> : <KeyboardArrowDownIcon className="toggle-arrow-icon" />}
        </Box>
      </Tooltip>
    </Box>
  );
};