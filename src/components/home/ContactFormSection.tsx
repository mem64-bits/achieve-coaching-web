// src/components/home/ContactFormSection.tsx
import React, {useState} from "react";
import {AchieveBtn} from "./AchieveBtn";
import {PhoneInput} from "react-international-phone";
import "react-international-phone/style.css";
import {submitApplication} from "@/lib/api.ts";
import type {ApplyRequestPayload} from "@/types/apply.ts";
import {SectionContainer} from "../ui/SectionContainer";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: React.ReactNode;
}

function FormInput({id, label, ...rest}: InputProps) {
    return (
        <div>
            <label htmlFor={id} className="achieve-label">
                {label}
            </label>
            <input id={id} className="achieve-field" {...rest} />
        </div>
    );
}

export default function ContactFormSection() {
    const [phone, setPhone] = useState<string>("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        const form = e.currentTarget;
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries()) as unknown as ApplyRequestPayload;

        try {
            await submitApplication(payload);
            setStatus("success");
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "Failed to submit application. Please check your details.");
        }
    }

    if (status === "success") {
        return (
            <SectionContainer
                id="apply"
                maxWidth="narrow"
                spacing="relaxed"
                className="apply scroll-mt-24 text-center"
            >
                <div className="max-w-125 mx-auto py-12">
                    <div
                        className="w-16 h-16 bg-achieve-blue/15 text-achieve-blue border border-achieve-blue/30 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        ✓
                    </div>
                    <h2 className="achieve-h2 text-3xl font-extrabold text-foreground mb-3">Application Received!</h2>
                    <p className="text-muted-foreground text-lg mb-6">
                        Thanks for reaching out! We will review your application and send you a WhatsApp message within
                        24 hours.
                    </p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="text-achieve-blue text-sm underline hover:opacity-80 transition-opacity"
                    >
                        Submit another response
                    </button>
                </div>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer
            id="apply"
            maxWidth="narrow"
            spacing="relaxed"
            className="apply scroll-mt-24"
        >
            <form
                onSubmit={handleSubmit}
                className="max-w-180 mx-auto flex flex-col gap-4.5"
            >
                {/* Honeypot field (hidden from real users, catches automated bots) */}
                <input
                    type="checkbox"
                    name="botcheck"
                    className="hidden"
                    style={{display: "none"}}
                    tabIndex={-1}
                    autoComplete="off"
                />

                <h2 className="achieve-h2">
                    Contact <span className="a">Form</span>
                </h2>

                <div className="half">
                    <FormInput id="fn" name="first_name" label="First name" required/>
                    <FormInput id="ln" name="last_name" label="Last name" required/>
                </div>

                <FormInput
                    id="ig"
                    name="instagram"
                    label="Instagram or LinkedIn Username"
                    placeholder="@yourhandle or profile link"
                />

                <div className="half">
                    {/* International Phone Input with Flag & Country Picker */}
                    <div>
                        <label htmlFor="ph" className="achieve-label">
                            Phone Number (WhatsApp)
                        </label>
                        <PhoneInput
                            defaultCountry="ie" // Defaults to Ireland (+353)
                            value={phone}
                            onChange={(phoneValue) => setPhone(phoneValue)}
                            inputProps={{
                                id: "ph",
                                required: true,
                            }}
                        />
                        {/* Hidden input carrying the clean international number (+353871234567) to /api/apply */}
                        <input type="hidden" name="phone" value={phone}/>
                    </div>

                    <FormInput
                        id="em"
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                {status === "error" && (
                    <div className="p-3.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {errorMessage}
                    </div>
                )}

                <AchieveBtn type="submit" disabled={status === "loading"} className="w-full mt-2">
                    {status === "loading" ? "Submitting..." : "Submit application"}
                </AchieveBtn>
            </form>
        </SectionContainer>
    );
}