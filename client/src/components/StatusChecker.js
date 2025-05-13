import React from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Stack, CircularProgress, Typography, Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { green } from "@mui/material/colors";


const StatusChecker = ({ resumeId: propResumeId }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [failure, setFailure] = React.useState(false);
  const [ErrorMessage, setErrorMessage] = React.useState("");
  const [isActive, setIsActive] = React.useState(false);

  // Reset states when resumeId changes
  React.useEffect(() => {
    if (propResumeId) {
      setLoading(true);
      setSuccess(false);
      setFailure(false);
      setErrorMessage("");
      setIsActive(true);
      localStorage.setItem("resumeId", propResumeId);
      localStorage.setItem("status", "Processing");
    }
  }, [propResumeId]);

  // Periodically check for status if processing
  React.useEffect(() => {
    let timer;
    if (loading && isActive) {
      updateStatus();
      timer = setInterval(() => {
        updateStatus();
      }, 2000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [loading, isActive]);

  async function updateStatus() {
    let currentResumeId = localStorage.getItem("resumeId");
    if (!currentResumeId) {
      setFailure(true);
      setLoading(false);
      setErrorMessage("No resume ID found");
      setIsActive(false);
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        `https://nikoapi.alexa.moe/api/resumes/status/${currentResumeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },    
        }
      );

      const data = response.data;
      localStorage.setItem("status", data.status);

      if (data.status === "COMPLETED") {
        setSuccess(true);
        setLoading(false);
        setIsActive(false); // Stop checking once completed
      } else if (data.status === "FAILED") {
        setFailure(true);
        setLoading(false);
        setIsActive(false); // Stop checking on failure
        setErrorMessage(data.message || "Generation failed");
      }
    } catch (error) {
      console.error("Status check error:", error);
      setLoading(false);
      setFailure(true);
      setErrorMessage(error.response?.data?.message || error.message);
      setIsActive(false);
    }
  }

  if (!isActive && !loading && !success && !failure) {
    return null;
  }

  return (
    <Stack
      sx={{
        maxWidth: "fit-content",
        marginLeft: "auto",
        marginRight: "auto",
        alignItems: "center",
        mt: 2,
      }}
      spacing={2}
    >
      {loading && <CircularProgress color="secondary" />}
      {success && (
        <CheckIcon
          sx={{
            color: green[500],
          }}
        />
      )}
      {failure && <Alert severity="error">{ErrorMessage}</Alert>}
      {loading && <Typography>Processing...</Typography>}
      {success && <Typography>Completed!</Typography>}
    </Stack>
  );
};

export default StatusChecker;
