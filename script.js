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

async function formatQuestion(question, apiKey) {
    console.log("Mocking response for testing...");
    
    // Mocked response data
    const mockedResponse = {
        choices: [
            {
                text: `Title: Mocked Title\nQuestion Type: Multiple Choice\n\nQuestion Stem: ${question}\n\nAnswer: Option 1\nCorrect: No\nFeedback: Feedback for option 1\n\nAnswer: Option 2\nCorrect: Yes\nFeedback: Feedback for option 2\n\nGeneral Feedback: General feedback for the question\nCorrect Feedback: Well done!\nIncorrect Feedback: Please review the material.`
            }
        ]
    };

    // Simulate a delay to mimic real API behavior
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockedResponse.choices[0].text.trim();
}

