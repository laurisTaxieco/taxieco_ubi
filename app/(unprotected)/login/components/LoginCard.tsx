"use client";

import { loginUrl } from "@/common/const";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginCard = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [hasError, setHasError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const regex = /^.{8,}$/;
    regex.test(password) ? setValidPassword(true) : setValidPassword(false);
  }, [password]);

  async function login(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setValidPassword(false);
    try {
      await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "success") {
            router.push("/");
          }
          //   data.message === "OTP Error" && setHasError(true);
          //   data.message === "Proceed to verify OTP" && setHasOtp(true);
          //   data.message === "New user registered" && login();
        });
    } catch (err) {
      console.log(err);
      setUsername("");
      setPassword("");
    }
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          UBI Data Report
        </p>
      </div>
      <form className="mt-8 space-y-6" action="/api/otp" method="POST">
        <div className="rounded-md shadow-sm space-y-2">
          <div>
            <label htmlFor="username" className="text-sm text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="username"
              autoComplete="username"
              required
              className="appearance-none relative block
                  w-full mt-2 px-3 py-2 border border-gray-300
                  placeholder-gray-500 text-gray-900 rounded-md
                  focus:outline-none focus:ring-indigo-300
                  focus:border-indigo-300 focus:z-10 sm:text-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="password"
              required
              className={`appearance-none relative block
                  w-full mt-2 px-3 py-2 border border-gray-300
                  placeholder-gray-500 text-gray-900 rounded-md
                  focus:outline-none focus:ring-indigo-900
                  ${
                    validPassword
                      ? "focus:border-green-500"
                      : "focus:border-red-500"
                  } focus:z-10 sm:text-sm`}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
        </div>
        <div>
          {!hasError ? (
            <button
              type="submit"
              className={`group relative flex justify-center w-full mx-auto
                py-2 px-4 border border-transparent text-sm font-medium uppercase
                rounded-md text-white ${
                  username !== "" && validPassword
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-300"
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-red-500`}
              disabled={username !== "" && validPassword ? false : true}
              onClick={(e) => login(e)}
            >
              Log In
            </button>
          ) : (
            <div className="w-full text-sm flex justify-center text-red-500 translate-y-[20px]">
              請與客戶服務人員聯絡
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginCard;
