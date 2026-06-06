import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: "ImageKit private key not configured" }, { status: 500 });
    }

    // Convert file to array buffer and base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = buffer.toString("base64");

    // Prepare body for ImageKit API
    const uploadBody = new FormData();
    uploadBody.append("file", base64File);
    uploadBody.append("fileName", file.name);
    uploadBody.append("useUniqueFileName", "true");

    const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");

    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: uploadBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ImageKit upload failure:", errorText);
      return NextResponse.json(
        { error: `ImageKit upload failed: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
