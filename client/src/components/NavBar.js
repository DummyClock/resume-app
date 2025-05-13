import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MuiMenuItem from "@mui/material/MenuItem";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import HomeIcon from "@mui/icons-material/Home";
import JobDescIcon from "@mui/icons-material/Book";
import GenResumeIcon from "@mui/icons-material/AutoFixNormal";
import ResumesListIcon from "@mui/icons-material/Assignment";
import LogoLight from "../../src/light-mode-logo.png";
import LogoDark from "../../src/dark-mode-logo.png";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const NavBar = () => {
  const navigate = useNavigate();
  const { logout, user, getAccessTokenSilently } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const { darkMode, theme } = useTheme();

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        console.log("Fetching profile photo for user:", user?.sub);
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          "https://nikoapi.alexa.moe/api/user-profile/photo",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Profile photo response:", response.data);
        if (response.data.status === "Success" && response.data.data) {
          console.log(
            "Setting profile photo:",
            response.data.data.substring(0, 50) + "..."
          );
          setProfilePhoto(response.data.data);
        } else {
          console.log("No profile photo found in response");
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      }
    };

    if (user) {
      fetchProfilePhoto();
    }
  }, [user, getAccessTokenSilently]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /*const OptionsMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    }; */

  /*const MenuItem = styled(MuiMenuItem)({
    margin: '2px 0',
  }); */

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout({ returnTo: window.location.origin });
  };

  const handleMenuClick = (route) => {
    handleClose();
    navigate(route);
  };

  const toggleDrawer = (newOpen) => () => {
    setDrawerOpen(newOpen);
  };

  const handleDrawerItemClick = (route) => {
    navigate(route);
    setDrawerOpen(false);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {[
          "/home",
          "/resume-upload",
          "/career-history",
          "/education",
          "/job-descriptions",
          "/resume-generation",
          "/my-resumes",
        ].map((route, index) => (
          <ListItem key={route} disablePadding>
            <ListItemButton onClick={() => handleDrawerItemClick(route)}>
              <ListItemIcon>
                {index === 0 && <HomeIcon />}
                {index === 1 && <UploadFileIcon />}
                {index === 2 && <WorkIcon />}
                {index === 3 && <SchoolIcon />}
                {index === 4 && <JobDescIcon />}
                {index === 5 && <GenResumeIcon />}
                {index === 6 && <ResumesListIcon />}
              </ListItemIcon>
              <ListItemText
                primary={
                  index === 0
                    ? "Home"
                    : index === 1
                    ? "Upload Resume"
                    : index === 2
                    ? "Career History"
                    : index === 3
                    ? "Education"
                    : index === 4
                    ? "Job Descriptions"
                    : index === 5
                    ? "Generate Resume"
                    : "My Resumes"
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
  //app font Roboto

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        color={darkMode ? "transparent" : "default"}
        sx={{
          backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          minHeight: 65,
          boxShadow: darkMode ? "none" : 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "flex-start" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={darkMode ? LogoDark : LogoLight}
              alt="Logo"
              style={{ height: 65, marginRight: -15 }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                cursor: "pointer",
                fontSize: 22,
                marginBottom: -0.25,
                color: (theme) => theme.palette.text.primary,
              }}
              onClick={() => navigate("/home")}
            >
              Lighthouse
            </Typography>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                mr: 2,
                fontSize: 15,
                color: (theme) => theme.palette.text.primary,
              }}
            >
              Logout
            </Button>
            <Typography
              variant="body1"
              sx={{
                mr: 2,
                color: (theme) => theme.palette.text.primary,
              }}
            >
              {user?.name || user?.email}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ color: (theme) => theme.palette.text.primary }}
            >
              {profilePhoto ? (
                <Avatar
                  src={profilePhoto}
                  alt={user?.name || user?.email}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle sx={{ width: 32, height: 32 }} />
              )}
            </IconButton>
            <IconButton
              onClick={toggleDrawer(true)}
              sx={{ color: (theme) => theme.palette.text.primary }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {DrawerList}
            </Drawer>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleMenuClick("/user-profile")}>
                My Profile
              </MenuItem>
              <MenuItem onClick={() => handleMenuClick("/settings")}>
                Settings
              </MenuItem>
              <MenuItem onClick={() => handleMenuClick("/resume-generation")}>
                Resume Generation
              </MenuItem>
              <MenuItem onClick={() => handleMenuClick("/my-resumes")}>
                My Resumes
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;
