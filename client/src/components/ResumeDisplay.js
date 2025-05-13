import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

const ResumeDisplay = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resumeContent, setResumeContent] = useState(null);
  const [status, setStatus] = useState("loading"); 
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let intervalId;
    let updatesCancelled = false;

    const fetchResumeStatus = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `https://nikoapi.alexa.moe/api/resumes/status/${resumeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Status updated: data not loading ", response.data); 
        

        if (response.data && !updatesCancelled) {
          setStatus(response.data.status.toLowerCase());
          console.log("Status updated: 1 ", response.data.status.toLowerCase());
          if (response.data.status.toLowerCase() === "completed") {
            setResumeContent(response.data.content);
            clearInterval(intervalId);
          } 
          else if (response.data.status.toLowerCase() === "failed") {
            setErrorMessage("Failed to generate resume.");
            setStatus("error");
            clearInterval(intervalId); 
          }
        } 
        else {
          setErrorMessage("Failed to fetch resume status.");
          setStatus("error");
          clearInterval(intervalId);
        }
      } 
      catch (error) {
        if (updatesCancelled){
          console.error("Error fetching resume status:", error);
          setErrorMessage(
            error.response?.data?.error ||
              error.message ||
              "Failed to fetch resume status.");
          setStatus("error");
          clearInterval(intervalId);
        }
      }
    };

    // Initial fetch
    fetchResumeStatus();

    // Check status
    intervalId = setInterval(() => {
      if (status !== "completed" && status !== "failed" && !updatesCancelled) {
        fetchResumeStatus();
      }
    }, 5000);

    return () => { 
      clearInterval(intervalId); 
      updatesCancelled = true;
    };
  },

    [getAccessTokenSilently, resumeId, navigate]);


  const handleGoBack = () => {
    navigate("/resumeRoutes"); // Go back to resume gen page
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3 }}>
        <NavBar />
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Generated Resume
        </Typography>

        {status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Checking resume generation status...</Typography>
          </Box>
        )}

        {status === "pending" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Resume is being generated. Please wait...
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress />
            </Box>
          </Box>
        )}

        {status === "success" && resumeContent && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Your Improved Resume
            </Typography>
            <Paper elevation={2} sx={{ p: 2, whiteSpace: "pre-line" }}>
              {JSON.stringify(resumeContent, null, 2)}
            </Paper>
          </Box>
        )}

        {status === "error" && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage || "Failed to retrieve generated resume."}
          </Alert>
        )}

        <Button onClick={handleGoBack} sx={{ mt: 3 }}>
          Go Back to Generate New Resume
        </Button>
      </Paper>
    </Box>
  );
};

export default ResumeDisplay;