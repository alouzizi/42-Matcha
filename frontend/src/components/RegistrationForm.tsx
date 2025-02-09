import { useState } from "react";
import Button from "@mui/material/Button";
import FacebookIcon from "@mui/icons-material/Facebook";
// https://mui.com/material-ui/material-icons/?srsltid=AfmBOopJikFhdTyZ7jeW_GHSILmUTDSBVafswowgwSgwNmSJRP6PpTKQ&query=google&selected=Google
import GoogleIcon from "@mui/icons-material/Google";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    age:18
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log(
          "Registration successful! Please check your email for verification."
        );
        setSuccess(
          "Registration successful! Please check your email for verification."
        );
        setFormData({
          email: "",
          username: "",
          first_name: "",
          last_name: "",
          password: "",
          age:0
        });
      } else {
        console.log(data, " error");

        setError(data || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Create Your Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                minLength={7}
                maxLength={30}
            
                placeholder="Email Address"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                value={formData.email}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    setFormData({ ...formData, email: e.target.value });
                  }
                }}
                required
              />

              {/* <input
                type="text"
                placeholder="Username"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                
                value={formData.username}

                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              /> */}
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                minLength={6}
                maxLength={20}
                value={formData.username}
                onChange={(e) => {
                  if (e.target.value.length <= 20) {
                    setFormData({ ...formData, username: e.target.value });
                  }
                }}
                required
              />
              <input
                type="number"
                placeholder="age"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                min={18}
                max={100}
                value={formData.age}
                onChange={(e) => {
                  const age = parseInt(e.target.value, 10);
                  if (!isNaN(age) && age >= 18 && age <= 100) {
                    setFormData({ ...formData, age });
                  }
                }}
                required
              />

              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  minLength={3}
                  maxLength={30}
                  value={formData.first_name}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      setFormData({ ...formData, first_name: e.target.value });
                    }
                  }}
                  required
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  minLength={3}
                  maxLength={30}
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.last_name}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      setFormData({ ...formData, last_name: e.target.value });
                    }
                  }}
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Password"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  minLength={8}
                  maxLength={50}
                  value={formData.password}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setFormData({ ...formData, password: e.target.value });
                    }
                  }}
                  required
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              {success && (
                <div className="text-green-500 text-sm">{success}</div>
              )}

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            {/* <div className="flex items-center justify-center">
              <GoogleButton
                label="Sign up"
                onClick={() => {
                  //new link
                  window.location.href =
                    "http://localhost:3000/api/auth/google";
                }}
              />
            </div> */}
            <div className="flex items-center justify-center grid-cols-2 gap-4 ">
              <Button
                variant="contained"
                onClick={() => {
                  //new link
                  window.location.href =
                    "http://localhost:3000/api/auth/facebook";
                }}
                startIcon={<FacebookIcon />}
              >
                Facebook
              </Button>

              <Button
                onClick={() => {
                  //new link
                  window.location.href =
                    "http://localhost:3000/api/auth/google";
                }}
                variant="contained"
                startIcon={<GoogleIcon />}
              >
                Google
              </Button>

              <Button
                onClick={() => {
                  //new link
                  window.location.href =
                    "http://localhost:3000/api/auth/intra42";
                }}
                variant="contained"
                startIcon={<img src="42-Final-sigle-seul.svg" width={25}></img>}
              >
                Intra
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
