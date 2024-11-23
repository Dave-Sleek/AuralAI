// Check if the browser supports the Web Speech API
if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    alert("Your browser does not support speech recognition. Please try this in Chrome or Edge.");
  } else {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
  
    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = false;
  
    // DOM Elements
    const micContainer = document.getElementById("mic-container");
    const outputDiv = document.getElementById("output");
    const languageSelect = document.getElementById("language-select");
  
    // Pidgin dictionary for post-processing
    const pidginDictionary = {
      "how are you": "how you dey",
      "i am fine": "i dey fine",
      "what is your name": "wetin be your name",
      "thank you": "tanko",
      "good morning": "morning o",
      "good evening": "evening o",
      "where are you going": "where you dey go",
    };
  
    // App-opening commands and corresponding URLs
    const appOpenDictionary = {
      "open whatsapp": "whatsapp://",
      "open twitter": "twitter://",
      "open facebook": "fb://",
      "open youtube": "youtube://",
      "open instagram": "instagram://",
      "open google maps": "comgooglemaps://",
    };
  
    // Function to convert English text to Pidgin
    function convertToPidgin(text) {
      const lowerText = text.toLowerCase();
      return pidginDictionary[lowerText] || text; // Default to original if no match
    }
  
    // Function to speak the text
    function speakText(text) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = recognition.lang; // Match the recognition language
      speech.pitch = 1;
      speech.rate = 1;
      window.speechSynthesis.speak(speech);
    }
  
    // Function to open an app using a URL scheme or deep link
    function openApp(url) {
      window.location.href = url; // Redirects to the app's URL
    }
  
    // Function to perform a web search
    async function performSearch(query) {
      const apiKey = "AIzaSyDiyz17F2K3MP3C8Vpub5tarorSziPiAP4"; // Replace with your API key
      const searchEngineId = "85f1d797e0c8840de"; // Replace with your search engine ID
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;
      
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
  
        if (data.items && data.items.length > 0) {
          const firstResult = data.items[0]; // Get the first search result
          const title = firstResult.title;
          const snippet = firstResult.snippet;
          const link = firstResult.link;
  
          // Display the result
          outputDiv.innerHTML = `
            <p><strong>${title}</strong></p>
            <p>${snippet}</p>
            <p><a href="${link}" target="_blank">Read more</a></p>
          `;
          speakText(`Here is what I found: ${snippet}`);
        } else {
          outputDiv.textContent = "No results found.";
          speakText("Sorry, I couldn't find anything.");
        }
      } catch (error) {
        outputDiv.textContent = "An error occurred while searching.";
        speakText("There was an error while searching. Please try again.");
      }
    }
  
    // Set initial language
    recognition.lang = languageSelect.value;
  
    // Update language based on dropdown selection
    languageSelect.addEventListener("change", (event) => {
      const selectedLang = event.target.value;
  
      if (selectedLang === "pidgin") {
        recognition.lang = "en-US"; // Use English as base for Pidgin
        outputDiv.textContent = "Pidgin language selected. Note: Accuracy may vary.";
      } else {
        recognition.lang = selectedLang;
      }
    });
  
    // Add event listener to the microphone container
    micContainer.addEventListener("click", () => {
      recognition.start();
      micContainer.classList.add("pulsing"); // Start pulsing animation
      outputDiv.textContent = "Listening...";
    });
  
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
  
      let outputText;
      if (languageSelect.value === "pidgin") {
        // Post-process text for Pidgin
        outputText = convertToPidgin(transcript);
        outputDiv.textContent = `You said (Pidgin): "${outputText}"`;
      } else {
        // Display normal results for other languages
        outputText = transcript;
        outputDiv.textContent = `You said: "${outputText}"`;
      }
  
      // Check if the phrase matches an app command
      if (appOpenDictionary[transcript]) {
        const appUrl = appOpenDictionary[transcript];
        outputDiv.textContent += `\nOpening App: "${transcript}"`;
        speakText(` ${transcript}`);
        openApp(appUrl); // Trigger the app
      } else if (transcript.startsWith("search for")) {
        const query = transcript.replace("search for", "").trim();
        performSearch(query);
      } else if (transcript.startsWith("what is")) {
        const query = transcript.replace("what is", "").trim();
        performSearch(query);
      } else if (transcript.startsWith("where is")) {
        const query = transcript.replace("where is", "").trim();
        performSearch(query);
      } else {
        speakText("I didn't understand. Please say 'Search for' or 'What is' followed by your query.");
      }
    };
  
    recognition.onerror = (event) => {
      outputDiv.textContent = `Error: ${event.error}`;
    };
  
    recognition.onend = () => {
      outputDiv.textContent += "\nRecognition stopped.";
      micContainer.classList.remove("pulsing"); // Stop pulsing animation
    };
  }
  
