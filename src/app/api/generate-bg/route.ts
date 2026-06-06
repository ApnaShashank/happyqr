import { NextResponse } from "next/server";

const API_KEYS = [
  process.env.HF_API_KEY_1 || "",
  process.env.HF_API_KEY_2 || "",
  process.env.HF_API_KEY_3 || "",
  process.env.HF_API_KEY_4 || "",
  process.env.HF_API_KEY_5 || "",
].filter(Boolean);

let keyIndex = 0;

function getNextKey() {
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return key;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const maxRetries = 3;
    let lastError = "";

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const apiKey = getNextKey();
      try {
        const response = await fetch(
          "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                width: 1024,
                height: 1024,
              },
            }),
          }
        );

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          return NextResponse.json({ image: `data:image/jpeg;base64,${base64}` });
        }

        const errText = await response.text();
        console.error(`Attempt ${attempt + 1} failed with status ${response.status}:`, errText);
        lastError = `Status ${response.status}: ${errText}`;
      } catch (err: any) {
        console.error(`Attempt ${attempt + 1} request error:`, err);
        lastError = err.message || "Request failed";
      }
    }

    return NextResponse.json(
      { error: `Failed to generate image after retries. Last error: ${lastError}` },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("API handler error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
