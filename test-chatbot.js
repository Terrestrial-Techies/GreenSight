async function testChatbot() {
    try {
        const payload = {
            message: "Tell me more about Harrow Park",
            history: [
                { role: "user", content: "Hi, I'm looking for a park in Lagos." },
                { role: "assistant", content: "Hi! I can suggest several parks in Lagos, such as Harrow Park or Millennium Park. Which one would you like to know more about?" }
            ]
        };

        console.log("Sending request to chatbot...");
        const response = await fetch('http://localhost:5000/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response from chatbot:");
        console.log(data.reply);
    } catch (err) {
        console.error("Error testing chatbot:", err.message);
    }
}

testChatbot();
