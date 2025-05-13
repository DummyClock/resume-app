import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import {
  Avatar,
  Alert,
  Box,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TextField,
  //CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";

const UserProfile  = () => {
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();
    const { user, isAuthenticated } = useAuth0();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [tempPhoneNumber, setTempPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [tempEmail, setTempEmail] = useState("");
    const [isPhoneNumberDialogOpen, setIsPhoneNumberDialogOpen] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploadError, setUploadError] = useState(null);
    //const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [isNameMenuOpen,setIsNameMenuOpen] = useState(false)
    const [tempName, setTempName] = useState("");
    const { darkMode } = useTheme();
    const theme = useMuiTheme();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d+$/;
    
    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/');
            return;
        }
        fetchEmail();
        fetchPhoneNumber();
        fetchProfilePhoto();
    }, [isAuthenticated, navigate])

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    /*
    const handleUseAccountIcon = () => {
        setAvatarUrl(null); //Reset to default/Auth0 picture
        handleMenuClose();
    };*/

    //Get Phone Number
    const fetchPhoneNumber = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get("https://nikoapi.alexa.moe/api/user-profile/phone", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.status === 204){
                console.log("User has no existing phone number. 204");
                setPhoneNumber("");
            }
            else  if (response.status === 200 || response.status === 304){
                console.log("User has existing phone number. 200/304");
                setPhoneNumber(response.data.phoneNumber);
            }
        }
        catch (error){
            console.error("Error saving phone number:", error);
            setError("Failed to save phone number."); 
        }
    };

  const handleSetPhoneNumber = async () => {
    setTempPhoneNumber(phoneNumber);
    setIsPhoneNumberDialogOpen(true);
  };

    const handleClosePhoneDialog = () => { 
        setIsPhoneNumberDialogOpen(false); 
        setTempPhoneNumber("");
    };
    
    const handlePhoneInputChange = (event) => {
        setTempPhoneNumber(event.target.value); //update temp and still display old number until save

    };

    const handleSavePhone = async () => {
        setIsPhoneNumberDialogOpen(false);

        if (tempPhoneNumber.length !== 10 ){
            setError("Phone number must  be 10 digits.");
            return;
        }
        else if (phoneRegex.test(tempPhoneNumber)){
            setPhoneNumber(tempPhoneNumber);
        } 
        else {
            setError("Phone number must be 10 digits.");
            return;
        }

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        "https://nikoapi.alexa.moe/api/user-profile/phone",
        { phone: tempPhoneNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data && response.data.user.phone) {
        setPhoneNumber(response.data.user.phone);
        setSuccessMessage("Successfully saved phone number.");
      } else if (response.data && response.data.data) {
        setSuccessMessage(response.data.message);
        setError(null);
      }
      setTempPhoneNumber("");
    } catch (error) {
      console.error("Error saving phone number:", error);
      setError("Failed to save phone number.");
      setSuccessMessage("");
      setTempPhoneNumber("");
    }
  };

    const handleNameChange = async (event) => {
    const newName = event.target.value;
    setTempName(newName); 
    };

    const handleSaveName = async () => {
    setIsNameMenuOpen(false);
    
    if (!tempName || tempName.trim() === '') {
        setError("Name cannot be empty!");
        return;
    }

    try {
        const token = await getAccessTokenSilently();
        const response = await axios.post("https://nikoapi.alexa.moe/api/auth/updateName",
            { userId: user.sub, newName: tempName},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (response.status === 200) {
            setSuccessMessage("Name updated successfully!");
            window.location.reload();
        }
    } catch (error) {
        console.error("Error updating name:", error);
        setError("Failed to update name. Please try again.");
    }
    };

     //Get Email
     const fetchEmail = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get("https://nikoapi.alexa.moe/api/user-profile/email", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.status === 200 || response.status === 304){
                console.log("Grabbing email. 200/304");
                setEmail(response.data.primaryEmail);
            }
        }
        catch (error){
            console.error("Error saving email:", error);
            setError("Failed to get email."); 
        }
    };

    //handle Email Update
    const handleSetEmail = () => {
        setIsEmailDialogOpen(true);
    } 

    const handleCloseEmailDialog = () => {
        setIsEmailDialogOpen(false);
    };

    const handleEmailInputChange = (event) => {
        setTempEmail(event.target.value);
    };

    const handleSaveEmail = async () => {
        setIsEmailDialogOpen(false);
        console.log("temp: ", tempEmail);
        if (tempEmail === email){
            setSuccessMessage("Email is the same.");
            return;
        }
        if (tempEmail === ''){
            setError("Email cannot be empty!");
            return;
        }
        if (!emailRegex.test(tempEmail)) { // Check for valid Email syntax
            setError("Incorrect format, please try username@domain.tld");
            return;    
        }
        else {
            setEmail(tempEmail);
        }

        try {
            const token = await getAccessTokenSilently();
            const response = await axios.post("https://nikoapi.alexa.moe/api/user-profile/email", 
                {email: tempEmail},
                {headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && response.data.data && response.data.user.email) {
                setEmail(response.data.user.email);
                setSuccessMessage("Successfully saved email.");
                setError(null);
            }
            else if (response.data && response.data.data){
                setSuccessMessage("Successfully saved email.");
                //setSuccessMessage(response.data.message);
                setError(null);
            }
            setTempEmail("");
        }
        catch (error) {
            console.error("Error saving email:", error);
            //setError("Failed to save email."); //when saving empty email address
            setSuccessMessage("");
            setTempEmail("");
        }
    }

    // Upload profile photo
    async function handleAvatarUpload(event) {
        handleMenuClose();
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("photo", file);

            try {
                const token = await getAccessTokenSilently();
                const response = await axios.post(
                "https://nikoapi.alexa.moe/api/user-profile/upload_photo",
                formData,
                {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                    },
                }
                );

                if (response.data.status === "Success") {
                setAvatarUrl(response.data.data);
                setSuccessMessage("Profile photo updated successfully!");
                setUploadError(null);
                }
            } catch (error) {
                console.error("Error uploading photo:", error);
                setUploadError("Failed to upload photo. Please try again.");
            }
        }
   }
   
   //Display photo
   const fetchProfilePhoto = async () => {
      try {
        console.log("Fetching profile photo for user:", user?.sub);
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          "https://nikoapi.alexa.moe/api/user-profile/photo",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Profile photo response:", response.data);
        if (response.data.status === "Success" && response.data.data) {
          console.log(
            "Setting profile photo:",
            response.data.data.substring(0, 50) + "..."
          );
          setAvatarUrl(response.data.data);
        } else {
          console.log("No profile photo found in response");
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      }
    };
   
    const handleCloseAlert = () => {
        setError(null);
        setSuccessMessage(null);
        setUploadError(null);
    };

    const handleNameMenu = () => {
        setIsNameMenuOpen(true)
    }
    const handleCloseNameMenu = () => {
        setIsNameMenuOpen(false);
        setTempName("");
        setError(null);
    }
    
    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default}}>
            <NavBar />
            <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}> 
                <Typography variant="h4" gutterBottom>
                   My Profile
                </Typography>
                <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box sx={{ position: 'relative', mb: 2, display: "flex" }}> 
                        <Box sx={{ position: 'relative', mb: 2 }}>     
                            <Avatar
                                alt={user.name || user.email}
                                src={avatarUrl || user?.picture}
                                sx={{ width: 80, height: 80 }}
                                />
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{
                                        mb: 1,
                                        position: "absolute",
                                        bottom: -10,
                                        left: 50,
                                        backgroundColor: "primary.main",
                                        color: "white",
                                        "&:hover": { backgroundColor: "primary.dark" },
                                    }}
                                    >
                                <EditIcon />
                                </IconButton>
                        </Box> 
                        
                        <Box sx={{ mb: 2, display: "flex", paddingLeft: 3}}>
                            <Typography variant="h6" gutterBottom>
                                {user.name}
                                <IconButton
                                    onClick={handleNameMenu}
                                    sx={{
                                        ml: 1.5,
                                        width: 25,
                                        height: 25,
                                        bottom: 6,
                                        backgroundColor: "primary.main",
                                        color: "white",
                                        "&:hover": { backgroundColor: "primary.dark" },
                                    }}
                                    >
                                <EditIcon sx={{width: "15px", height: "15px"}}/>
                                </IconButton>
                                <Typography variant="body2" gutterBottom>
                                    User ID: {user.sub}
                                    {user.email_verified && (
                                        <Typography variant="body2" color="success" gutterBottom>
                                            Email Verified
                                        </Typography>)}
                                </Typography>
                            </Typography>
                        </Box>
                        </Box> 
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            >
                            {/*<MenuItem onClick={handleUseAccountIcon}>
                                Use Account Icon
                            </MenuItem>*/}
                            <MenuItem>
                                <label htmlFor="avatar-upload-input">
                                Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="avatar-upload-input"
                                    onChange={handleAvatarUpload}
                                    style={{ display: "none" }}
                                />
                                </label>
                            </MenuItem>
                            </Menu>
                    </Box>   
                    {successMessage && (
                        <Alert variant="outlined" severity="success" onClose={handleCloseAlert} sx={{ mb: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    {uploadError && (
                        <Alert variant="outlined" severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>
                            {uploadError}
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="outlined" severity="error" onClose={handleCloseAlert} sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                <hr />
                <Box sx={{ position: 'relative', mb: 2 }}>     
                    <Typography variant="h6" color="textPrimary" gutterBottom>
                        Email
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                            Primary: {email} <br></br>
                        </Typography>
                        <IconButton 
                                onClick={handleSetEmail}
                                sx={{ mb: 1,
                                    position: 'relative',
                                    marginTop: -8,
                                    float: 'right',
                                    marginLeft: 80,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'primary.dark' },
                                }}>
                                <EditIcon />
                        </IconButton>
                    </Typography>
                </Box>
                
                <hr />
                <Box >
                    <Typography variant="h6" color="textPrimary" gutterBottom>
                        Phone Number
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                            Primary: {phoneNumber || 'None'} <br></br>
                        </Typography>
                        <IconButton 
                            onClick={handleSetPhoneNumber}
                                    sx={{ mb: 1,
                                        position: 'relative',
                                        float: 'right',
                                        marginLeft: 80,
                                        marginTop: -8,
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'primary.dark' },
                                    }}>
                            <EditIcon />
                        </IconButton>
                    </Typography>
                </Box>
        </Paper>
      </Box>

      <Dialog open={isEmailDialogOpen} onClose={handleCloseEmailDialog}>
        <DialogTitle>Update Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            onChange={handleEmailInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailDialog}>Cancel</Button>
          <Button onClick={handleSaveEmail} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isPhoneNumberDialogOpen} onClose={handleClosePhoneDialog}>
        <DialogTitle>Update Phone Number</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            onChange={handlePhoneInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoneDialog}>Cancel</Button>
          <Button onClick={handleSavePhone} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={isNameMenuOpen} onClose={handleCloseNameMenu}>
        <DialogTitle>Update Full Name</DialogTitle>
        <DialogContent>
            <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Full Name"
            fullWidth
            variant="outlined"
            onChange={handleNameChange}
            value={tempName}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseNameMenu}>Cancel</Button>
            <Button onClick={handleSaveName} color="primary">
            Save
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
