import { fetchJobSuggestionsFromZai, generateBrandingText } from './zaiService.js';
import React, { useState } from 'react';
import { sendEmail } from './emailService.js';
import { marked } from 'marked';


const questions = [
    {
        title: "Your Accomplishment Story",
        subtitle: "Think about a time you felt proud of something you accomplished. It could be at work, in school, or a personal project. Select the accomplishment, then choose the skills you used.",
        type: 'cardSort',
        key: 'accomplishmentCards',
        limit: 3,
        cards: [
            { id: 'c1', title: "Solved a Complex Problem", icon: "🧩" },
            { id: 'c2', title: "Led a Successful Project", icon: "🏆" },
            { id: 'c3', title: "Helped Someone Succeed", icon: "🤝" },
            { id: 'c4', title: "Built Something New", icon: "💡" },
            { id: 'c5', title: "Learned a Difficult Skill", icon: "🧠" },
            { id: 'c6', title: "Made a Great Decision", icon: "🎯" },
            { id: 'c7', title: "Organized Something Complex", icon: "🗂️" },
            { id: 'c8', title: "Overcame a Major Setback", icon: "💪" }
        ],
        skills: ["Problem-Solving", "Leadership", "Communication", "Creativity", "Technical Skill", "Decision-Making", "Organization", "Resilience", "Teamwork", "Analysis"]
    },
    {
        title: "The Party Game",
        subtitle: "Imagine you're at a party. Which group of people would you be most drawn to for a conversation? Choose your top three, in order.",
        type: 'partyGame',
        key: 'hollandCode',
        steps: [
            { id: 'holland1', question: "<b>1st Choice:</b> I would most likely join the group..." },
            { id: 'holland2', question: "<b>2nd Choice:</b> My next choice would be the group..." },
            { id: 'holland3', question: "<b>3rd Choice:</b> Finally, I'd be interested in the group..." }
        ],
        options: [
            { code: 'R', value: "Realistic", text: "<b>(R)ealistic:</b> ...discussing hands-on activities, building things, or talking about sports and mechanics." },
            { code: 'I', value: "Investigative", text: "<b>(I)nvestigative:</b> ...analyzing a complex idea, debating scientific theories, or solving a puzzle." },
            { code: 'A', value: "Artistic", text: "<b>(A)rtistic:</b> ...talking about creative expression, music, film, or unconventional design." },
            { code: 'S', value: "Social", text: "<b>(S)ocial:</b> ...sharing personal stories, helping each other with problems, or planning a community event." },
            { code: 'E', value: "Enterprising", text: "<b>(E)nterprising:</b> ...pitching business ideas, debating market trends, or persuading others to join a cause." },
            { code: 'C', value: "Conventional", text: "<b>(C)onventional:</b> ...organizing the party details, creating a budget for an event, or discussing efficient systems." }
        ]
    },
    {
        title: "Your Ideal Work Environment",
        subtitle: "How do you do your best work? Select the options that best describe your ideal workplace.",
        type: 'multi-radio',
        questions: [
            { id: 'peopleType', question: "I prefer working with:", options: ["Data and Things.", "People and Ideas."] },
            { id: 'pace', question: "The pace of work is:", options: ["Fast-paced: Full of energy and deadlines.", "Steady: Calm and predictable."] },
            { id: 'structure', question: "The structure is:", options: ["Structured: Clear rules and procedures.", "Flexible: Freedom to experiment and adapt."] },
            { id: 'location', question: "The setting is:", options: ["In an office: A dedicated, professional space.", "Remote or Hybrid: Flexibility in where I work."] }
        ]
    },
    {
        title: "Your Core Values",
        subtitle: "What must your work give you to feel fulfilling? Choose your top 3.",
        type: 'checkbox',
        key: 'coreValues',
        limit: 3,
        options: ["Autonomy", "Creativity", "Financial Security", "Helping Others", "Prestige", "Work-Life Balance", "Intellectual Challenge", "Leadership"]
    },
    {
        title: "Fields of Interest",
        subtitle: "Which of these general fields sparks your curiosity the most? Choose up to 2.",
        type: 'checkbox',
        key: 'fieldsOfInterest',
        limit: 2,
        options: ["Technology", "Healthcare", "Education", "Arts & Entertainment", "Finance & Business", "Skilled Trades", "Government & Public Service", "Science & Research"]
    },
    {
        title: "Your Career Non-Negotiables",
        subtitle: "Finally, let's get practical. These factors help define the kind of role you're looking for right now.",
        type: 'multi-radio',
        questions: [
            { id: 'mission', question: "My personal mission is to:", options: ["...create innovative products or services.", "...help or empower other people.", "...achieve expert-level mastery in a field.", "...build wealth and security."] },
            { id: 'responsibility', question: "I am looking for a role with:", options: ["Individual Contributor: Responsibility for my own work.", "Leadership: Responsibility for a team's results."] },
            { id: 'salary', question: "My target salary is in the:", options: ["$40-60k range.", "$60-80k range.", "$80-120k range.", "$120k+ range."] },
            { id: 'familyProximity', question: "Regarding my work's location:", options: ["...I must stay in my current city.", "...I am open to relocating for the right opportunity."] }
        ]
    }
    // ... (All questions data will be here, same as before)
];

const initialAnswers = {
    accomplishmentCards: [],
    hollandCode: [],
    peopleType: '',
    pace: '',
    structure: '',
    location: '',
    coreValues: [],
    fieldsOfInterest: [],
    mission: '',
    responsibility: '',
    salary: '',
    familyProximity: ''
};

const CareerBlueprint = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [userAnswers, setUserAnswers] = useState(initialAnswers);
    const [userFirstName, setUserFirstName] = useState('');
    const [userFamilyName, setUserFamilyName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [jobLoader, setJobLoader] = useState(false);
    const [userCity, setUserCity] = useState('');
    const [jobList, setJobList] = useState([]);
    const [jobError, setJobError] = useState(false);
    const [emailStatus, setEmailStatus] = useState('');
    const [completionDate, setCompletionDate] = useState('');
    const [brandingText, setBrandingText] = useState('');
    const [isBrandingLoading, setIsBrandingLoading] = useState(false);
    const [resultsHTML, setResultsHTML] = useState('');

    const navigate = (direction) => {
        if (direction === 'back') {
            setCurrentSection(currentSection - 1);
            return;
        }

        if (direction === 'next') {
            // --- Logic for the Welcome Screen ---
            if (currentSection === 0) {
                if (!userFirstName || !userFamilyName || !userEmail || !userEmail.includes('@') || !userCity) {
                    alert('Please fill in all fields: First Name, Family Name, Email, and Target City.');
                    return;
                }
                // No need to set answers here, just move to the first question
                setCurrentSection(currentSection + 1);
                return;
            }

            // --- Logic for all other questions ---
            const { isValid, updatedAnswers } = saveSectionAnswers(currentSection);
            if (!isValid) {
                return; // Stop if validation fails
            }

            // Update the state with the validated and processed answers
            setUserAnswers(updatedAnswers);

            // --- THE CRITICAL TIMING FIX ---
            // Check if we are on the LAST question
            if (currentSection === questions.length) {
                // Call displayResults immediately with the guaranteed up-to-date answers
                displayResults(updatedAnswers);
                // Now, navigate to the results page
                setCurrentSection(currentSection + 1);
            } else {
                // If not the last question, just navigate to the next one
                setCurrentSection(currentSection + 1);
            }
            return;
        }

        // --- Logic for Start Over or other direct navigation ---
        if (direction === 0) {
            setCurrentSection(0);
            setUserAnswers(initialAnswers);
            setUserFirstName('');
            setUserFamilyName('');
            setUserEmail('');
            setResultsHTML(''); // Clear previous results
        } else {
            setCurrentSection(direction);
        }
    };

    const saveSectionAnswers = (sectionIndex) => {
        const sectionData = questions[sectionIndex - 1];
        if (!sectionData) return { isValid: true, updatedAnswers: userAnswers };

        const newAnswers = { ...userAnswers };

        // --- Validation Logic (remains the same) ---
        if (sectionData.type === 'cardSort') {
            const selectedCards = newAnswers.accomplishmentCards || [];
            if (selectedCards.length === 0) {
                alert('Please select at least one Accomplishment Card to continue.');
                return { isValid: false };
            }
            const skillCounts = {};
            selectedCards.forEach(cardTitle => {
                const cardData = sectionData.cards.find(c => c.title === cardTitle);
                const skills = newAnswers[`skills-${cardData.id}`] || [];
                skills.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            });
            const sortedSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);
            newAnswers.top3Skills = sortedSkills.slice(0, 3); // This calculation is now captured
        } else if (sectionData.type === 'partyGame') {
            // ... (keep existing validation logic)
            if ((newAnswers.hollandCode || []).length !== 3) {
                alert('Please complete all three steps of The Party Game.');
                return { isValid: false };
            }
        } else if (sectionData.type === 'checkbox') {
            // ... (keep existing validation logic)
            if ((newAnswers[sectionData.key] || []).length !== sectionData.limit) {
                alert(`Please select exactly ${sectionData.limit} options.`);
                return { isValid: false };
            }
        } else if (sectionData.type === 'multi-radio') {
            for (const q of sectionData.questions) {
                if (!newAnswers[q.id]) {
                    alert(`Please answer the question: "${q.question}"`);
                    return { isValid: false };
                }
            }
        }

        // --- Return the result instead of setting state ---
        return { isValid: true, updatedAnswers: newAnswers };
    };

    const handleAnswer = (key, value, type = 'radio', limit = 0) => {
        setUserAnswers(prev => {
            const newAnswers = { ...prev };
            if (type === 'checkbox' || type === 'cardSort') {
                const currentAnswers = newAnswers[key] || [];
                if (currentAnswers.includes(value)) {
                    newAnswers[key] = currentAnswers.filter(item => item !== value);
                } else {
                    if (limit > 0 && currentAnswers.length >= limit) {
                        alert(`You can only select up to ${limit} options.`);
                        return prev;
                    }
                    newAnswers[key] = [...currentAnswers, value];
                }
            } else {
                newAnswers[key] = value;
            }
            return newAnswers;
        });
    };


    const displayResults = (finalAnswers) => {
        const formatList = (arr) => {
            if (!arr || arr.length === 0) return 'not specified';
            if (arr.length === 1) return arr;
            if (arr.length === 2) return arr.join(' and ');
            return arr.slice(0, -1).join(', ') + ', and ' + arr.slice(-1);
        };

        const skills = formatList(finalAnswers.top3Skills);
        const fields = formatList(finalAnswers.fieldsOfInterest);
        const values = formatList(finalAnswers.coreValues);
        const hollandCode = finalAnswers.hollandCode ? finalAnswers.hollandCode.join('') : 'not specified';
        const hollandDesc = finalAnswers.hollandCode ? formatList(finalAnswers.hollandCode.map(c => questions[1].options.find(o => o.code === c).value)) : 'not specified';

        const summaryText = `My ideal career is in the field of ${fields}, where I can use my top skills in ${skills}. I thrive in a ${hollandCode} (${hollandDesc}) environment, working with ${finalAnswers.peopleType?.toLowerCase().replace(/\./g, '')} people. My ideal workplace is ${finalAnswers.pace?.split(':')[0].toLowerCase()} and ${finalAnswers.structure?.split(':')[0].toLowerCase()}, preferably ${finalAnswers.location?.split(':')[0].toLowerCase()}. It is crucial that my work allows me to fulfill my mission ${finalAnswers.mission} and aligns with my core values of ${values}. I am seeking a ${finalAnswers.responsibility?.split(':')[0]} role with a salary in the ${finalAnswers.salary?.split(' ')[0]} range. Regarding location, ${finalAnswers.familyProximity?.toLowerCase()}`;

        const summaryHTML = `My ideal career is in the field of <strong>${fields}</strong>, where I can use my top skills in <strong>${skills}</strong>. I thrive in a <strong>${hollandCode} (${hollandDesc})</strong> environment, working with <strong>${finalAnswers.peopleType?.toLowerCase().replace(/\./g, '')}</strong> people. My ideal workplace is <strong>${finalAnswers.pace?.split(':')[0].toLowerCase()}</strong> and <strong>${finalAnswers.structure?.split(':')[0].toLowerCase()}</strong>, preferably <strong>${finalAnswers.location?.split(':')[0].toLowerCase()}</strong>. It is crucial that my work allows me to fulfill my mission <strong>${finalAnswers.mission}</strong> and aligns with my core values of <strong>${values}</strong>. I am seeking a <strong>${finalAnswers.responsibility?.split(':')[0]}</strong> role with a salary in the <strong>${finalAnswers.salary?.split(' ')[0]}</strong> range. Regarding location, <strong>${finalAnswers.familyProximity?.toLowerCase()}</strong>`;

        setResultsHTML(summaryHTML.replace(/<strong>/g, '<strong class="font-semibold text-indigo-700">'));
        const date = new Date();
        setCompletionDate(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

        handleFetchJobs(summaryText, userCity);


        // --- ADD THIS LINE AT THE END ---
        sendResultsEmail(finalAnswers);
    };

    const handleBrandingRequest = async () => {
        setIsBrandingLoading(true);
        setBrandingText(''); // Clear any previous text

        // We need the summary text to send to the AI. We can get it from the resultsHTML state.
        // This is a simple way to strip the HTML tags to get the plain text.
        const summaryText = resultsHTML.replace(/<[^>]*>?/gm, '');

        const result = await generateBrandingText(summaryText);

        setBrandingText(result);
        setIsBrandingLoading(false);
    };


    const sendResultsEmail = (finalAnswers) => {
        // Start by showing the "sending" status
        setEmailStatus('sending');

        // Guard clause: Don't send if email is missing
        if (!userEmail) {
            console.error("Email sending failed: No user email provided.");
            setEmailStatus('error');
            return;
        }

        // Create a plain text version of the results for the email body
        const formatList = (arr) => {
            if (!arr || arr.length === 0) return 'not specified';
            if (arr.length === 2) return arr.join(' and ');
            return arr.join(', ');
        };

        const skills = formatList(finalAnswers.top3Skills);
        const fields = formatList(finalAnswers.fieldsOfInterest);
        const values = formatList(finalAnswers.coreValues);
        const hollandCode = finalAnswers.hollandCode ? finalAnswers.hollandCode.join('') : 'not specified';

        const results_as_text = `
Hello ${userFirstName},

Here is your Career Blueprint summary from ${completionDate}:

My ideal career is in the field of ${fields}, where I can use my top skills in ${skills}.

I thrive in a ${hollandCode} environment, working with ${finalAnswers.peopleType?.toLowerCase().replace(/\./g, '')} people. My ideal workplace is ${finalAnswers.pace?.split(':')[0].toLowerCase()} and ${finalAnswers.structure?.split(':')[0].toLowerCase()}, preferably ${finalAnswers.location?.split(':')[0].toLowerCase()}.

It is crucial that my work allows me to fulfill my mission ${finalAnswers.mission} and aligns with my core values of ${values}.

I am seeking a ${finalAnswers.responsibility?.split(':')[0]} role with a salary in the ${finalAnswers.salary?.split(' ')[0]} range. Regarding location, ${finalAnswers.familyProximity?.toLowerCase()}
        `;

        // These parameters must match your EmailJS template
        const templateParams = {
            to_name: `${userFirstName} ${userFamilyName}`,
            to_email: userEmail,
            results_as_text: results_as_text,
        };

        const subject = "Your Career Blueprint Results";

        // Call the email service
        sendEmail(templateParams, subject, setEmailStatus);
    };

    const handleFetchJobs = async (summary, city) => {
        setJobLoader(true);
        setJobError(false);
        setJobList([]);

        try {
            // Now this correctly calls the function from zaiService.js
            const jobs = await fetchJobSuggestionsFromZai(summary, city);

            if (jobs && jobs.length > 0) {
                setJobList(jobs);
            } else {
                setJobError(true);
            }
        } catch (error) {
            setJobError(true);
        } finally {
            setJobLoader(false);
        }
    };

    const renderOptions = (options, type, name, limit = 0) => {
        return (
            <div className="space-y-3">
                {options.map((opt, index) => {
                    const value = typeof opt === 'string' ? opt : opt.value;
                    const text = typeof opt === 'string' ? opt : opt.text;
                    return (
                        <label key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-200 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300">
                            <input
                                type={type}
                                name={name}
                                value={value}
                                className={`h-5 w-5 rounded${type === 'radio' ? '-full' : ''} border-gray-300 text-indigo-600 focus:ring-indigo-500 custom-${type}`}
                                checked={type === 'radio' ? userAnswers[name] === value : (userAnswers[name] || []).includes(value)}
                                onChange={() => handleAnswer(name, value, type, limit)}
                            />
                            <span className="ml-3 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: text }}></span>
                        </label>
                    );
                })}
            </div>
        );
    };

    const renderCardSortSection = (sectionData) => {
        return (
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {sectionData.cards.map(card => (
                        <label key={card.id} className={`accomplishment-card cursor-pointer bg-white p-4 rounded-lg border-2 flex flex-col items-center justify-center text-center h-32 ${userAnswers.accomplishmentCards?.includes(card.title) ? 'selected' : 'border-gray-200'}`}>
                            <input type="checkbox" className="hidden" onChange={() => handleAnswer(sectionData.key, card.title, 'cardSort', sectionData.limit)} checked={userAnswers.accomplishmentCards?.includes(card.title)} />
                            {card.icon}
                            <span className="mt-2 font-medium text-sm text-gray-700">{card.title}</span>
                        </label>
                    ))}
                </div>
                <div className="mt-6 space-y-6">
                    {userAnswers.accomplishmentCards?.map(cardTitle => {
                        const cardData = sectionData.cards.find(c => c.title === cardTitle);
                        return (
                            <div key={cardData.id} className="p-4 border border-gray-200 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-3">For "{cardData.title}", you used these skills:</h3>
                                {renderOptions(sectionData.skills, 'checkbox', `skills-${cardData.id}`)}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPartyGameSection = (sectionData) => {
        return (
            <div>
                {sectionData.steps.map((step, index) => (
                    <div key={step.id} className="mb-8">
                        <h3 className="font-semibold text-gray-800 mb-3" dangerouslySetInnerHTML={{ __html: step.question }}></h3>
                        <div className="space-y-3">
                            {sectionData.options.map(opt => (
                                <label key={opt.code} className={`flex items-center p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-200 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300 ${userAnswers.hollandCode?.includes(opt.code) && userAnswers.hollandCode[index] !== opt.code ? 'opacity-50' : ''}`}>
                                    <input
                                        type="radio"
                                        name={step.id}
                                        value={opt.code}
                                        className="h-5 w-5 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500 custom-radio"
                                        checked={userAnswers.hollandCode?.[index] === opt.code}
                                        disabled={userAnswers.hollandCode?.includes(opt.code) && userAnswers.hollandCode[index] !== opt.code}
                                        onChange={() => {
                                            const newHollandCode = [...(userAnswers.hollandCode || [])];
                                            newHollandCode[index] = opt.code;
                                            handleAnswer(sectionData.key, newHollandCode, 'partyGame');
                                        }}
                                    />
                                    <span className="ml-3 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: opt.text }}></span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSection = () => {
        const sectionData = questions[currentSection - 1];
        if (!sectionData) return null;

        return (
            <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{sectionData.title}</h2>
                <p className="text-gray-600 mb-8">{sectionData.subtitle}</p>

                {sectionData.type === 'cardSort' && renderCardSortSection(sectionData)}
                {sectionData.type === 'partyGame' && renderPartyGameSection(sectionData)}
                {sectionData.type === 'checkbox' && renderOptions(sectionData.options, 'checkbox', sectionData.key, sectionData.limit)}
                {sectionData.type === 'radio' && renderOptions(sectionData.options, 'radio', sectionData.key)}
                {sectionData.type === 'multi-radio' && sectionData.questions.map(q => (
                    <div key={q.id} className="mb-8">
                        <h3 className="font-semibold text-gray-800 mb-3">{q.question}</h3>
                        {renderOptions(q.options, 'radio', q.id)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">

            {/* Progress Bar */}
            {currentSection > 0 && (
                <div id="progressBarContainer" className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <div id="progressBarFill" className="bg-indigo-600 h-2.5 rounded-full progress-bar-fill" style={{ width: `${(currentSection / questions.length) * 100}%` }}></div>
                </div>
            )}

            {/* App Sections */}
            <div id="sections">

                {/* Section 0: Welcome */}
                {currentSection === 0 && (
                    <div id="section-0" className="bg-white p-8 rounded-xl shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Career Blueprint</h1>
                        <p className="text-gray-600 mb-6">Welcome! This isn't a test. It's a guided reflection to help you design a career that aligns with your unique skills, interests, and values. Answer honestly to create a clear profile of what truly motivates you.</p>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                            <div className="flex">
                                <div className="py-1"><svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2v-4H9zm0-4h2v2H9V7z" /></svg></div>
                                <div>
                                    <p className="font-bold">Disclaimer</p>
                                    <p className="text-sm">This questionnaire is a tool for self-discovery and does not guarantee any specific career outcome. Your results are intended to guide your personal research and exploration.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="userFirstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" id="userFirstName" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={userFirstName} onChange={(e) => setUserFirstName(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="userFamilyName" className="block text-sm font-medium text-gray-700">Family Name</label>
                                    <input type="text" id="userFamilyName" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={userFamilyName} onChange={(e) => setUserFamilyName(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" id="userEmail" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="userCity" className="block text-sm font-medium text-gray-700">Target City</label>
                            <input
                                type="text"
                                id="userCity"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={userCity}
                                onChange={(e) => setUserCity(e.target.value)}
                                placeholder='Be specific, e.g., "San Francisco, USA"'
                            />
                        </div>

                        <div className="mt-8 text-right">
                            <button onClick={() => navigate('next')} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">Start</button>
                        </div>
                    </div>
                )}

                {currentSection > 0 && currentSection <= questions.length && renderSection()}

                {/* Results Section */}
                {currentSection > questions.length && (
                    <div id="section-results" className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Career Blueprint</h2>
                        <p className="text-gray-600 mb-6">Based on your answers on <span className="font-semibold">{completionDate}</span>. Use this as your guide for exploring career opportunities.</p>

                        <div className="space-y-6" dangerouslySetInnerHTML={{ __html: resultsHTML }}></div>

                        {/* Job Suggestions Section */}
                        <div id="jobSuggestionsContainer" className="mt-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Example Job Matches in {userCity}</h3>
                            {jobLoader && (
                                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                                    <div className="loader"></div>
                                    <p className="mt-4 text-gray-600">Finding job opportunities that match your profile...</p>
                                </div>
                            )}
                            {jobList.length > 0 && (
                                <ul className="space-y-4">
                                    {jobList.map((job, index) => (
                                        <li key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <h4 className="font-bold text-lg text-indigo-700">{job.title}</h4>
                                            <p className="font-semibold text-gray-800">{job.company}</p>
                                            <p className="text-gray-600 mt-1">{job.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {jobError && (
                                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                                    <p>Sorry, we couldn't fetch job suggestions at this time. Please try again later.</p>
                                </div>
                            )}
                        </div>

                        <div id="actionHubContainer" className="mt-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Career Action Hub</h3>
                            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h4 className="font-bold text-lg text-indigo-700">Brand Me for Success</h4>
                                <p className="text-gray-600 mt-1 mb-4">Generate a professional LinkedIn summary and resume bullet points based on your profile.</p>

                                <button
                                    onClick={handleBrandingRequest}
                                    className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:bg-gray-400"
                                    disabled={isBrandingLoading}
                                >
                                    {isBrandingLoading ? 'Generating...' : 'Generate My Branding Text'}
                                </button>

                                {/* This is where the result will be displayed */}
                                {brandingText && (
                                    <div
                                        className="mt-4 p-4 bg-gray-50 rounded-lg font-sans text-sm text-gray-800 border prose"
                                        dangerouslySetInnerHTML={{ __html: marked(brandingText) }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* --- Automatic Email Status Section --- */}
                        <div className="text-center mt-8 py-4">
                            {emailStatus === 'sending' && <p className="text-gray-600">Sending your results to {userEmail}...</p>}
                            {emailStatus === 'sent' && <p className="text-green-600 font-semibold">✅ Results have been sent to your email!</p>}
                            {emailStatus === 'error' && <p className="text-red-600 font-semibold">❌ There was an error sending your results.</p>}
                        </div>

                        <div className="mt-6 text-center">
                            <button onClick={() => navigate(0)} className="text-indigo-600 hover:text-indigo-800 font-medium transition">Start Over</button>
                        </div>
                    </div>
                )}

            </div>

            {/* Navigation Buttons */}
            {currentSection > 0 && currentSection <= questions.length && (
                <div id="navButtons" className="flex justify-between mt-8">
                    <button id="backButton" onClick={() => navigate('back')} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition">Back</button>
                    <button id="nextButton" onClick={() => navigate('next')} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">Next</button>
                </div>
            )}

        </div>
    );
};

export default CareerBlueprint;