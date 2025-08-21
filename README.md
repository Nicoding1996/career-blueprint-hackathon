# 🚀 Career Blueprint AI

**A personalized career co-pilot that transforms your self-assessment into an actionable job-seeking toolkit, powered by the Z.ai GLM-4.5 API!**

---

### 🎥 Video Demo

https://youtu.be/hRmpZHHCUrY

---

### ✨ Key Features

*   **Interactive Career Assessment:** A guided, multi-step questionnaire to discover a user's unique skills, work style (based on Holland Codes), core values, and career non-negotiables.
*   **Dynamic AI Job Matching:** Generates a list of 10 relevant job titles with real company examples based on the user's profile and their desired **target city**.
*   **The Career Action Hub:** A suite of powerful AI tools to bridge the gap between assessment and application.
    *   **Brand Me for Success:** Automatically generates a professional, ready-to-use LinkedIn "About" summary and 5 impactful resume bullet points.
    *   **Prepare For My Interview:** Creates a list of 5 tailored behavioral interview questions for a user-selected job, complete with personalized tips on how to answer.
*   **Email Results:** Automatically sends a copy of the user's Career Blueprint summary to their email for future reference.

---

### 🛠️ How It Works

1.  The user fills out their name, email, and target city.
2.  They complete a series of intuitive questions about their skills, values, and work preferences.
3.  Upon completion, the app generates a personalized "Career Blueprint" summary.
4.  The app sends this summary to the **Z.ai GLM-4.5 API** to generate relevant job matches in the user's target city.
5.  From the results page, the user can then use the Action Hub to make further API calls to generate branding text and interview prep questions.

---

### 💻 Tech Stack

*   **Frontend:** React.js
*   **Styling:** Tailwind CSS
*   **AI Model:** Z.ai GLM-4.5 API
*   **Email Service:** EmailJS
*   **Markdown Parsing:** Marked.js

---

### 🏃 How to Run Locally

1.  Clone the repository:
    `git clone https://github.com/yourusername/career-blueprint-hackathon.git`
2.  Navigate into the project directory:
    `cd career-blueprint-hackathon`
3.  Install dependencies:
    `npm install`
4.  Create a `.env` file in the root and add your Z.ai API key:
    `REACT_APP_ZAI_API_KEY=your_api_key_here`
5.  Start the application:
    `npm start`