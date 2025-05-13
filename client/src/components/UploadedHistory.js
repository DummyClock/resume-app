import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTheme } from "../context/ThemeContext";

const ResumeContent = ({ content }) => {
  const theme = useMuiTheme();
  const { darkMode } = useTheme();
  if (!content) return null;

  return (
    <Box sx={{ p: 2 }}>
      {/* Education Section */}
      {content.education && content.education.length > 0 && (
        <>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mt: 0, color: theme.palette.text.primary }}
          >
            Education
          </Typography>
          {content.education.map((edu, index) => (
            <Box key={index} sx={{ mb: 2, ml: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                {edu.institute || edu.Institute}, {edu.location || edu.Location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.degree || edu.Degree} in {edu.major || edu.Major}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GPA: {edu.gpa || edu.GPA}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.startDate || edu.Start_Date} -{" "}
                {edu.endDate || edu.End_Date}
              </Typography>
              <Typography
                color="text.primary"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
              >
                Relevant Coursework:
              </Typography>
              {(edu.relevantCoursework || edu.RelevantCoursework) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "12px", ml: 4 }}
                >
                  {edu.relevantCoursework || edu.RelevantCoursework}
                </Typography>
              )}
            </Box>
          ))}
        </>
      )}

      {/* Career Section */}
      {content.work_experience && content.work_experience.length > 0 && (
        <>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mt: 3, color: theme.palette.text.primary }}
          >
            Career
          </Typography>
          {content.work_experience.map((exp, index) => (
            <Box key={index} sx={{ mb: 2, ml: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                {exp.Job_Title} at {exp.Company}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exp.Location} | {exp.Start_Date} – {exp.End_Date}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {exp.Responsibilities &&
                  exp.Responsibilities.map((r, i) => (
                    <ListItem key={i} sx={{ ml: 2 }}>
                      <Typography variant="body2" color="text.primary">
                        • {r}
                      </Typography>
                    </ListItem>
                  ))}
              </Typography>
            </Box>
          ))}
        </>
      )}

      {/* Skills Section */}
      {content.skills && (
        <>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mt: 3, color: theme.palette.text.primary }}
          >
            Skills
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {content.skills.map((skill, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  bgcolor: darkMode
                    ? theme.palette.primary.dark
                    : theme.palette.primary.light,
                  color: darkMode
                    ? theme.palette.primary.contrastText
                    : theme.palette.primary.contrastText,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                {skill}
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

const UploadedHistory = ({ triggerUploadRefresh }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [formattedResume, setFormattedResume] = useState(null);
  const [expanded, setExpand] = useState(false);
  const [deleteWarningPopUp, showDeleteWarningPopUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [refresh, setRefresh] = useState(false);
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  useEffect(() => {
    setRefresh(false);
    fetchResumes();
  }, [getAccessTokenSilently, refresh, triggerUploadRefresh]);

  const fetchResumes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/resume", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data.data);
      if (response.data && response.data.data) {
        setResumes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setError(error.response?.data?.message || "Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = (resume) => {
    setSelectedResume(resume);
  };

  const handleOpenDialog = () => {
    setExpand(true);
  };

  const handleCloseDialog = () => {
    setExpand(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const deleteWarning = (resume) => {
    //console.log(resume._id)
    showDeleteWarningPopUp(true);
  };

  const closeDeletePopUp = () => {
    showDeleteWarningPopUp(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deleteResume = async (resume_id) => {
    //console.log(resume._id )
    const token = await getAccessTokenSilently();
    const response = await axios.delete(
      `https://nikoapi.alexa.moe/api/resume/${resume_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log(response.message)
    showDeleteWarningPopUp(false);
    setSelectedResume(null);
    setSuccessMessage("Resume File Deleted");
    setRefresh(true);
  };

  return (
    <Box
      sx={{
        minHeight: "1000",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box sx={{ maxWidth: 1800, mx: "auto", p: 3, display: "flex" }}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            width: 400,
            overflow: "auto",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <Typography variant="h5" gutterBottom>
            My Parsed Resumes
          </Typography>

          {/** Toast Message */}
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

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && resumes.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", my: 4 }}
            >
              No resumes uploaded yet.
            </Typography>
          )}

          <List>
            {resumes.map((resume, index) => (
              <React.Fragment key={resume._id}>
                {index > 0 && <Divider />}
                <ListItem
                  onClick={() => handleViewResume(resume)}
                  alignItems="flex-start"
                  sx={{
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    cursor: "pointer",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        component="div"
                        color="text.primary"
                      >
                        {resume.nickName || "New Resume Entry"}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Uploaded: {formatDate(resume.createdAt)}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
        {/* View Resume Details off to the right side */}
        <Paper
          sx={{
            p: 3,
            maxWidth: 1600,
            bgcolor: theme.palette.background.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 900,
            height: 700,
            color: theme.palette.text.primary,
          }}
        >
          {!selectedResume && (
            <Typography color="text.secondary">
              Tap a Resume to See Details
            </Typography>
          )}
          {selectedResume && (
            <Box
              sx={{
                maxWidth: 800,
                maxHeight: 1000,
                height: 600,
                overflow: "auto",
                margin: "auto",
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">
                    {selectedResume.nickName || "New Resume Entry"}
                  </Typography>
                  <div>
                    <Button>
                      <OpenInFullIcon
                        onClick={handleOpenDialog}
                      ></OpenInFullIcon>
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => deleteWarning(selectedResume)}
                      sx={{ mt: 1, margin: "2px" }}
                    >
                      <DeleteIcon sx={{ color: "red" }}></DeleteIcon>
                    </Button>
                  </div>
                </Box>

                {/* Main content */}
                <Box>
                  {selectedResume && (
                    <ResumeContent content={selectedResume?.parsedData} />
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>

      {/**Delete Warning Pop Up */}
      <Dialog
        open={deleteWarningPopUp}
        onClose={closeDeletePopUp}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            Warning!
            <Button onClick={closeDeletePopUp}>X</Button> {/* Close button */}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <p>
            You are about to delete an a resume. You cannot undo this action. Do
            you wish to continue?
          </p>
          <div style={{ "padding-left": "20px" }}>
            <Button
              sx={{ color: "red", borderColor: "#FF6347" }}
              variant="outlined"
              onClick={() => deleteResume(selectedResume._id)}
            >
              Delete
            </Button>
            <Button onClick={closeDeletePopUp}>Cacnel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/*Resume Expand Pop up*/}
      <Dialog
        open={expanded}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "80vh",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {selectedResume && "Resume Entry"}
            <Button onClick={handleCloseDialog}>Close</Button>{" "}
            {/* Close button */}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedResume && (
            <ResumeContent content={selectedResume?.parsedData} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => deleteWarning(selectedResume)}>
            <DeleteIcon />
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadedHistory;
