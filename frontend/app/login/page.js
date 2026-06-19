"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import Link from "next/link";

export default function Login() {
  // --- NEW: The Toggle Switch ---
  const [isLogin, setIsLogin] = useState(true); 
  
  // The Data Notepad
  const [name, setName] = useState(""); // Only used when registering
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError("");

    try {
      // 1. Check the toggle switch to decide which backend door to use
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      
      // 2. Package the data (Include 'name' only if we are registering)
      const payload = isLogin ? { email, password } : { name, email, password };

      // 3. Send the request to the Kitchen
      const response = await fetch(`https://casevault-6n9f.onrender.com${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (isLogin ? "Login failed" : "Registration failed"));
        return;
      }

      // 4. SUCCESS! Save the VIP badge and email, then redirect to Gallery
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email); 
      router.push("/"); 

    } catch (err) {
      setError("Server error. Is the backend running?");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        
        {/* Dynamic Title based on the toggle switch */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          {isLogin ? "Admin Login" : "Create Account"}
        </h1>
        <p className="text-gray-500 text-center mb-8">
          {isLogin ? "Access the CaseVault Database" : "Join the CaseVault Platform"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* --- NEW: The Name Field (ONLY shows if isLogin is false) --- */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required={!isLogin} // Only required if registering
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength="6"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* --- NEW: The Toggle Button at the bottom --- */}
        <div className="mt-6 border-t border-gray-100 pt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin); // Flip the switch!
              setError(""); // Clear any old errors
            }}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            {isLogin ? "Register as a new Admin" : "Sign in to existing account"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            &larr; Back to Gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
