import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import WillemDafoe from "../../src/w_da_foe2.png";
import EditIcon from "@mui/icons-material/Edit";
import Chip from '@mui/material/Chip';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";
const  wd = "https://youtu.be/IokAMCZlz0w?t=142"

const Dashboard = () => {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [careerHistory, setCareerHistory] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillError, setSkillError] = useState(false);
  const [skillErrorMsg, setSkillErrorMsg] = useState("");
  const { darkMode } = useTheme();
  const theme = useMuiTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await getAccessTokenSilently();

      // Fetch career history
      const careerResponse = await axios.get("https://nikoapi.alexa.moe/api/career-history/history_v2", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      console.log("Career history response:", careerResponse.data);
      setCareerHistory(careerResponse.data.data || []);

      // Fetch education
      const educationResponse = await axios.get("https://nikoapi.alexa.moe/api/education/v2", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      console.log("Education response:", educationResponse.data);
      setEducation(educationResponse.data.data || []);

      // Fetch Skills
      const skillResponse = await axios.get("https://nikoapi.alexa.moe/api/skills", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      console.log("Skill response:", skillResponse.data);
      setSkills(skillResponse.data.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleCloseAlert = () => {
        setError(null);
        setSkillErrorMsg(null);
  };
  
  if (error) {
    return <Alert variant="outlined" severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>{error}</Alert>;
  }

  // Opens textbox
  const addSkill = () => {
    setIsAddingSkill(true)
  }

  // Handles the removal of skill chips
  const handleDelete = async (skill) => {
    try {
      const token = await getAccessTokenSilently(); // Get token
      const skillResponse = await axios.delete(`https://nikoapi.alexa.moe/api/skills/${encodeURIComponent(skill)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
  
      if (skillResponse.status === 200) {
        // Remove the skill from the local state by filtering out the deleted skill
        setSkills(prevSkills => prevSkills.filter(s => s !== skill));
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  // Handle Saving New Skill or Canceling it
  const handleKeyDown = async (e) => {
    try{
      if(e.key === 'Enter'){
        // Initial Screening
        newSkillValid()
        setSkillError(false)
        
        // Call api to add newSkill (blocks duplicates)
        await addSkill_2_Db(newSkill);

        // Cleanup
        setNewSkill("")
        setIsAddingSkill(false)
      }else if (e.key === 'Escape'){  // Cancel
        setIsAddingSkill(false)
      }}
    catch (error) { // Illegal entry (dup or space)
      console.log('Bad skill input')
      setSkillErrorMsg(error.message)
    }
  }

  // Call API to add Skill
    const addSkill_2_Db = async (newSkill) => {
      try {
        const token = await getAccessTokenSilently(); // Get token
        const skillResponse = await axios.put(`https://nikoapi.alexa.moe/api/skills/${newSkill}`, {}, { 
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        });
  
        if (skillResponse.status === 200) {
          // Update local state
          setSkills(prevSkills => [...prevSkills, newSkill]);
          setSkillError(false)
        } else {
          console.log(skillResponse)
          setSkillError(true); 
          setSkillErrorMsg(skillResponse.data?.message || "Failed to add skill")
        }
      } catch (error) {
        console.error("Error adding skill:", error);
        setSkillError(true);
        setSkillErrorMsg(error.response?.data?.message || "Failed to add skill due to an error."); 
      }
    };

  // Gatekeep skill input (no pure whitespace)
  const newSkillValid = () =>{
    newSkill.trim().length > 0 || (() => { setSkillError(true); throw new Error("'Nothing' isn't a skill. Entry must not be empty. "); })();
  }

  // Call API to delete skill
  const deleteSkill_2_Db = async (newSkill) => {
    try {
      const token = await getAccessTokenSilently(); // Get token
      const skillResponse = await axios.put(`https://nikoapi.alexa.moe/api/skills/${newSkill}`, {}, { 
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      if (skillResponse.status === 200) {
        // Update local state
        setSkills(prevSkills => [...prevSkills, newSkill]);
      }
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Skill Display */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box>
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <AutoStoriesIcon sx={{ mr: 1 }} />
            Skills
          </Typography>
          <Box sx={{ alignItems: "center" ,
            display: 'flex',
            flexWrap: 'wrap', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            p: '30px'
          }}>
            {skills.length > 0 && skills.map((s, index) => (
              <Chip key={index} 
                label={s} 
                variant="outlined"
                sx={{color:'white', background:'#6495ED'}}
                //onDoubleClick={editChip(index)}
                onDelete ={() => handleDelete(s)}/>
            ))}
            {!isAddingSkill 
              ? <Chip onClick={addSkill} variant="outlined" label="+ New Skill" sx={{borderWidth:"3px", fontWeight:"light", borderColor: "#6495ED"}}></Chip> 
              : <TextField placeholder="Type here" variant="standard" autoFocus 
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px', }, }}
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleKeyDown}
                > </TextField>
            }
          </Box>
            {/*Default msg*/ skills.length === 0 && (
              <Typography
                sx={{ textAlign: "center", fontWeight: 'bold', color:'#636363', padding:'16px'}}
              >Add in your skills!</Typography>)}
            {/* Error msg for skills */ skillError && (
              <Alert variant="outlined" severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>{skillErrorMsg}</Alert>
            )}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <WorkIcon sx={{ mr: 1 }} />
            Career History
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate("/career-history")}
          >
            Edit Career History
          </Button>
        </Box>
        <List>
          {careerHistory.map((job, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={job.Job_Title || job.position || job["Job_Title(s)"]}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {job.Company || job.company}
                      </Typography>
                      {job.Location && (
                        <>
                          <br />
                          {job.Location}
                        </>
                      )}
                      <br />
                      {job.Start_Date || job.startDate} -{" "}
                      {job.End_Date || job.endDate}
                      <br />
                      {Array.isArray(job.Responsibilities)
                        ? job.Responsibilities.map((resp, i) => (
                            <React.Fragment key={i}>
                              • {resp}
                              <br />
                            </React.Fragment>
                          ))
                        : job.description}
                    </>
                  }
                />
              </ListItem>
              {index < careerHistory.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {careerHistory.length === 0 && (
            <ListItem>
              <ListItemText primary="No career history available" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <SchoolIcon sx={{ mr: 1 }} />
            Education
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate("/education")}
          >
            Edit Education
          </Button>
        </Box>
        <List>
          {education.map((edu, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={edu.Degree || edu.degree}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {edu.Institute || edu.institution}
                      </Typography>
                      <br />
                      {edu.Major || edu.field}
                      <br />
                      {"GPA:"} {edu.GPA || edu.gpa}
                      <br />
                      {edu.Start_Date || edu.startDate} -{" "}
                      {edu.End_Date || edu.endDate}
                    </>
                  }
                />
              </ListItem>
              {index < education.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {education.length === 0 && (
            <ListItem>
              <ListItemText primary="No education information available" />
            </ListItem>
          )}
        </List>
      </Paper>
      <div>
        <a href={wd}><img src={WillemDafoe} alt="'The man! The myth! The legend!" style={{opacity: 0.005, width:"150px"}}/></a>
      </div>
    </Box>
  );
};

export default Dashboard;
