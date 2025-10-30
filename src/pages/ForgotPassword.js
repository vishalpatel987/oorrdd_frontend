import React, { useState } from "react";
import axios from "axios";
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // email | otp | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const api = process.env.REACT_APP_API_URL;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { email: email.trim().toLowerCase() };
      const res = await (api ? axios.post(`${api}/auth/forgot-password-otp`, payload) : axiosInstance.post('/auth/forgot-password-otp', payload));
      toast.success(res.data.message || "OTP sent to your email");
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
      const payload = { email: email.trim().toLowerCase(), otp: (otp || '').trim() };
      const res = await (api ? axios.post(`${api}/auth/verify-otp`, payload) : axiosInstance.post('/auth/verify-otp', payload));
      toast.success(res.data.message || "OTP verified");
      setStep("reset");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetWithOTP = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // We can pass only email + password + confirmPassword since OTP is already verified,
      // but sending otp again is also accepted by backend. We'll not send otp here.
      const payload = { email: email.trim().toLowerCase(), password, confirmPassword };
      const res = await (api ? axios.put(`${api}/auth/reset-password-otp`, payload) : axiosInstance.put('/auth/reset-password-otp', payload));
      toast.success(res.data.message || "Password changed successfully");
      setStep("email");
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
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
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Enter your registered email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Enter the OTP sent to {email}
            </label>
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
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-1/2 bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200"
              >
                Resend OTP
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetWithOTP}>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Create a new password
            </label>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
