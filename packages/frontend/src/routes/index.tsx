import logo from "/logowhite.svg";
import login from "/login2.png";
import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "@/lib/api/auth";
import { twMerge } from "tailwind-merge";
import { client } from "@/lib/api/client";
import { mightFail } from "might-fail";
import noproto from "/noproto.png";

export const Route = createFileRoute("/")({
  component: Home,
  beforeLoad: async ({ context }) => {
    const { error, result } = await mightFail(
      context.queryClient.fetchQuery(userQueryOptions)
    );

    if (!error && result) {
      throw redirect({ to: "/dashboard" });
    }
  },
  notFoundComponent: () => <div>404 placeholder</div>,
});

function Home() {
  const [email, setEmail] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    document.title = "Home | Arkhet";
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    setRedirecting(true);
    const result = client.api.v0.auth.login[":loginHint"].$url({
      param: { loginHint: encodeURI(email) },
    });
    window.location.href = result.toString();
  }

  return (
    <div>
      <div className="w-screen h-screen #242424 hidden md:grid md:grid-cols-3 p-2 text-white">
        <div className="flex flex-col gap-2 md:m-3 justify-between items-center order-2 md:order-1">
          <div className="flex flex-col md:pt-32 mx-5 gap-2">
            <img src={logo} className="mx-auto w-[50px] my-3" />
            <p className="font-bold w-full text-center tracking-wide md:text-xl lg:text-2xl 2xl:text-4xl">
              Welcome back to Arkhet
            </p>
            <form
              onSubmit={handleLogin}
              className="flex flex-col mt-2 text-xs gap-3"
            >
              <div className=" w-[300px] mx-auto">
                <Input
                  className="border-[#8778D7] border-2 h-[50px] px-2 my-3"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={redirecting}
                  placeholder="Email"
                />
              </div>
              <button
                className={twMerge(
                  "bg-[#9253E4] py-4 text-center rounded hover:bg-[#6f41ac] flex items-center justify-center w-[300px] mx-auto",
                  redirecting ? "bg-[#6f41ac]" : ""
                )}
              >
                {redirecting ? (
                  <svg
                    className="w-4 h-4 animate-spin invert"
                    fill="#000000"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g>
                      <path d="M8,1V2.8A5.2,5.2,0,1,1,2.8,8H1A7,7,0,1,0,8,1Z" />
                    </g>
                  </svg>
                ) : (
                  <p className="tracking-widest">LOG IN</p>
                )}
              </button>
              {/* <div className="text-center">or</div>
            <button
              onClick={handleGoogleLogin}
              className="bg-white text-black flex items-center justify-center w-[300px] mx-auto py-3 rounded hover:bg-gray-200"
            >
              <img
                src="/google_logo.svg"
                alt="Google Logo"
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </button> */}
            </form>
            <div className="flex py-3 text-xs gap-x-1 justify-center items-center">
              <p className="text-[#868686]">Don't have an account?</p>
              <Link to="/signup" className="font-semibold hover:text-[#6f41ac]">
                Register
              </Link>
            </div>
          </div>
          <div className="flex justify-between items-center w-full text-[#868686] text-[0.6rem] p-2">
            <p className="text-[#868686] text-[0.6rem]">
              ©2024 Arkhet AI Inc All rights reserved
            </p>
            <div className="flex space-x-4">
              <a
                href="https://atlo.onrender.com/privacypolicy"
                target="_blank"
                className="hover:underline font-semibold"
              >
                Privacy Policy
              </a>
              <a
                href="https://atlo.onrender.com/terms"
                className="hover:underline font-semibold"
                target="_blank"
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2 md:col-span-2 h-60 md:h-[calc(100vh-1rem)] bg-[#1e1e2f] flex items-center justify-center relative overflow-hidden rounded-3xl">
          <img
            src={login}
            alt="Logic Page Image"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-[5%] md:bottom-[20%] lg:left-[10%] xl:left-[20%] 2xl:left-[25%] text-center">
            <div className=" md:text-4xl text-[#F1B000]">A R K H E T</div>
            <div className="md:mt-5 md:text-3xl">
              Explore product ideas, launch in record time.
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden flex flex-col">
        <img src={noproto} alt="" className="mx-auto pt-10 pb-10 pl-5" />
        <div className="text-center font-bold text-4xl pb-10">
          It's better on desktop!
        </div>
        <div className="text-center px-5">
          Head to{" "}
          <span className="text-[#8778D7]">
            <a href="https://arkhet.app">Arkhet.app</a>
          </span>{" "}
          on your computer to start prototyping
        </div>
      </div>
    </div>
  );
}
