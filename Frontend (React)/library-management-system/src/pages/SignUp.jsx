import { useState } from "react";
import { baseURL } from "../services/BaseURL";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseURL}/create_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.detail || data?.message || "Failed to create your account.",
        );
      }

      // Close signup and login modals
      document.getElementById("signup_modal")?.close();
      document.getElementById("my_modal_3")?.close();

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Account Created Successfully!",
        text: "Welcome to LibraryHub! Login your account and continue.",
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#60a5fa",
        cancelButtonColor: "#475569",
        iconColor: "#34d399",
        confirmButtonText: "Great!",
        customClass: {
          popup: "libraryhub-swal",
          title: "libraryhub-swal-title",
          confirmButton: "libraryhub-swal-button",
        },
      });

      // Reset the form
      setFormData({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        role: "",
      });

      setShowPassword(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.message || "Something went wrong. Please try again.",
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#60a5fa",
        iconColor: "#f87171",
        confirmButtonText: "Okay",
        customClass: {
          popup: "libraryhub-swal",
          title: "libraryhub-swal-title",
          confirmButton: "libraryhub-swal-button",
        },
      });
    }
  };

  return (
    <div className="modal-box relative max-w-lg rounded-2xl p-8 shadow-2xl">
      {/* Close Button */}
      <form method="dialog">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">
          ✕
        </button>
      </form>

      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-3xl font-bold">Create Account</h3>
        <p className="mt-2 text-sm text-base-content/60">
          Join us by creating your account.
        </p>
      </div>

      {/* Signup Form */}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* First Name */}
          <fieldset className="fieldset">
            <label className="label">First Name</label>
            <input
              type="text"
              name="firstname"
              className="input input-bordered w-full"
              placeholder="First name"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
          </fieldset>

          {/* Last Name */}
          <fieldset className="fieldset">
            <label className="label">Last Name</label>
            <input
              type="text"
              name="lastname"
              className="input input-bordered w-full"
              placeholder="Last name"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </fieldset>
        </div>

        {/* Username */}
        <fieldset className="fieldset">
          <label className="label">Username</label>
          <input
            type="text"
            name="username"
            className="input input-bordered w-full"
            placeholder="Choose a username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </fieldset>

        {/* Email */}
        <fieldset className="fieldset">
          <label className="label">Email Address</label>
          <input
            type="email"
            name="email"
            className="input input-bordered w-full"
            placeholder="Enter your email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </fieldset>

        {/* Phone Number */}
        <fieldset className="fieldset">
          <label className="label">Phone Number</label>
          <input
            type="tel"
            name="phone_number"
            className="input input-bordered w-full"
            placeholder="Enter your phone number"
            autoComplete="tel"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
        </fieldset>

        {/* Password */}
        <fieldset className="fieldset">
          <label className="label">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="input input-bordered w-full pr-12"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </fieldset>

        {/* Role */}
        <fieldset className="fieldset">
          <label className="label">Account Role</label>
          <select
            name="role"
            className="select select-bordered w-full"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select your role
            </option>
            <option value="member">Member</option>
            <option value="librarian">Librarian</option>
          </select>
        </fieldset>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary mt-4 w-full"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <button
          type="button"
          className="link link-primary font-semibold"
          onClick={() => {
            document.getElementById("signup_modal").close();
            document.getElementById("my_modal_3").showModal();
          }}
        >
          Login
        </button>
      </div>

      {/* Click Outside to Close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </div>
  );
};

export default SignUp;
