import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import NavBar from "./NavBar";
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";

const JobDescription = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [jobDescHistory, setJobDescHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  useEffect(() => {
    fetchJobDescHistory();
  }, []);

  const fetchJobDescHistory = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/job-desc", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Job description response:", response.data);

      if (response.data && response.data.data) {
        // Map the data to match the form fields
        const formattedHistory = response.data.data.map((jobdesc) => ({
          _id: jobdesc._id, // Preserve the _id if it exists
          company: jobdesc.Company || jobdesc.company,
          job_title: jobdesc.Job_Title || jobdesc.job_title,
          description: jobdesc.description,
        }));
        setJobDescHistory(formattedHistory);
      } else {
        // Initialize with an empty job entry if no data
        setJobDescHistory([{}]);
      }
    } catch (error) {
      console.error("Error fetching job description history:", error);
      setError("Failed to fetch job description history");
      // Initialize with an empty job entry on error
      setJobDescHistory([{}]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    try {
      const token = await getAccessTokenSilently();

      // Format the data to match the database schema
      const formattedData = jobDescHistory.map((jobdesc) => ({
        _id: jobdesc._id, // Preserve _id for existing entries
        Job_Title: jobdesc.job_title,
        Company: jobdesc.company,
        Description: jobdesc.description,
      }));

      console.log("Submitting job description history:", formattedData);
      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/job-desc",
        {
          job_description: formattedData, // Match the database field name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Job description submission response:", response.data);

      if (response.data.status === "Success") {
        setSuccessMessage("Job description saved successfully!");
        // Update local state to match the saved data format
        const updatedHistory = response.data.data.map((jobdesc) => ({
          _id: jobdesc._id,
          company: jobdesc.company,
          job_title: jobdesc.job_title,
          description: jobdesc.description,
        }));
        setJobDescHistory(updatedHistory);
      } else {
        // If the save wasn't successful, refresh the data
        await fetchJobDescHistory();
      }
    } catch (error) {
      console.error("Error saving job description:", error);
      setError(
        "Failed to save job description: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <NavBar />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Job Listings
          </Typography>
          <form onSubmit={handleSubmit}>
            {jobDescHistory.map((jobdesc, index) => (
              <Box
                key={index}
                sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <TextField
                  fullWidth
                  label="Company"
                  value={jobdesc.company || ""}
                  onChange={(e) => {
                    const newJobDescHistory = [...jobDescHistory];
                    newJobDescHistory[index] = {
                      ...newJobDescHistory[index],
                      company: e.target.value,
                    };
                    setJobDescHistory(newJobDescHistory);
                  }}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Job Title"
                  value={jobdesc.job_title || ""}
                  onChange={(e) => {
                    const newJobDescHistory = [...jobDescHistory];
                    newJobDescHistory[index] = {
                      ...newJobDescHistory[index],
                      job_title: e.target.value,
                    };
                    setJobDescHistory(newJobDescHistory);
                  }}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Key Responsibilities"
                  value={jobdesc.description || ""}
                  onChange={(e) => {
                    const newJobDescHistory = [...jobDescHistory];
                    newJobDescHistory[index] = {
                      ...newJobDescHistory[index],
                      description: e.target.value,
                    };
                    setJobDescHistory(newJobDescHistory);
                  }}
                  margin="normal"
                  required
                  placeholder="Enter description"
                />
                {
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      const newJobDescHistory = jobDescHistory.filter(
                        (_, i) => i !== index
                      );
                      setJobDescHistory(newJobDescHistory);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove Job Listing
                  </Button>
                }
              </Box>
            ))}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setJobDescHistory([...jobDescHistory, {}])}
              >
                Add Another Job Listing
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Job Listing
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default JobDescription;
