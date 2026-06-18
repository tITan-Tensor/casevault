"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Upload() {
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState(""); 
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const router = useRouter();

  // --- THE FRONTEND BOUNCER ---
  // The moment this page loads, check if they have a VIP badge.
  // If they don't, instantly kick them back to the login screen.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleUpload = async (e) => {
    e.preventDefault(); 
    setError("");
    setIsUploading(true);

    // 1. Grab the VIP badge from the browser's digital wallet
    const token = localStorage.getItem("token");

    // 2. Convert comma-separated tags (e.g., "Finance, Strategy") into a clean array
    const tagsArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "");

    try {
      // 3. Send the data to the Express Backend
      const response = await fetch("https://casevault-8n9f.onrender.com/api/slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token // WE HAND THE BOUNCER OUR BADGE HERE!
        },
        body: JSON.stringify({
          title,
          description,
          tags: tagsArray,
          previewUrl,
          fileUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Upload failed. Your session may have expired.");
        setIsUploading(false);
        return;
      }

      // 4. Success! Redirect the user back to the Gallery to see their new upload.
      router.push("/");

    } catch (err) {
      setError("Server error. Is the backend running?");
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Presentation</h1>
          <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
            &larr; Cancel
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presentation Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Q3 Financial Review"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows="3"
              placeholder="A brief overview of the slides..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g., Finance, 2024, Quarterly"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input
                type="url"
                required
                placeholder="https://..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slide File URL (PDF/PPT)</label>
              <input
                type="url"
                required
                placeholder="https://..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full text-white font-bold py-4 px-4 rounded-lg transition-colors mt-4 ${
              isUploading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Uploading to CaseVault..." : "Publish Presentation"}
          </button>
        </form>
      </div>
    </main>
  );
}