import { Box, Button } from "@mui/material";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

// You can use this file to test resume download
const Temp = () => {
    const { getAccessTokenSilently } = useAuth0();
    const handleClick = async () => {
        const token = await getAccessTokenSilently();
        const resumes = await axios.get("https://nikoapi.alexa.moe/api/resumes/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // Call format and download afterwards
        await axios.post("https://nikoapi.alexa.moe/api/format", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            resumeId: resumes.data.data[0]._id, 
            formatType: "markdown   ", 
            templateId: "basic"
        });

        var response;
        try {
            response = await axios.get(`https://nikoapi.alexa.moe/api/resumes/download/${resumes.data.data[0]._id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
        } catch (error) {
            console.log("Error", error);
            // Call format and download afterwards
            await axios.post("https://nikoapi.alexa.moe/api/format", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                resumeId: resumes.data.data[0]._id, 
                formatType: "", 
                templateId: "basic"
            });
            response = await axios.get(`https://nikoapi.alexa.moe/api/resumes/download/${resumes.data.data[0]._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
  // Create an URL for link tag
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');

  // Add resume details to link tag
  link.href = url;
  link.type = response.headers.get('content-type');
  // Gets filename from content-disposition
  link.download = response.headers.get('content-disposition').match(/filename="?([^"]+)"?/)[1];
  document.body.appendChild(link);

  // Download file
  link.click();

  // Garbage cleanup
  link.remove();
  window.URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Button
            onClick={handleClick}>
                Press me!
            </Button>
        </Box>
    );
}

export default Temp;