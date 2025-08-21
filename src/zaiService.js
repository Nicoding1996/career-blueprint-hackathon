const ZAI_API_KEY = process.env.REACT_APP_ZAI_API_KEY;
const API_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// ----------------- START: REPLACE THE ENTIRE FUNCTION -----------------

export const fetchJobSuggestionsFromZai = async (summary, city) => {
    console.log("Attempting to fetch jobs with API Key:", ZAI_API_KEY ? "Key Found" : "Key NOT Found!");

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
        console.log("Full API Response from Z.ai:", JSON.stringify(result, null, 2)); // Log the full response for debugging

        // --- NEW ROBUST CHECKING ---
        // Check if choices array exists and is not empty
        if (!result.choices || result.choices.length === 0) {
            console.error("API Error: 'choices' array is missing or empty in the response.");
            throw new Error("Invalid response structure from Z.ai API.");
        }

        const message = result.choices[0].message;

        // Check if the model decided to call a tool
        if (message && message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            if (toolCall.function && toolCall.function.name === "get_job_suggestions") {
                const jobData = JSON.parse(toolCall.function.arguments);
                console.log("Successfully received jobs from Z.ai:", jobData.jobs);
                return jobData.jobs; // Success!
            }
        }
        
        // If we get here, the API responded but didn't use the tool as expected.
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
        return []; // Return an empty array to prevent the app from crashing
    }
};

// ----------------- END: REPLACE THE ENTIRE FUNCTION -----------------