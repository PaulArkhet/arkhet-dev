import { createFileRoute } from "@tanstack/react-router";
import logo from "/logowhite.svg";
import login from "/login2.png";
import { client } from "@/lib/api/client";
import { twMerge } from "tailwind-merge";

export const Route = createFileRoute("/unauthorized")({
  component: RouteComponent,
});

function handleLogout() {
  const result = client.api.v0.auth.logout.$url();
  window.location.href = result.toString();
}

function RouteComponent() {
  return (
    <div className="w-screen h-screen #242424 grid md:grid-cols-3 p-2 text-white">
      <div className="flex flex-col gap-2 md:m-3 justify-between items-center order-2 md:order-1">
        <div className="flex flex-col md:pt-32 mx-5 gap-2">
          <img src={logo} className="mx-auto w-[50px] my-3" />
          <p className="font-bold w-full text-center tracking-wide md:text-xl lg:text-2xl 2xl:text-4xl">
            Hey! You don't seem to have access to this product!
          </p>
        </div>
        <button
          onClick={handleLogout}
          className={twMerge(
            "bg-[#9253E4] py-4 text-center rounded hover:bg-[#6f41ac] flex items-center justify-center w-[300px] mx-auto"
          )}
        >
          <p className="tracking-widest">SIGN OUT</p>
        </button>
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
  );
}
