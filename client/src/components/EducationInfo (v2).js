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

const EducationInfo = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [education, setEducation] = useState([]);
  const [validation, setValidation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Regex patterns
  const gpa_regex = /^\d+(\.\d+)?(\/\d+(\.\d+)?)?$/;
  const date_regex = /^(?:(?:[A-Z][a-z]*|\d{1,2})\s)*\d{4}|[Pp]resent$/;

  useEffect(() => {
    fetchEducationInfo();
  }, []);

  const syncValidation = (eduArray) => {
    setValidation(
      eduArray.map(() => ({
        validStartDate: true,
        validEndDate: true,
        validGPA: true,
      }))
    );
  };

  const fetchEducationInfo = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/education", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data) {
        // Update local state to match the saved data format
        const formatted = response.data.data.map((edu) => ({
          _id: edu._id,
          institution: edu.Institute || edu.institution,
          degree: edu.Degree || edu.degree,
          
          field: edu.Major || edu.field,
          gpa: edu.GPA || edu.gpa,
          startDate: edu.Start_Date || edu.startDate,
          endDate: edu.End_Date || edu.endDate,
        }));
        setEducation(formatted);
        syncValidation(formatted);
      } else {
        setEducation([{}]);
        syncValidation([{}]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Failed to fetch education history");
      setEducation([{}]);
      syncValidation([{}]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    const newValidation = education.map((edu) => ({
      validGPA: gpa_regex.test(edu.gpa),
      validStartDate: date_regex.test(edu.startDate),
      validEndDate: date_regex.test(edu.endDate),
    }));

    setValidation(newValidation);

    const hasErrors = newValidation.some(
      (v) => !v.validGPA || !v.validStartDate || !v.validEndDate
    );

    if (hasErrors) return;

    try {
      const token = await getAccessTokenSilently();
      const formattedData = education.map((edu) => ({
        _id: edu._id,
        Institute: edu.institution,
        Degree: edu.degree,
        Major: edu.field,
        gpa: edu.gpa,
        Start_Date: edu.startDate,
        End_Date: edu.endDate,
      }));

      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/education",
        { education: formattedData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "Success") {
        setSuccessMessage("Education information saved successfully!");
        const updated = response.data.data.map((edu) => ({
          _id: edu._id,
          institution: edu.Institute,
          degree: edu.Degree,
          field: edu.Major,
          gpa: edu.GPA,
          startDate: edu.Start_Date,
          endDate: edu.End_Date,
        }));
        setEducation(updated);
        syncValidation(updated);
      } else {
        await fetchEducationInfo();
      }
    } catch (err) {
      console.error("Save failed:", err);
      setError(
        "Failed to save education information: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
        <NavBar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
                      sx={{ padding: '20px', 
                        minHeight: '20px', 
                        animation: 'fadeIn 0.5s ease-in-out',
                          '@keyframes fadeIn': {
                            from: { opacity: 0 },
                            to: { opacity: 1 },}
                      }}
                    >
                      {successMessage}
                    </Alert>
                  </Box>
                )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Education Information
          </Typography>
          <form onSubmit={handleSubmit}>
            {education.map((edu, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
                <TextField
                  fullWidth label="Institution" required margin="normal"
                  value={edu.institution || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].institution = e.target.value;
                    setEducation(updated);
                  }}
                />
                <TextField
                  fullWidth label="Degree" required margin="normal"
                  value={edu.degree || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].degree = e.target.value;
                    setEducation(updated);
                  }}
                />
                <TextField
                  fullWidth label="Field of Study" required margin="normal"
                  value={edu.field || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].field = e.target.value;
                    setEducation(updated);
                  }}
                />
                <TextField
                  fullWidth label="GPA" required margin="normal"
                  placeholder="e.g., 3.7 or 3.70/4.0"
                  value={edu.gpa || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].gpa = e.target.value;
                    setEducation(updated);
                  }}
                />
                {!validation[index]?.validGPA && (
                  <Typography color="error" sx={{ ml: 2 }}>
                    Invalid GPA format. (Valid formats: 3.7 or 3.74/4.0000 )
                  </Typography>
                )}
                <TextField
                  fullWidth label="Start Date" required margin="normal"
                  placeholder="e.g., 2018"
                  value={edu.startDate || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].startDate = e.target.value;
                    setEducation(updated);
                  }}
                />
                {!validation[index]?.validStartDate && (
                  <Typography color="error" sx={{ ml: 2 }}>
                    Start date must have a 4-digit year (e.g., 2018), 'Present', or 'present'
                  </Typography>
                )}
                <TextField
                  fullWidth label="End Date" required margin="normal"
                  placeholder="e.g., 2022"
                  value={edu.endDate || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].endDate = e.target.value;
                    setEducation(updated);
                  }}
                />
                {!validation[index]?.validEndDate && (
                  <Typography color="error" sx={{ ml: 2 }}>
                    End date must be a 4-digit year (e.g., 2022)
                  </Typography>
                )}
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    const updated = education.filter((_, i) => i !== index);
                    setEducation(updated);
                    syncValidation(updated);
                  }}
                  sx={{ mt: 1 }}
                >
                  Remove Education
                </Button>
              </Box>
            ))}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  const updated = [...education, {}];
                  setEducation(updated);
                  syncValidation(updated);
                }}
              >
                Add Another Education
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Education
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default EducationInfo;
