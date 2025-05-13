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
import Grid from '@mui/system/Grid'
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";

const CareerHistory = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [careerHistory, setCareerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [careerErrors, setCareerErrors] = useState([]);
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  React.useEffect(() => {
    fetchCareerHistory();
  }, []);

  const fetchCareerHistory = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        "https://nikoapi.alexa.moe/api/career-history/history_v2",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  const handleSaveCareerEntry = async (index) => {
    setError(null);
    setSuccessMessage("");

    const job = careerHistory[index];
    const errors = {};
    let hasError = false;

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
    } else if (
      !/^(?:(?:[A-Z][a-z]*|\d{1,2})\s)*\d{4}|[Pp]resent$/.test(job.startDate)
    ) {
      errors.startDate =
        "Invalid start date format. Use MM-YYYY or Month YYYY.";
      hasError = true;
    }
    if (
      job.endDate &&
      !/^(?:(?:[A-Z][a-z]*|\d{1,2})\s)*\d{4}|[Pp]resent$/.test(job.endDate)
    ) {
      errors.endDate =
        "Invalid end date format. Must include Month YYYY or Present.";
      hasError = true;
    }

    const newCareerErrors = [...careerErrors];
    newCareerErrors[index] = errors;
    setCareerErrors(newCareerErrors);

    if (hasError) return;

    try {
      const token = await getAccessTokenSilently();
      const formattedData = {
        _id: job._id,
        Job_Title: job.position,
        Company: job.company,
        Start_Date: job.startDate,
        End_Date: job.endDate || "Present",
        Responsibilities: job.description ? job.description.split("\n") : [],
      };

      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/career-history/history_v2",
        { work_experience: [formattedData] }, // Send as an array
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Career history submission response:", response.data);

      if (response.data.status === "Success") {
        setSuccessMessage("Career entry saved successfully!");
        const updatedHistory = [...careerHistory];
        if (response.data.newEntry) {
          updatedHistory[index] = {
            ...formattedData,
            _id: response.data.data._id,
          };
        } else {
          updatedHistory[index] = {
            ...formattedData,
            _id: response.data.data[0]._id,
          };
        }
        // setCareerHistory(updatedHistory);
      } else {
        await fetchCareerHistory(); /* Re-fetch in case of issues*/
      }
    } catch (error) {
      console.error("Error saving career history entry:", error);
      setError(
        "Failed to save career entry: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleRemoveCareerEntry = async (index) => {
    const newCareerHistory = careerHistory.filter((_, i) => i !== index);
    setCareerHistory(newCareerHistory);
    setCareerErrors(newCareerHistory.map(() => ({})));

    setError(null);
    setSuccessMessage("");

    const isNew = !careerHistory[index]._id; // Check if this is a new, unsaved entry
    console.log("Is new entry:", isNew);

    // Only try to delete from backend if it's not a new entry
    if (!isNew) {
      try {
        const token = await getAccessTokenSilently();
        const edu_id = careerHistory[index]._id;
        const response = await axios.delete(
          "https://nikoapi.alexa.moe/api/career-history/history_v2",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            data: { id: edu_id },
          }
        );

        if (response.data.status === "Success") {
          setSuccessMessage("Education entry deleted successfully!");
        }
      } catch (err) {
        console.error("Delete failed:", err);
        setError(
          "Failed to delete education entry: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleAddCareerEntry = () => {
    setCareerHistory([...careerHistory, {}]);
    setCareerErrors([...careerErrors, {}]);
  };

  const handleInputChange = (index, name, value) => {
    const newCareerHistory = [...careerHistory];
    newCareerHistory[index] = { ...newCareerHistory[index], [name]: value };
    setCareerHistory(newCareerHistory);

    // Clear the specific error when the input changes
    const newCareerErrors = [...careerErrors];
    if (newCareerErrors[index]) {
      newCareerErrors[index][name] = "";
      setCareerErrors(newCareerErrors);
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
      <Box sx={{ maxWidth: "75%", mx: "auto", p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Box
            sx={{
              position: "fixed",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              width: "auto",
              maxWidth: 600,
            }}
          >
            <Alert
              severity="success"
              variant="filled"
              onClose={() => setSuccessMessage("")}
              sx={{
                padding: "20px",
                minHeight: "20px",
                animation: "fadeIn 0.5s ease-in-out",
                "@keyframes fadeIn": {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
              }}
            >
              {successMessage}
            </Alert>
          </Box>
        )}
        <Grid container spacing={2}>
        <Grid size={6}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Career History
          </Typography>
          {careerHistory.map((job, index) => (
            <Box
              key={index}
              data-job-id={job._id}
              sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
            >
              <TextField
                fullWidth
                label="Company"
                value={job.company || ""}
                onChange={(e) =>
                  handleInputChange(index, "company", e.target.value)
                }
                margin="normal"
                error={!!careerErrors[index]?.company}
                helperText={careerErrors[index]?.company}
                required
              />
              <TextField
                fullWidth
                label="Position"
                value={job.position || ""}
                onChange={(e) =>
                  handleInputChange(index, "position", e.target.value)
                }
                margin="normal"
                error={!!careerErrors[index]?.position}
                helperText={careerErrors[index]?.position}
                required
              />
              <TextField
                fullWidth
                label="Start Date"
                value={job.startDate || ""}
                onChange={(e) =>
                  handleInputChange(index, "startDate", e.target.value)
                }
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
                onChange={(e) =>
                  handleInputChange(index, "endDate", e.target.value)
                }
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
                onChange={(e) =>
                  handleInputChange(index, "description", e.target.value)
                }
                margin="normal"
                placeholder="Enter job responsibilities and achievements"
              />
              {/*
                            <TextField
                                fullWidth
                                label="Location"
                                value={job.location || ""}
                                onChange={(e) => handleInputChange(index, "location", e.target.value)}
                                margin="normal"
                                placeholder="Enter location"
                            />*/}
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 0.25 }}
                  onClick={() => handleSaveCareerEntry(index)}
                >
                  Save Career Entry
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveCareerEntry(index)}
                  sx={{ mt: 1 }}
                >
                  Remove Job
                </Button>
              </Box>
            </Box>
          ))}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={handleAddCareerEntry}
            >
              Add Another Job
            </Button>
            {/* You might still want a general "Save All" button if needed */}
            {/* <Button type="submit" variant="contained" color="primary">
                            Save All Career History
                        </Button> */}
          </Box>
        </Paper>
        </Grid>
        <Grid size={6}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Free-form Career History
          </Typography>
          <Box
              sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
            >
              <TextField
                fullWidth
                label="Paste career history here"
                value={""}
                onChange={""}
                margin="normal"
                multiline="true"
                rows={5}
              />
          </Box>
        </Paper>
        </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CareerHistory;
