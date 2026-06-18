"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [slides, setSlides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // --- NEW: The Edit Modal Trackers ---
  const [editingSlide, setEditingSlide] = useState(null); // Tracks WHICH slide is open in the popup
  const [editForm, setEditForm] = useState({ title: "", description: "", tags: "" }); // Tracks what you type

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    
    if (token) {
      setIsLoggedIn(true);
      if (email) setUserEmail(email);
    }

    const fetchSlides = async () => {
      try {
        let url = `https://casevault-8n9f.onrender.com/api/slides?`;
        if (searchTerm) url += `search=${searchTerm}&`;
        if (selectedTag) url += `tag=${selectedTag}`;

        const response = await fetch(url);
        const data = await response.json();
        setSlides(data.slides);
      } catch (error) {
        console.log("Failed to fetch slides", error);
      }
    };

    const delayTimer = setTimeout(() => {
      fetchSlides();
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [searchTerm, selectedTag]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setUserEmail(""); 
    alert("You have been logged out.");
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Security Bouncer: You need an Admin Login to do this!");
    
    if (!window.confirm("Are you sure you want to delete this presentation?")) return;

    try {
      const response = await fetch(`https://casevault-8n9f.onrender.com/api/slides/${id}`, {
        method: 'DELETE',
        headers: { 'auth-token': token }
      });

      if (response.ok) {
        setSlides(slides.filter((slide) => slide._id !== id));
      } else {
        alert("Failed to delete. Check your token.");
      }
    } catch (error) {
      console.log("Delete error", error);
    }
  };

  // --- NEW: Open the Modal and fill it with the old data ---
  const handleOpenEdit = (slide) => {
    setEditingSlide(slide._id);
    setEditForm({
      title: slide.title,
      description: slide.description,
      // Convert the array ["Strategy", "Tech"] into a string "Strategy, Tech"
      tags: slide.tags.join(", ") 
    });
  };

  // --- NEW: Save the updated data from the Modal ---
  const handleSaveEdit = async (e) => {
    e.preventDefault(); // Stop page refresh
    const token = localStorage.getItem("token");
    if (!token) return alert("Session expired. Please log in again.");

    try {
      // Convert the string "Strategy, Tech" back into an array ["Strategy", "Tech"]
      const tagsArray = editForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "");

      const response = await fetch(`https://casevault-8n9f.onrender.com/api/slides/${editingSlide}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'auth-token': token 
        },
        body: JSON.stringify({ 
          title: editForm.title, 
          description: editForm.description, 
          tags: tagsArray 
        }) 
      });

      if (response.ok) {
        const updatedSlide = await response.json();
        // Update the Waiter's notepad so the new info shows up instantly
        setSlides(slides.map((slide) => 
          slide._id === editingSlide ? updatedSlide : slide
        ));
        // Close the modal
        setEditingSlide(null);
      } else {
        alert("Failed to update. Check your token.");
      }
    } catch (error) {
      console.log("Edit error", error);
    }
  };

  const categories = ["", "Strategy", "Finance", "Marketing", "Technology", "Harvard Business School"];

  return (
    <main className="min-h-screen bg-gray-50 p-10 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* --- THE HEADER BAR --- */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">CaseVault Gallery</h1>
          <div>
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">
                  Welcome, <span className="text-gray-900">{userEmail}</span>
                </span>
                <a href="/upload" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                  + Upload Slide
                </a>
                <button 
                  onClick={handleLogout} 
                  className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                Admin Login &rarr;
              </a>
            )}
          </div>
        </div>

        {/* --- THE SEARCH BAR --- */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search presentations..."
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {tag === "" ? "All" : tag}
              </button>
            ))}
          </div>
        </div>

        {/* --- THE GALLERY GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {slides.length === 0 ? (
            <p className="text-gray-500 text-lg">No presentations found matching your criteria.</p>
          ) : (
            slides.map((slide) => (
              <div key={slide._id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                <img 
                  src={slide.previewUrl} 
                  alt={slide.title} 
                  className="w-full h-48 object-cover bg-gray-100"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=No+Cover+Image"; }}
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{slide.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{slide.description}</p>
                  
                  <div className="flex gap-2 flex-wrap mb-6">
                    {slide.tags.map(tag => (
                      <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <a href={slide.fileUrl} target="_blank" rel="noopener noreferrer" className="text-center w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold py-2 rounded-lg transition-colors">
                      View Presentation
                    </a>
                    
                    {isLoggedIn && (
                      <div className="flex gap-2">
                        {/* CHANGED THIS BUTTON TO OPEN THE MODAL INSTEAD OF THE PROMPT */}
                        <button 
                          onClick={() => handleOpenEdit(slide)}
                          className="flex-1 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 font-semibold py-2 rounded-lg transition-colors"
                        >
                          Edit Details
                        </button>
                        <button 
                          onClick={() => handleDelete(slide._id)}
                          className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold py-2 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* --- NEW: THE EDIT MODAL OVERLAY --- */}
      {/* If editingSlide has an ID in it, we draw this giant dark overlay over the whole screen */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Presentation</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma Separated)</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                  placeholder="e.g. Strategy, Tech, Finance"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setEditingSlide(null)} // Click cancel to clear the notepad and hide the modal
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </main>
  );
}
