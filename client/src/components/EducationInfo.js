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

const EducationInfo = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [education, setEducation] = useState([]);
  const [validation, setValidation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

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
      //const response = await axios.get("https://nikoapi.alexa.moe:8000/api/education/v2", {
      const response = await axios.get(
        "https://nikoapi.alexa.moe/api/education/v2",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Education history response:", response.data);

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

  // Old function
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

  // New Delete Function
  const handleDeleteEducationEntry = async (index) => {
    setError(null);
    setSuccessMessage("");

    const isNew = !education[index]._id; // Check if this is a new, unsaved entry
    console.log("Is new entry:", isNew);

    const updated = education.filter((_, i) => i !== index);
    setEducation(updated);
    syncValidation(updated);

    // Only try to delete from backend if it's not a new entry
    if (!isNew) {
      try {
        const token = await getAccessTokenSilently();
        const edu_id = education[index]._id;
        const response = await axios.delete(
          "https://nikoapi.alexa.moe/api/education/v2",
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

  // New Save Function
  const handleSaveEducationEntry = async (index) => {
    setError(null);
    setSuccessMessage("");
    console.log("Attempting save");

    // Check for empty fields
    if (
      !education[index].institution ||
      !education[index].degree ||
      !education[index].field ||
      !education[index].gpa ||
      !education[index].startDate ||
      !education[index].endDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check Input and Regex (Combined)
    const newValidation = [...validation];
    newValidation[index] = {
      validGPA: gpa_regex.test(education[index].gpa),
      validStartDate: date_regex.test(education[index].startDate),
      validEndDate: date_regex.test(education[index].endDate),
    };
    setValidation(newValidation);

    const hasErrors =
      !newValidation[index].validGPA ||
      !newValidation[index].validStartDate ||
      !newValidation[index].validEndDate;

    if (hasErrors) {
      console.log("Bad Input");
      setError("Please correct the invalid fields."); // Set a general error message
      return;
    }

    // Prepare data for save
    try {
      const token = await getAccessTokenSilently();
      const formattedData = {
        _id: education[index]._id,
        Institute: education[index].institution,
        Location: null, // doesn't exist yet
        Degree: education[index].degree,
        Major: education[index].field,
        GPA: education[index].gpa,
        Start_Date: education[index].startDate,
        End_Date: education[index].endDate,
        RelevantCoursework: null, //edu.RelevantCoursework
        other: null, //edu.other
      };

      // Make addition or update existing entry
      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/education/v2",
        { education: [formattedData] }, // Send as an array
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status === "Success") {
        setSuccessMessage("Education entry saved successfully!");
        console.log(response.data.data);
        const updated = [...education];

        if (response.data.newEntry) {
          updated[index] = {
            _id: response.data.data._id,
            institution: response.data.data.Institute,
            degree: response.data.data.Degree,
            field: response.data.data.Major,
            gpa: response.data.data.GPA,
            startDate: response.data.data.Start_Date,
            endDate: response.data.data.End_Date,
          };
        } else {
          updated[index] = {
            _id: response.data.data[0]._id,
            institution: response.data.data[0].Institute,
            degree: response.data.data[0].Degree,
            field: response.data.data[0].Major,
            gpa: response.data.data[0].GPA,
            startDate: response.data.data[0].Start_Date,
            endDate: response.data.data[0].End_Date,
          };
        }
        setEducation(updated);
        syncValidation(education);
      } else {
        await fetchEducationInfo();
      }
    } catch (err) {
      console.error("Save failed:", err);
      setError(
        "Failed to save education entry: " +
          (err.response?.data?.message || err.message)
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
          <Box
            sx={{
              position: "fixed",
              top: 20, // adjust if needed to not overlap with success
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              width: "auto",
              maxWidth: 600,
            }}
          >
            <Alert
              severity="error"
              variant="filled"
              onClose={() => setError("")}
              sx={{
                padding: "20px",
                minHeight: "20px",
                animation: "fadeIn 0.8s ease-in-out",
                "@keyframes fadeIn": {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
              }}
            >
              {error}
            </Alert>
          </Box>
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

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Education Information
          </Typography>
          <form onSubmit={handleSubmit}>
            {education.map((edu, index) => (
              <Box
                key={index}
                data-education-id={edu._id} // Embedding the unique ID
                sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <TextField
                  fullWidth
                  label="Institution"
                  required
                  margin="normal"
                  value={edu.institution || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].institution = e.target.value;
                    setEducation(updated);
                  }}
                />
                <TextField
                  fullWidth
                  label="Degree"
                  required
                  margin="normal"
                  value={edu.degree || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].degree = e.target.value;
                    setEducation(updated);
                  }}
                />
                <TextField
                  fullWidth
                  label="Field of Study"
                  required
                  margin="normal"
                  value={edu.field || ""}
                  onChange={(e) => {
                    const updated = [...education];
                    updated[index].field = e.target.value;
                    setEducation(updated);
                  }}
                />
                <TextField
                  fullWidth
                  label="GPA"
                  required
                  margin="normal"
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
                  fullWidth
                  label="Start Date"
                  required
                  margin="normal"
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
                    Start date must have a 4-digit year (e.g., 2018), 'Present',
                    or 'present'
                  </Typography>
                )}
                <TextField
                  fullWidth
                  label="End Date"
                  required
                  margin="normal"
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
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 0.25 }}
                    onClick={() => handleSaveEducationEntry(index)}
                  >
                    Save Education Entry
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      const updated = education.filter((_, i) => i !== index);
                      setEducation(updated);
                      syncValidation(updated);
                      handleDeleteEducationEntry(index); // Delete function
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove Education
                  </Button>
                </Box>
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
              {/*<Button type="submit" variant="contained" color="primary">
                Save Education
              </Button>*/}
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default EducationInfo;
