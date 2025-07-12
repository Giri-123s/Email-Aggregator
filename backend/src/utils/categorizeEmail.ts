import axios from "axios";

export const categorizeEmail = async (subject: string, body: string): Promise<string> => {
  try {
    const response = await axios.post("http://127.0.0.1:5001/predict", {
      subject,
      body
    });

    return response.data.label;
  } catch (error) {
    console.error("Error categorizing email:", error);
    return "Unknown";
  }
};
