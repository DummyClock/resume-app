import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import NavBar from "./NavBar";
import ResumeUpload from "./ResumeUpload";
import Dashboard from "./Dashboard";
import ParticlesBackground from "./ParticlesBackground";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../context/ThemeContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const [currentTab, setCurrentTab] = useState(0);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  // Effect Hook: Adds user_id into DB for brand new users
  const memoizedGetAccessTokenSilently = useCallback(
    getAccessTokenSilently,
    []
  );
  const userSub = user?.sub;
  React.useEffect(() => {
    const checkAndCreateUser = async () => {
      if (isAuthenticated && user) {
        // Check if email has been verified, if not return to home
        if (!user.email_verified) {
          alert(
            "Oops. It seems you haven't verified your email yet. Please check your inbox."
          );
          navigate("/");
        }

        // Next, check if user exists in DB
        try {
          const accessToken = await memoizedGetAccessTokenSilently();
          const checkResponse = await fetch(
            `https://nikoapi.alexa.moe/api/auth/users/${user.sub}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          // User doesn't exist, create them
          if (checkResponse.status === 404) {
            const createResponse = await fetch(
              "https://nikoapi.alexa.moe/api/auth/users",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  user_id: user.sub,
                  email: user.email,
                  name: user.name,
                }),
              }
            );

            if (!createResponse.ok) {
              console.error("Failed to create user in database");
            }
          } else if (!checkResponse.ok) {
            console.error("Error checking user existence");
          }
        } catch (error) {
          console.error("Error during user check/creation:", error);
        } finally {
          setIsCheckingUser(false);
        }
      }
    };

    // Only run if authenticated AND not loading
    if (isAuthenticated && !isLoading) {
      checkAndCreateUser();
    }
  }, [
    isAuthenticated,
    userSub,
    memoizedGetAccessTokenSilently,
    user,
    isLoading,
  ]);

  if (isLoading || isCheckingUser) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <ParticlesBackground />
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: theme.palette.text.primary,
            gutterBottom: true,
          }}
        >
          Welcome, {user?.name || user?.email || "User"}!
        </Typography>

        <Paper
          sx={{
            width: "100%",
            mb: 2,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Dashboard" />
            <Tab label="Upload Resume" />
          </Tabs>
        </Paper>
        {currentTab === 0 && <Dashboard />}
        {currentTab === 1 && <ResumeUpload />}
      </Container>
    </Box>
  );
};

export default HomePage;
