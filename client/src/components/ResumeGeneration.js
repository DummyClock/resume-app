import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  Checkbox,
  Divider,
  MenuItem,
  ListItem,
  ListItemText,
  Select,
  InputLabel,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from "@mui/material";
import NavBar from "./NavBar";
import StatusChecker from "./StatusChecker";
import ChecklistSelect from "./ChecklistSelect";
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { marked } from "marked";

//----------------- Functions ------------------------------
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// can be passed into the 'rightSideDisplayFunction' prop to show data on the right side of the checklist component
const ResumeContent = ({ content }) => {
  if (!content) return null;

  const parsedData = content.parsedData || {}; // Add a fallback in case parsedData is missing

  return (
    <Box sx={{ p: 2 }}>
      {parsedData.education && parsedData.education.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 0 }}>
            Education
          </Typography>
          {parsedData.education.map((edu, index) => (
            <Box key={index} sx={{ mb: 2, ml: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
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
      {parsedData.work_experience && parsedData.work_experience.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Career
          </Typography>
          {parsedData.work_experience.map((exp, index) => (
            <Box key={index} sx={{ mb: 2, ml: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {exp.Job_Title} at {exp.Company}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exp.Location} | {exp.Start_Date} – {exp.End_Date}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {exp.Responsibilities &&
                  exp.Responsibilities.map((r, i) => (
                    <ListItem key={i} sx={{ ml: 2 }}>
                      <Typography variant="body2">• {r}</Typography>
                    </ListItem>
                  ))}
              </Typography>
            </Box>
          ))}
        </>
      )}

      {/* Skills Section */}
      {parsedData.skills && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Skills
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {parsedData.skills.map((skill, index) => (
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
        </>
      )}
    </Box>
  );
};

// Displays for Individual Tables
const EduContent = ({ content }) => {
  if (!content) return null;

  return (
    <Box sx={{ p: 2 }}>
      {content  && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 0 }}>
            Education
          </Typography>
            <Box sx={{ mb: 2, ml: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {content.institute || content.Institute}, {content?.location || content?.Location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {content?.degree || content?.Degree} in {content?.major || content?.Major}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GPA: {content?.gpa || content?.GPA}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {content?.startDate || content?.Start_Date} -{" "}
                {content?.endDate || content?.End_Date}
              </Typography>
              <Typography
                color="text.primary"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
              >
                Relevant Coursework:
              </Typography>
              {(content.relevantCoursework || content.RelevantCoursework) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "12px", ml: 4 }}
                >
                  {content.relevantCoursework || content.RelevantCoursework}
                </Typography>
              )}
            </Box>
        </>
      )}

    </Box>
  );
};


const CareerContent = ({ content }) => {
  if (!content) return null;

  return (
    <>
      {/* Career Section */}
      {content &&  (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Career
          </Typography>
          <Box sx={{ mb: 2, ml: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {content?.Job_Title} at {content?.Company}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {content?.Location} | {content?.Start_Date} – {content?.End_Date}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {content.Responsibilities &&
                content.Responsibilities.map((r, i) => (
                  <ListItem key={i} sx={{ ml: 2 }}>
                    <Typography variant="body2">• {r}</Typography>
                  </ListItem>
                ))}
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

  

/*-----------------------------------Actual component is here------------------------------------------*/
const ResumeGeneration = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedJobId, setSelectedJobId] = useState("");
  const [generationStatus, setGenerationStatus] = useState("idle");
  const [jobList, setJobList] = useState([]);
  const [resumeId, setResumeId] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resumes, setResumes] = useState(null);
  const [skills, setSkills] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [markedCareerEntries, setMarkedCareerEntries] = useState(new Set());
  const [markedEduEntries, setMarkedEduEntries] = useState(new Set());
  const [careers, setCareers] = useState(null)
  const [edus, setEdus] = useState(null)
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(null);
  const [markedEntries, setMarkedEntries] = useState(new Set());
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  const handleSkillClick = (skill) => {
    setSelectedSkills((prevSelectedSkills) => {
      const newSelectedSkills = new Set(prevSelectedSkills);
      if (newSelectedSkills.has(skill)) {
        newSelectedSkills.delete(skill);
      } else {
        newSelectedSkills.add(skill);
      }
      return newSelectedSkills;
    })}

  useEffect(() => {
    // Clear any existing status when component mounts
    localStorage.removeItem("status");
    localStorage.removeItem("resumeId");
    localStorage.removeItem("error");
    fetchJobList();
    fetchResumes();
    fetchEdus();
    fetchCareers();
    fetchSkills();
  }, [getAccessTokenSilently]);

  // Fetch Job Descriptions
  const fetchJobList = async () => {
    setGenerationStatus("loading");
    setErrorMessage("");
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/job-desc", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setJobList(response.data.data);
      }
      setGenerationStatus("idle");
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch your data. Please try again."
      );
      setGenerationStatus("error");
    } finally {
      if (generationStatus === "loading") {
        setGenerationStatus("idle");
      }
    }
  };

  // Fetch all Resumes
  const fetchResumes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/resume", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setResumes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to fetch resumes"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all Career History
  const fetchCareers = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/career-history/history_v2", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setCareers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to fetch resumes"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all Education History
  const fetchEdus = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/education/v2", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setEdus(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to fetch resumes"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all Skills History
  const fetchSkills = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get("https://nikoapi.alexa.moe/api/skills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setSkills(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to fetch resumes"
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to generate AI resume (for resume selection)
  const handleGenerate = async () => {
    if (!selectedJobId) {
      setErrorMessage("Please select a job you are applying for.");
      return;
    }

    setGenerationStatus("loading");
    setErrorMessage("");
    setResumeId(null);
    setGeneratedMessage("");

    try {
      /** Pull selected data from each entry */
        let selectedCareers = []; let selectedEdus = []; let selectedSkills = [];
        for (const entry of markedEntries) {
          selectedCareers.push(...entry.work_experience);
          selectedEdus.push(...entry.education);
          selectedSkills.push(...entry.skills);
        }
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/resumes/generate_v2",
        { jobId: selectedJobId, selectedCareers : selectedCareers, selectedEdus: selectedEdus, selectedSkills: selectedSkills },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.resumeId) {
        setResumeId(response.data.resumeId);
        setGenerationStatus("success");
        setGeneratedMessage(
          response.data.message || "Resume generation started."
        );

        // Set new status
        localStorage.setItem("resumeId", response.data.resumeId);
        localStorage.setItem("status", "Processing");
      } else {
        throw new Error(
          response.data?.message || "Failed to start resume generation."
        );
      }
    } catch (error) {
      console.error("Error starting resume generation:", error);
      setErrorMessage(
        error.response?.data?.error ||
          error.message ||
          "Failed to start resume generation."
      );
      setGenerationStatus("error");
    }
  };

  // Function to generate AI resume (for manual selection)
  const handleManualGenerate = async () => {
    if (!selectedJobId) {
      setErrorMessage("Please select a job you are applying for.");
      return;
    }

    setGenerationStatus("loading");
    setErrorMessage("");
    setResumeId(null);
    setGeneratedMessage("");


    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/resumes/generate_v2",
        { jobId: selectedJobId, selectedCareers : careers, careers: edus, selectedSkills: Array.from(selectedSkills)},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.resumeId) {
        setResumeId(response.data.resumeId);
        setGenerationStatus("success");
        setGeneratedMessage(
          response.data.message || "Resume generation started."
        );

        // Set new status
        localStorage.setItem("resumeId", response.data.resumeId);
        localStorage.setItem("status", "Processing");

      } else {
        throw new Error(
          response.data?.message || "Failed to start resume generation."
        );
      }
    } catch (error) {
      console.error("Error starting resume generation:", error);
      setErrorMessage(
        error.response?.data?.error ||
          error.message ||
          "Failed to start resume generation."
      );
      setGenerationStatus("error");
    }
  };

  const handleCloseAlert = () => {
        setGeneratedMessage(null);
        setErrorMessage(null);
    };

  const handleJobChange = (event) => {
    setSelectedJobId(event.target.value);
  };

  const handleTabChange = (event) => {
    setCurrentTab(event.target.value);
  };

  // Can use this for the `indexDisplsyFunction` prop to create List items
  const resumeIndexList = (allResumes, handleViewContent, markedEntries, setMarkedEntries) => {
    return allResumes.map((resume, index) => (
      <React.Fragment key={resume._id}>
        {index > 0 && <Divider />}
        <ListItem
          alignItems="flex-start"
          sx={{
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
            cursor: "pointer",
          }}
          onClick={() => handleViewContent(resume)}
        >
          <Checkbox /** Add or remove entries from the markedEntry's set (in the child component) */
            checked={markedEntries.has(resume.parsedData)}
            onChange={(event) => {  
              if (event.target.checked) {
                setMarkedEntries((prevMarked) => new Set(prevMarked).add(resume.parsedData));
              } else {
                setMarkedEntries((prevMarked) => {
                  const nextMarked = new Set(prevMarked);
                  nextMarked.delete(resume.parsedData);
                  return nextMarked;
                });
              }
            }}
          />
          <ListItemText
            primary={
              <Typography variant="subtitle1" component="div">
                {resume.nickName || "New Resume Entry"}
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.secondary">
                  Uploaded: {formatDate(resume.createdAt)}
                </Typography>
              </>
            }
          />
        </ListItem>
      </React.Fragment>
    ));
  };

// Can use this for the `indexDisplsyFunction` prop to create List items
const careerIndexList = (careers, handleViewContent, markedCareerEntries, setMarkedCareerEntries) => {
  return careers.map((career, index) => (
    <React.Fragment key={career._id}>
      {index > 0 && <Divider />}
      <ListItem
        alignItems="flex-start"
        sx={{
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
          cursor: "pointer",
        }}
        onClick={() => handleViewContent(career)}
      >
        <Checkbox
          checked={markedCareerEntries.has(career)}
          onChange={(event) => {
            if (event.target.checked) {
              setMarkedCareerEntries((prevMarked) => new Set(prevMarked).add(career));
            } else {
              setMarkedCareerEntries((prevMarked) => {
                const nextMarked = new Set(prevMarked);
                nextMarked.delete(career);
                return nextMarked;
              });
            }
          }}
        />
        <ListItemText
          primary={
            <Typography variant="subtitle1" component="div">
              {career.Job_Title || "New Career Entry"}
            </Typography>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.secondary">
                {career.Company}
              </Typography>
            </>
          }
        />
      </ListItem>
    </React.Fragment>
  ));
};

// Can use this for the `indexDisplsyFunction` prop to create List items
const eduIndexList = (edus, handleViewContent, markedEduEntries, setMarkedEduEntries) => {
  return edus.map((edu, index) => (
    <React.Fragment key={edu._id}>
      {index > 0 && <Divider />}
      <ListItem
        alignItems="flex-start"
        sx={{
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
          cursor: "pointer",
        }}
        onClick={() => handleViewContent(edu)}
      >
        <Checkbox
          checked={markedEduEntries.has(edu)}
          onChange={(event) => {
            if (event.target.checked) {
              setMarkedEduEntries((prevMarked) => new Set(prevMarked).add(edu));
            } else {
              setMarkedEduEntries((prevMarked) => {
                const nextMarked = new Set(prevMarked);
                nextMarked.delete(edu);
                return nextMarked;
              });
            }
          }}
        />
        <ListItemText
          primary={
            <Typography variant="subtitle1" component="div">
              {edu.Institute || "New Education Entry"}
            </Typography>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.secondary">
                {edu.Degree} in {edu.Major}
              </Typography>
            </>
          }
        />
      </ListItem>
    </React.Fragment>
  ));
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <NavBar />
      {/** Initial Toggle Menu */}
      <Typography variant="h4" sx={{ mt: 4, ml: 4 }}>Generate Your Resume</Typography>
      <FormControl sx={{p: "2%"}}>
        <FormLabel id="demo-radio-buttons-group-label">How would you like to generate your resume?</FormLabel>
        <RadioGroup
          row
          //aria-labelledby="demo-radio-buttons-group-label"
          //defaultValue="manual"
          name="radio-buttons-group"
          onChange={handleTabChange}
        >
          <FormControlLabel value="manual" control={<Radio />} label="Manually Select Data" />
          <FormControlLabel value="resume" control={<Radio />} label="Use Resume Data" />
        </RadioGroup>
      </FormControl>

      {/** Manual Selection Menu */}
        {currentTab === "manual" && (
          <>
            <ChecklistSelect
              checklist_name="Career"
              full_content={careers}
              indexDisplayFunction={(full_content, handleViewContentFromChild, markedCareerEntries, setMarkedCareerEntries) =>
                careerIndexList(full_content, handleViewContentFromChild, markedCareerEntries, setMarkedCareerEntries)
              }
              rightSideDisplayFunction={(selectedEntry) => (
                <CareerContent content={selectedEntry} />
              )}
              markedEntries={markedCareerEntries}
              setMarkedEntries={setMarkedCareerEntries}
            />
            <ChecklistSelect
              checklist_name="Education"
              full_content={edus}
              indexDisplayFunction={(full_content, handleViewContentFromChild, markedEduEntries, setMarkedEduEntries) =>
                eduIndexList(full_content, handleViewContentFromChild, markedEduEntries, setMarkedEduEntries)
              }
              rightSideDisplayFunction={(selectedEntry) => (
                <EduContent content={selectedEntry} />
              )}
              markedEntries={markedEduEntries}
              setMarkedEntries={setMarkedEduEntries}
            />
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                  {/**<AutoStoriesIcon sx={{ mr: 1 }} />*/}
                  Skills
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1.5,
                    p: "30px",
                  }}
                >
                  {skills && skills.length > 0 ? (
                    skills.map((s, index) => (
                      <Chip
                        key={index}
                        label={s}
                        variant="outlined"
                        sx={{
                          color:'white', 
                          background:'#6495ED',
                          borderColor: "#6495ED",
                        }}
                        onClick={() => handleSkillClick(s)}
                      />
                    ))
                  ) : (
                    <Typography
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#636363",
                        padding: "16px",
                      }}
                    >
                      No skills added yet!
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </>
        )}
        {currentTab === "resume" && (
          <ChecklistSelect
            checklist_name="Resume"
            full_content={resumes}
            indexDisplayFunction={(full_content, handleViewContentFromChild, markedEntriesFromChild, setMarkedEntriesFromChild) =>
              resumeIndexList(full_content, handleViewContentFromChild, markedEntriesFromChild, setMarkedEntriesFromChild)
            }
            rightSideDisplayFunction={(selectedEntry) => (
              <ResumeContent content={selectedEntry} />
            )}
            markedEntries={markedEntries} // Pass markedEntries as a prop
            setMarkedEntries={setMarkedEntries} // Pass setMarkedEntries as a prop
          />
        )} 

      {/** Submit Area */}
      {currentTab && (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Generate Your Resume!
          </Typography>

          {generationStatus === "loading" && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
                Starting resume generation...
              </Typography>
            </Box>
          )}

          {errorMessage && (
            <Alert variant="outlined" onClose={handleCloseAlert} severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {generationStatus !== "loading" && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel id="job-listing-label">
                  Select Job You Are Applying For
                </InputLabel>
                <Select
                  labelId="job-listing-label"
                  id="job-listing"
                  value={selectedJobId}
                  onChange={handleJobChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {jobList.map((job) => (
                    <MenuItem key={job._id} value={job._id}>
                      {job.job_title || "Job"} at {job.company || "Company"}
                    </MenuItem>
                  ))}
                  {jobList.length === 0 && (
                    <MenuItem disabled>No job listings available.</MenuItem>
                  )}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={currentTab === "resumes" ? handleGenerate : handleManualGenerate}
                fullWidth
                disabled={generationStatus === "loading" || !selectedJobId}
                sx={{ mt: 3 }}
              >
                Generate Resume
              </Button>

              <StatusChecker resumeId={resumeId} />

              {generationStatus === "success" && generatedMessage && (
                <Alert severity="info" sx={{ mt: 2 }} variant="outlined" onClose={handleCloseAlert}>
                  {generatedMessage} - Resume ID: {resumeId}
                  <Typography variant="body2" color="text.secondary">
                    You can check the generation status using the Resume ID.
                  </Typography>
                </Alert>
              )}

              {generationStatus === "error" && errorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}variant="outlined" onClose={handleCloseAlert}>
                  {errorMessage}
                </Alert>
              )}
            </>
          )}
        </Paper>
      </Box>
      )}
      

    </Box>
  );
};

export default ResumeGeneration;
