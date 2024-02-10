import { useState } from "react";
import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_SOME_KEY;
console.log(import.meta.env.VITE_SOME_KEY);

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showAllMessages, setShowAllMessages] = useState(false);

  async function generateImages() {
    setIsLoading(true);

    try {
      const requestData = {
        prompt: prompt,
        n: 1,
        size: "256x256",
      };

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      };

      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        requestData,
        {
          headers: headers,
        }
      );

      setGeneratedImages(response.data.data);
    } catch (error) {
      console.error("Error generating images:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendMessage = async () => {
    console.log("submit");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages: [
          { role: "system", content: "Tell me some product ideas for " },
          { role: "user", content: `Tell me some product ideas for ${prompt}` },
        ],
        model: "gpt-3.5-turbo",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    console.log(response.data.choices[0].message);
  
    var productsResponse= response.data.choices[0].message.content;
    var listProductResponse = productsResponse.split("\n");

    const newMessages = listProductResponse
    .filter(product => product.trim() !== "") // Remove empty strings
    .map(product => {
      const splitProduct = product.split(":");
      if (splitProduct.length >= 2) { // Check if split result has at least two parts
        const title = splitProduct[0].trim().split(" ")[1];
        const body = splitProduct.slice(1).join(":").trim(); // Join remaining parts as body
        return {
          role: "assistant",
          content: product,
          title,
          body
        };
      } else {
        return null; // Invalid format, return null
      }
    })
    .filter(Boolean); // Remove null entries
  
    setMessages([...messages, ...newMessages]);
    setPrompt("");
  };
  const handleSeeMore = () => {
    setShowAllMessages(true);
  }
  return (
    <div className="text-white bg-black min-h-screen">
      <div className="flex flex-row  items-center justify-center max-w-full ">
        <div className=" mt-4 bg-white max-w-[50%] w-full flex item-center max-sm:flex-col gap-5 p-2 sm:border rounded-full sm:border-slate-gray ">
          <input
            type="text"
            id="prompt"
            value={prompt}
            placeholder="Enter a prompt"
            onChange={(e) => setPrompt(e.target.value)}
            className=" w-full outline-none leading-10   px-2 rounded-lg  text-black input "
            onKeyDown={(event) => {
              if (event.key === "Enter" && prompt.length > 0) {
                generateImages();
                handleSendMessage();
              }
            }}
          />
        </div>

        <div>
          {isLoading ? (
            "Generating..."
          ) : generatedImages.length > 0 ? (
            <img
              src={generatedImages[0].url}
              alt="Generated"
              className="w-1/4 h-1/4 mt-4 rounded-lg"
            />
          ) : null}
        </div>
      </div>
     
        <div className="flex flex-col justify-center  mx-6 max-w-4xl">
          {messages.slice(0,showAllMessages?messages.length:3).map((message, index) => (
            <div key={index} className=" border rounded-lg p-3 mt-2">
              <h3 className="text-2xl font-bold">{message.title}</h3>
              <br></br>
              {message.body}
            </div>
          ))}
            {!showAllMessages && messages.length > 3 && (
          <button onClick={handleSeeMore} className="text-white bg-blue-500 px-4 py-2 mt-2 rounded-md hover:bg-blue-600">
            See More
          </button>
        )}
        </div>
     
    </div>
  );
}

export default App;
