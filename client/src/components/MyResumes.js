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
  ListItemButton,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
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
import NavBar from "./NavBar";
import BasicImg from "../basic.png";
import BasicIntrImg from "../basic_interactive.png";
import ModernImg from "../modern.png";
import SplitImg from "../split.png";
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import Markdown from 'markdown-to-jsx';

const ResumeContent = ({ content }) => {
  if (!content) return null;

  return (
    <Box sx={{ p: 2 }}>
      {/* Summary Section */}
      <Typography variant="h6" gutterBottom>
        Professional Summary
      </Typography>
      <Typography>{content.summary}</Typography>

      {/* Experience Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Experience
      </Typography>
      {content.experience.map((exp, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {exp.title} at {exp.company}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {exp.duration}
          </Typography>
          <List dense>
            {exp.achievements.map((achievement, i) => (
              <ListItem key={i}>
                <Typography variant="body2" component="span">
                  • {achievement}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}

      {/* Skills Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Skills
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {content.skills.map((skill, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {skill}
          </Typography>
        ))}
      </Box>

      {/* Education Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Education
      </Typography>
      {content.education.map((edu, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {edu.degree}
          </Typography>
          <Typography variant="body2">
            {edu.institution} • {edu.year}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const MyResumes = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openAdviceDialog, setOpenAdviceDialog] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [formattedResume, setFormattedResume] = useState(null);
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  //for template previews
  const [selectedTemplate, setSelectedTemplate] = React.useState(0);
  const templates = [
    {
      id: 1,
      title: "Basic",
      image: BasicImg,
      formattedTitle: "basic",
    },
    {
      id: 2,
      title: "Basic Interative",
      image: BasicIntrImg,
      formattedTitle: "basic_interactive",
    },
    {
      id: 3,
      title: "Modern",
      image: ModernImg,
      formattedTitle: "modern",
    },
    {
      id: 4,
      title: "Split",
      image: SplitImg,
      formattedTitle: "split",
    },
  ];

  //format selector dropdown
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const open = Boolean(anchorEl);

  const format_options = ["html", "markup", "plaintext"];

  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  useEffect(() => {
    fetchResumes();
    //fetchAdvice();
  }, [getAccessTokenSilently]);

  const fetchResumes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/resumes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    console.log(resume);
    setSelectedIndex(-1);
    setSelectedResume(resume);
    setOpenDialog(true);
  };

  const fetchAdvice = async (resumeId) => {
    try {
      setAdviceLoading(true);
      setAdviceError("");
      const token = await getAccessTokenSilently();
      console.log("Token: ", token);
      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/jobs/advice",
        {
          resumeId: resumeId,
          //jobId:
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.data) {
        console.log(response.data.data);
        setAdvice(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching advice:", error);
      setAdviceError(
        error.response?.data?.message || "Failed to fetch advice."
      );
    } finally {
      setAdviceLoading(false);
    }
  };

  const handleViewAdvice = (resumeAdvice, position, company) => {
    setJob(position);
    setCompany(company);
    //setAdvice(resumeAdvice);
    fetchAdvice(resumeAdvice);
    setOpenAdviceDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResume(null);
    setFormattedResume(null);
  };

  const handleCloseAdviceDialog = () => {
    setOpenAdviceDialog(false);
    setAdvice(null);
  };

  const handleCloseAlert = () => {
        setError(null);
        setAdviceError(null);
    };

  const handleMenuClick = async (resume, format_ind, template_ind) => {
    try {
      const token = await getAccessTokenSilently();
      let template = "basic";
      if (template_ind != -1) {
        template = templates[template_ind].formattedTitle;
        console.log(template);
      }
      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/format",
        {
          resumeId: resume,
          formatType: format_options[format_ind],
          templateId: template,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Formatted resume:", response.data);
      setFormattedResume(response.data);
    } catch (error) {
      console.error("Error getting formatted resume:", error);
    }
  };

  const handleMenuItemClick = (event, index, resume) => {
    setSelectedIndex(index);
    handleMenuClick(resume, index, -1);
    setAnchorEl(null);
  };

  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSelectedIndex(-1);
    setSelectedTemplate(0);
    setAnchorEl(null);
  };

  const handleDownload = async (resume) => {
    try {
      const token = await getAccessTokenSilently();
      const format = format_options[selectedIndex];
      console.log("Selected format: " + format);
      const template = templates[selectedTemplate].formattedTitle;
      console.log("Selected template: " + template);
      const response = await axios.get(
        `https://nikoapi.alexa.moe/api/resumes/download/${resume._id}/${format}/basic/${template}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/octet-stream" })
      );
      const link = document.createElement("a");

      link.href = url;
      link.download = response.headers["content-disposition"]
        ? response.headers["content-disposition"].match(
            /filename="?([^"]+)"?/
          )[1]
        : "downloaded_resume";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error getting formatted resume:", error);
    }
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            My Resumes
          </Typography>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert variant="outlined" severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && resumes.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", my: 4 }}
            >
              No resumes generated yet. Go to the Resume Generation page to
              create one!
            </Typography>
          )}

          <List>
            {resumes.map((resume, index) => (
              <React.Fragment key={resume._id}>
                {index > 0 && <Divider />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="div">
                        Resume for {resume.jobTitle} at {resume.company}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Generated on: {formatDate(resume.createdAt)}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewResume(resume)}
                          sx={{ mt: 1, margin: "2px" }}
                        >
                          View Resume
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleViewAdvice(
                              resume,
                              resume.jobTitle,
                              resume.company
                            )
                          }
                          sx={{ mt: 1, margin: "2px" }}
                        >
                          View Advice
                        </Button>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      {/*View Resume*/}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth='md' // changed to false
        slotProps={{
          sx: { minHeight: "80vh" },
        }}
      >
        <DialogTitle>
          {selectedResume &&
            `Resume for ${selectedResume.jobTitle} at ${selectedResume.company}`}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ maxWidth: "100%" }}>
            {formattedResume ? (
              selectedIndex === 0 ? (
              <pre style={{ whiteSpace: "normal", wordBreak: "break-word", margin: 0, padding: 3, background: "white", color: "black", borderRadius: 2}}>
                <div style={{
                  margin: 0, 
                  padding: 0, 
                  lineHeight: '1.5', 
                }} 
                dangerouslySetInnerHTML={{ __html: formattedResume }} />
              </pre>
              ) : selectedIndex === 1 ? (
                <Markdown>{formattedResume}</Markdown>
                
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {formattedResume}
              </pre>
              )
            ) : (
              selectedResume && (
                <ResumeContent content={selectedResume.content} />
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {selectedIndex === 0 && (
            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                display: "flex",
                justifyContent: "center",
                padding: 1,
              }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                {templates.map((card, index) => (
                  <Card sx={{ width: 160, flexShrink: 0 }}>
                    <CardActionArea
                      onClick={() => {
                        setSelectedTemplate(index);
                        handleMenuClick(selectedResume, 0, index);
                      }}
                      data-active={selectedTemplate === index ? "" : undefined}
                      sx={{
                        flex: 1, // new
                        display: "flex", // new
                        flexDirection: "column", // new
                        // height: '100%',
                        "&[data-active]": {
                          backgroundColor: "action.selected",
                          "&:hover": {
                            backgroundColor: "action.selectedHover",
                          },
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={card.image}
                        sx={{
                          height: 90, // fixed image height (new)
                          objectFit: "contain", // new
                        }}
                      />
                      <CardContent
                        sx={{
                          flexGrow: 1, // new
                          overflow: "hidden", // new
                          padding: "4px", // new
                          //height: '100%'
                        }}
                      >
                        <Typography variant="body2" component="div">
                          {card.title}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </DialogActions>
        <DialogActions>
          <List
            component="nav"
            aria-label="Format Selection"
            sx={{ bgcolor: "background.paper" }}
          >
            <ListItemButton
              id="format-button"
              aria-haspopup="listbox"
              aria-controls="format-menu"
              aria-label="format"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClickListItem}
            >
              <ListItemText
                primary="Format as:"
                secondary={
                  selectedIndex === -1
                    ? "Select a format"
                    : format_options[selectedIndex]
                }
              />
            </ListItemButton>
          </List>
          <Menu
            id="format-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "format-button",
              role: "listbox",
            }}
          >
            {format_options.map((option, index) => (
              <MenuItem
                key={option}
                selected={index === selectedIndex}
                onClick={(event) =>
                  handleMenuItemClick(event, index, selectedResume)
                }
              >
                {option}
              </MenuItem>
            ))}
          </Menu>
          <Button
            onClick={() => handleDownload(selectedResume, selectedIndex, selectedTemplate)}
            disabled={selectedIndex === -1}
          >
            Download
          </Button>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
        <Menu
          id="download_options"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          keepMounted
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        ></Menu>
      </Dialog>

      {/*View Advice************************************************/}
      <Dialog
        open={openAdviceDialog}
        onClose={handleCloseAdviceDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: "80vh" },
        }}
      >
        <DialogTitle>
          Advice for {job} at {company}
        </DialogTitle>
        {error && (
          <Alert variant="outlined" severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContent>
          {adviceLoading ? (
            <Typography>Loading advice...</Typography>
          ) : advice ? (
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
              <Markdown>{advice}</Markdown>
            </pre>
          ) : (
            <Typography>No advice available.</Typography>
          )}
        </DialogContent>
        {adviceError && (
          <Alert variant="outlined" severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>
            {adviceError}
          </Alert>
        )}
        <DialogActions>
          <Button onClick={handleCloseAdviceDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyResumes;
