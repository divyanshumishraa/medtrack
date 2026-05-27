"use client";

import axios from "axios";

import { useState } from "react";

import { useRouter } from "next/navigation";

import toast, {
    Toaster,
} from "react-hot-toast";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const login = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8080/login",
                {
                    email,
                    password,
                }
            );

            localStorage.setItem(
                "token",
                res.data.token
            );

            toast.success("Login Success");

            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch {
            toast.error(
                "Invalid credentials"
            );
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <Toaster position="top-right" />

            <div className="bg-white p-10 rounded-2xl shadow-lg w-[400px]">
                <h1 className="text-4xl font-bold mb-8 text-center">
                    MedTrack Login
                </h1>

                <div className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        className="w-full border p-4 rounded-xl"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        className="w-full border p-4 rounded-xl"
                    />

                    <button
                        onClick={login}
                        className="w-full bg-black text-white py-4 rounded-xl"
                    >
                        Login
                    </button>
                </div>

                <div className="mt-6 text-sm text-gray-600">
                    Demo Login:
                    <br />
                    admin@medtrack.com
                    <br />
                    admin123
                </div>
            </div>
        </main>
    );
}