const ZAI_API_KEY = process.env.REACT_APP_ZAI_API_KEY;
const API_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export const fetchJobSuggestionsFromZai = async (summary, city) => {
    

    const prompt = `Based on this career profile: "${summary}", and the target location "${city}", generate a list of 10 diverse and specific job titles. For each job, provide the title, a real company that hires for that role in the target location, and a 1-2 sentence description. Return the response as a valid JSON object with a single key "jobs" which is an array of objects. Each object in the array should have three keys: "title", "company", and "description".`;

    const payload = {
        model: "glm-4.5",
        messages: [{ role: "user", content: prompt }],
        tool_choice: "auto",
        tools: [{
            type: "function",
            function: {
                name: "get_job_suggestions",
                description: "Get a list of job suggestions based on a user profile.",
                parameters: {
                    type: "object",
                    properties: {
                        jobs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    company: { type: "string" },
                                    description: { type: "string" }
                                },
                                required: ["title", "company", "description"]
                            }
                        }
                    },
                    required: ["jobs"]
                }
            }
        }]
    };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ZAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("--- Z.AI SERVER ERROR ---");
            console.error("Status Code:", response.status);
            console.error("Status Text:", response.statusText);
            console.error("Error Body:", errorBody);
            console.error("-------------------------");
            throw new Error(`API Error: ${response.statusText}`);
        }

        const result = await response.json();
        

        if (!result.choices || result.choices.length === 0) {
            console.error("API Error: 'choices' array is missing or empty in the response.");
            throw new Error("Invalid response structure from Z.ai API.");
        }

        const message = result.choices[0].message;

        if (message && message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            if (toolCall.function && toolCall.function.name === "get_job_suggestions") {
                const jobData = JSON.parse(toolCall.function.arguments);
                
                return jobData.jobs;
            }
        }
        
        console.error("API did not return the expected 'get_job_suggestions' tool call.");
        if (message && message.content) {
            console.error("API returned a text message instead:", message.content);
        }
        throw new Error("Unexpected response from Z.ai API.");

    } catch (error) {
        console.error("--- CATCH BLOCK ERROR ---");
        console.error("This error was caught by the try...catch block. It could be a network issue or an error from the checks above.");
        console.error(error);
        console.error("-----------------------");
        return [];
    }
};

export const generateBrandingText = async (summary) => {
    

    const prompt = `Based on this career profile: "${summary}", do two things: 1. Write a compelling, professional 'About' section for a LinkedIn profile, in the first person. 2. Generate 5 resume-friendly bullet points that highlight the user's key strengths and career desires, starting each with an action verb. Format the response as a single block of text with clear headings for "LinkedIn Summary" and "Resume Bullet Points". Use markdown for the headings (e.g., "### LinkedIn Summary").`;

    const payload = {
        model: "glm-4.5",
        messages: [{ role: "user", content: prompt }]
    };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ZAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Branding Text API Error:", errorBody);
            throw new Error(`API Error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
            
            return result.choices[0].message.content;
        } else {
            console.error("Unexpected API response structure for branding text:", result);
            throw new Error("Invalid response structure for branding text.");
        }

    } catch (error) {
        console.error("Error in generateBrandingText:", error);
        return "Sorry, we couldn't generate your branding text at this time. Please try again later.";
    }
};

export const generateInterviewPrep = async (summary, jobTitle) => {
    const prompt = `A candidate with this career profile: "${summary}" is interviewing for a "${jobTitle}" position. Generate 5 likely behavioral interview questions. For each question, provide a short tip on how the candidate can leverage their personal profile in their answer. Format the response as a single block of text using markdown for headings and bullet points.`;
    const payload = { model: "glm-4.5", messages: [{ role: "user", content: prompt }] };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ZAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Interview Prep API Error:", errorBody);
            throw new Error(`API Error: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
            
            return result.choices[0].message.content;
        } else {
            console.error("Unexpected API response structure for interview prep:", result);
            throw new Error("Invalid response structure for interview prep.");
        }

    } catch (error) {
        console.error("Error in generateInterviewPrep:", error);
        return "Sorry, we couldn't generate your interview prep text at this time. Please try again later.";
    }
};