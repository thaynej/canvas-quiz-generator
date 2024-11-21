// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
    return "";
}

// Save API Key to cookies
document.getElementById("saveApiKey").addEventListener("click", () => {
    const apiKey = document.getElementById("apiKey").value;
    if (apiKey) {
        setCookie("anthropicApiKey", apiKey, 7);
        document.getElementById("status").textContent = "API Key saved!";
    } else {
        document.getElementById("status").textContent = "Please enter an API Key.";
    }
});

// Process file upload
document.getElementById("processFile").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        document.getElementById("fileStatus").textContent = "No file selected.";
        return;
    }

    const apiKey = getCookie("anthropicApiKey");
    if (!apiKey) {
        document.getElementById("fileStatus").textContent = "No API Key found. Please save your API Key first.";
        return;
    }

    const file = fileInput.files[0];
    const fileText = await file.text();
    const questions = fileText.split('---').map(q => q.trim());

    const formattedQuestions = [];
    for (const question of questions) {
        const formattedQuestion = await formatQuestion(question, apiKey);
        if (formattedQuestion) {
            formattedQuestions.push(formattedQuestion);
        }
    }

    if (formattedQuestions.length > 0) {
        const blob = new Blob([formattedQuestions.join('\n\n---\n\n')], { type: 'text/plain' });
        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = "formatted_questions.txt";
        downloadLink.style.display = "inline";
        downloadLink.textContent = "Download Formatted Questions";
        document.getElementById("fileStatus").textContent = "Processing complete!";
    } else {
        document.getElementById("fileStatus").textContent = "No questions were successfully formatted.";
    }
});

const mockedResponse = {
    choices: [
        {
            text: "Formatted question example here."
        }
    ]
};


// Function to call the API and format a question
async function formatQuestion(question, apiKey) {
    const formattedInstructions = `Your sole responsibility is to convert questions into a standardized format. ... [trimmed for brevity] ... {question}`;
    try {
        console.log("Sending request with question:", question);
        const response = await fetch("https://api.anthropic.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "claude-3",
                prompt: formattedInstructions.replace("{question}", question),
                max_tokens: 1000,
                temperature: 0
            })
        });
        console.log("API Response Status:", response.status);

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error("Error details:", errorDetails);
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response Data:", data);

        return data.choices && data.choices[0] && data.choices[0].text
            ? data.choices[0].text.trim()
            : null;
    } catch (error) {
        console.error("Error formatting question:", error);
        return null;
    }
}
