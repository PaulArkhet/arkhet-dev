import { createLazyFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import logo from "/logo_black.png";
import { useEffect, useState } from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { client } from "@/lib/api/client";

export const Route = createLazyFileRoute("/signup")({
    component: Signup,
});

function Signup() {
    const [email, setEmail] = useState("");

    useEffect(() => {
        document.title = "Signup | Arkhet";
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email) return;

        const url = client.api.v0.auth.register[":loginHint"].$url({
            param: { loginHint: encodeURI(email) },
        });

        window.location.href = url.toString();
    }

    return (
        <div className="w-screen bg-[#FFFFFF] grid md:grid-cols-3 p-2">
            <div className="flex flex-col gap-2 m-3 justify-start order-2 md:order-1">
                <Link to="/" className="flex items-center space-x-2">
                    <div style={{ marginTop: "0.05rem" }}>
                        <svg
                            width="14"
                            height="12"
                            viewBox="0 0 14 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0.293945 5.29365C-0.0966797 5.68428 -0.0966797 6.31865 0.293945 6.70928L5.29395 11.7093C5.68457 12.0999 6.31895 12.0999 6.70957 11.7093C7.1002 11.3187 7.1002 10.6843 6.70957 10.2937L3.4127 6.9999H13.0002C13.5533 6.9999 14.0002 6.55303 14.0002 5.9999C14.0002 5.44678 13.5533 4.9999 13.0002 4.9999H3.41582L6.70645 1.70615C7.09707 1.31553 7.09707 0.681152 6.70645 0.290527C6.31582 -0.100098 5.68145 -0.100098 5.29082 0.290527L0.29082 5.29053L0.293945 5.29365Z"
                                fill="black"
                            />
                        </svg>
                    </div>
                    <p className="text-black text-xs font-bold">Go Back</p>
                </Link>
                <div className="flex flex-col pt-10 md:pt-24 mx-auto gap-2 w-56">
                    <img src={logo} className="mx-auto w-[16px] h-[21px]" />
                    <p className="font-bold text-black w-full text-center tracking-wide">
                        Create an account
                    </p>
                    <p className="text-[0.6rem] text-[#868686] text-center">
                        Accelerated Experimentation starts today
                    </p>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col mt-2 text-xs gap-3"
                    >
                        <div className="grid w-full max-w-sm items-center ">
                            <Label
                                htmlFor="email"
                                className="text-black font-bold text-xs mb-1"
                            >
                                Email
                            </Label>

                            <Input
                                className="border-[#D9D9D9] h-6 px-2 text-xs text-black pr-10"
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button className="bg-[#9253E4] py-2 my-5 text-center rounded hover:bg-[#6f41ac]">
                            Register
                        </button>
                    </form>
                    <div className="flex py-3 text-xs gap-x-1 justify-center items-center">
                        <p className="text-[#868686]">
                            Already have an account?
                        </p>
                        <Link
                            to="/"
                            className="font-semibold text-black hover:text-[#6f41ac]"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
                <div className="flex justify-between items-center w-full mt-auto text-[#868686] text-[0.6rem] p-2">
                    <p className="text-[#868686] text-[0.6rem]">
                        ©2024 Arkhet AI Inc All rights reserved
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:underline font-semibold">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:underline font-semibold">
                            Terms & Conditions
                        </a>
                    </div>
                </div>
            </div>
            <div className="order-1 md:order-2 md:col-span-2 h-60 md:h-[calc(100vh-1rem)] bg-[#1e1e2f] flex items-center justify-center relative overflow-hidden rounded-3xl mb-4 md:mb-0">
                <img
                    src="/Signup.png"
                    alt="Sign Up Page Image"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
}
