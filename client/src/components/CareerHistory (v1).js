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

const CareerHistory = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [careerHistory, setCareerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // State variables for validation
  const [careerErrors, setCareerErrors] = useState([]);


  useEffect(() => {
    fetchCareerHistory();
  }, []);

  // Get Career History from DB
  const fetchCareerHistory = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/career-history/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Career history response:", response.data);
      if (response.data && response.data.data) {
        const formattedHistory = response.data.data.map((job) => ({
          _id: job._id,
          company: job.Company || job.company,
          position: job.Job_Title || job.position || job["Job_Title(s)"],
          startDate: job.Start_Date || job.startDate,
          endDate: job.End_Date || job.endDate,
          description: Array.isArray(job.Responsibilities)
            ? job.Responsibilities.join("\n")
            : job.description,
        }));
        setCareerHistory(formattedHistory);
        setCareerErrors(new Array(formattedHistory.length).fill({}));
      } else {
        setCareerHistory([{}]);
        setCareerErrors([{}]);
      }
    } catch (error) {
      console.error("Error fetching career history:", error);
      setError("Failed to fetch career history");
      setCareerHistory([{}]);
      setCareerErrors([{}]);
    } finally {
      setLoading(false);
    }
  };

  // Submit BUtton
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    let hasError = false;
    const newErrors = [];

    careerHistory.forEach((job, index) => {
      const errors = {};

      if (!job.company) {
        errors.company = "Company name is required.";
        hasError = true;
      }

      if (!job.position) {
        errors.position = "Position is required.";
        hasError = true;
      }

      if (!job.startDate) {
        errors.startDate = "Start date is required.";
        hasError = true;
      } else if (!/^(?:(?:[A-Z][a-z]*|\d{1,2})\s)*\d{4}|[Pp]resent$/.test(job.startDate)) {
        errors.startDate = "Invalid start date format. Use MM-YYYY or Month YYYY.";
        hasError = true;
      }

      if (!job.endDate) {
        errors.endDate = "End date is required.";
        hasError = true;
      } else if (!/^(?:(?:[A-Z][a-z]*|\d{1,2})\s)*\d{4}|[Pp]resent$/.test(job.endDate)) {
        errors.endDate = "Invalid end date format. Must include YYYY or Present.";
        hasError = true;
      }

      newErrors.push(errors);
    });

    setCareerErrors(newErrors);
    if (hasError) return;

    try {
      // Prepare formattedData for the API
      const token = await getAccessTokenSilently();
      const formattedData = careerHistory.map((job) => ({
        _id: job._id,
        Job_Title: job.position,
        Company: job.company,
        Start_Date: job.startDate,
        End_Date: job.endDate,
        Responsibilities: job.description ? job.description.split("\n") : [],
      }));

      // Adding Career History into DB
      console.log("Submitting career history:", formattedData);
      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/career-history/history",
        {
          work_experience: formattedData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Career history submission response:", response.data);

      // Addition was successful
      if (response.data.status === "Success") {
        setSuccessMessage("Career history saved successfully!");
        const updatedHistory = formattedData.map((job) => ({
          _id: job._id,
          company: job.Company,
          position: job.Job_Title,
          startDate: job.Start_Date,
          endDate: job.End_Date,
          description: Array.isArray(job.Responsibilities)
            ? job.Responsibilities.join("\n")
            : job.Responsibilities,
        }));
        setCareerHistory(updatedHistory);
      } else {  // Addition was not successful
        await fetchCareerHistory();
      }
    } catch (error) {
      console.error("Error saving career history:", error);
      setError("Failed to save career history: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
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
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              width: 'auto',
              maxWidth: 600,
            }}
          >
            <Alert
              severity="success"
              variant="filled"
              onClose={() => setSuccessMessage("")}
              sx={{ 
                padding: '20px', 
                minHeight: '20px',
                animation: 'fadeIn 0.5s ease-in-out',
                '@keyframes fadeIn': {
                  from: { opacity: 0 },
                  to: { opacity: 1 }
                }
              }}
            >
              {successMessage}
            </Alert>
          </Box>
        )}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Career History
          </Typography>
          <form onSubmit={handleSubmit}>
            {careerHistory.map((job, index) => (
              <Box
                key={index}
                sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <TextField
                  fullWidth
                  label="Company"
                  value={job.company || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      company: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  error={!!careerErrors[index]?.company}
                  helperText={careerErrors[index]?.company}
                  required
                />
                <TextField
                  fullWidth
                  label="Position"
                  value={job.position || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      position: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  error={!!careerErrors[index]?.position}
                  helperText={careerErrors[index]?.position}
                  required
                />
                <TextField
                  fullWidth
                  label="Start Date"
                  value={job.startDate || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      startDate: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  error={!!careerErrors[index]?.startDate}
                  helperText={careerErrors[index]?.startDate}
                  required
                  placeholder="e.g., Jan 2020"
                />
                <TextField
                  fullWidth
                  label="End Date"
                  value={job.endDate || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      endDate: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  error={!!careerErrors[index]?.endDate}
                  helperText={careerErrors[index]?.endDate}
                  required
                  placeholder="e.g., Present"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Key Responsibilities"
                  value={job.description || ""}
                  onChange={(e) => {
                    const newCareerHistory = [...careerHistory];
                    newCareerHistory[index] = {
                      ...newCareerHistory[index],
                      description: e.target.value,
                    };
                    setCareerHistory(newCareerHistory);
                  }}
                  margin="normal"
                  required
                  placeholder="Enter job responsibilities and achievements"
                />
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    const newCareerHistory = careerHistory.filter(
                      (_, i) => i !== index
                    );
                    setCareerHistory(newCareerHistory);
                    setCareerErrors(newCareerHistory.map(() => ({})));
                  }}
                  sx={{ mt: 1 }}
                >
                  Remove Job
                </Button>
              </Box>
            ))}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  setCareerHistory([...careerHistory, {}]);
                  setCareerErrors([...careerErrors, {}]);
                }}
              >
                Add Another Job
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Career History
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CareerHistory;
