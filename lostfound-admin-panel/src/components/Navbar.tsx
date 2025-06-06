import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Import the dropdown arrow icon

const pages = ['Home', 'Reports', 'Stats'];
const settings = ['Profile', 'Logout'];

export const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [anchorElReports, setAnchorElReports] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenReportsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElReports(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseReportsMenu = () => {
    setAnchorElReports(null);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('authToken');
    setLogoutDialogOpen(false);
    window.location.href = '/login';
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'maroon',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/Home"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'Lato, sans-serif',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              LPU L&F Admin Panel
            </Typography>

            {/* Navigation buttons */}
            <Box sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                page === 'Reports' ? (
                  <Button
                    key={page}
                    onClick={handleOpenReportsMenu}
                    sx={{
                      my: 3,
                      mx: 3,
                      fontSize: '1rem',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        color: 'gold',
                      },
                    }}
                  >
                    {page}
                    <ArrowDropDownIcon sx={{ ml: 1 }} /> {/* Dropdown arrow */}
                  </Button>
                ) : (
                  <Button
                    key={page}
                    sx={{
                      my: 3,
                      mx: 3,
                      fontSize: '1rem',
                      color: 'white',
                      display: 'block',
                      '&:hover': {
                        color: 'gold',
                      },
                    }}
                    href={`/${page}`}
                  >
                    {page}
                  </Button>
                )
              ))}
            </Box>

            {/* Dropdown menu for Reports */}
            <Menu
              id="reports-menu"
              anchorEl={anchorElReports}
              open={Boolean(anchorElReports)}
              onClose={handleCloseReportsMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleCloseReportsMenu} component="a" href="/Reports/LostItems">
                Lost Items
              </MenuItem>
              <MenuItem onClick={handleCloseReportsMenu} component="a" href="/Reports/FoundItems">
                Found Items
              </MenuItem>
            </Menu>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Account">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt="User Avatar"
                    src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting}
                    onClick={
                      setting === 'Logout'
                        ? handleLogoutClick
                        : () => {
                            if (setting === 'Profile') {
                              window.location.href = '/UserProfile'; // Redirect to UserProfile
                            } else {
                              handleCloseUserMenu();
                            }
                          }
                    }
                    sx={{
                      '&:hover': {
                        backgroundColor: 'maroon',
                        color: 'white',
                      },
                    }}
                  >
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleLogoutCancel}
            sx={{
              color: 'black',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            sx={{
              color: 'red',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
            autoFocus
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;