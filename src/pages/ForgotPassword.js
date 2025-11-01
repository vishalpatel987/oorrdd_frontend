import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authAPI from "../api/authAPI";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // email -> otp -> reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPasswordOTP(email.trim().toLowerCase());
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyPasswordOTP({ email: email.trim().toLowerCase(), otp: (otp || '').trim() });
      toast.success("OTP verified");
      setStep("reset");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPasswordWithOTP({ email: email.trim().toLowerCase(), password, confirmPassword });
      toast.success("Password changed successfully");
      // Redirect to login after successful password update
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

        {step === "email" && (
          <form onSubmit={handleSendOTP}>
            <label className="block mb-2 text-sm font-medium text-gray-700">Enter your registered email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="you@example.com"
            />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <label className="block mb-2 text-sm font-medium text-gray-700">Enter the OTP sent to {email}</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="6-digit OTP"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleSendOTP} disabled={loading} className="w-1/2 bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200">
                Resend OTP
              </button>
              <button type="submit" disabled={loading} className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset}>
            <label className="block mb-2 text-sm font-medium text-gray-700">Create a new password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded p-2 mb-3"
              placeholder="New password"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Confirm password"
            />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {loading ? "Saving..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
