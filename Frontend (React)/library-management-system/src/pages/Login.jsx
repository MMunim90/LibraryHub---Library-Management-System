import { useContext, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { baseURL } from "../services/BaseURL";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import { Bounce, toast } from "react-toastify";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { authUser, setAuthUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // username=munim&password=12345

      const formData = new URLSearchParams();

      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await res.json();
      // console.log(data)

      const accessToken = data?.access_token;

      localStorage.setItem("user_token", accessToken);

      const userRes = await fetch(`${baseURL}/user_profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = await userRes.json();
      // console.log(userData);

      if (userData.detail == "User Not Found!!!") {
        toast.error("Incorrect username or password", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
          transition: Bounce,
          className: "libraryhub-toast",
          progressClassName: "libraryhub-toast-progress",
        });
        
        return;
      } else {
        document.getElementById("my_modal_3").close();
        Swal.fire({
          icon: "success",
          title: "Hey...",
          text: "Login successful!!!",
          background: "#0f172a",
          color: "#e2e8f0",
          confirmButtonColor: "#60a5fa",
          iconColor: "#60a5fa",
          customClass: {
            popup: "libraryhub-swal",
            title: "libraryhub-swal-title",
            confirmButton: "libraryhub-swal-button",
          },
        });
      }

      setAuthUser(userData);
    } catch (error) {
      console.log(error);
    }
  };

  // console.log(authUser);
  return (
    <div className="modal-box relative max-w-md rounded-2xl p-8 shadow-2xl">
      {/* Close Button */}
      <form method="dialog">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">
          ✕
        </button>
      </form>

      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-3xl font-bold">Welcome Back!</h3>
        <p className="mt-2 text-sm text-base-content/60">
          Sign in to continue to your account.
        </p>
      </div>

      {/* Login Form */}
      <form className="space-y-4" onSubmit={handleLogin}>
        <fieldset className="fieldset">
          <label className="label font-medium">Username</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter your username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label mt-2 font-medium">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="input input-bordered w-full pr-12"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* <div className="mt-2 text-right">
            <a
              href="/forgot-password"
              className="link link-hover text-sm text-primary"
            >
              Forgot password?
            </a>
          </div> */}

          <button type="submit" className="btn btn-primary mt-10 w-full">
            Login
          </button>
        </fieldset>
      </form>

      {/* Sign Up Link */}
      <div className="mt-6 text-center text-sm">
        Don't have an account?{" "}
        <button
          type="button"
          className="link link-primary font-semibold"
          onClick={() => {
            document.getElementById("my_modal_3").close();
            document.getElementById("signup_modal").showModal();
          }}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;
