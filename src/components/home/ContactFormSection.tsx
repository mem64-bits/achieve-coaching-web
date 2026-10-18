// src/components/home/ContactFormSection.tsx
import React from "react";
import {AchieveBtn} from "./Primitives";

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

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    id: string;
    label: React.ReactNode;
    options: string[];
}

function FormSelect({id, label, options, ...rest}: SelectProps) {
    return (
        <div>
            <label htmlFor={id} className="achieve-label">
                {label}
            </label>
            <select id={id} className="achieve-field" {...rest}>
                {options.map((option) => (
                    <option key={option} value={option} className="bg-background text-foreground">
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    id: string;
    label: React.ReactNode;
}

function FormTextarea({id, label, ...rest}: TextareaProps) {
    return (
        <div>
            <label htmlFor={id} className="achieve-label">
                {label}
            </label>
            <textarea id={id} className="achieve-field" {...rest} />
        </div>
    );
}

export default function ContactFormSection() {
    return (
        <section className="apply scroll-mt-24" id="apply">
            <form
                action="#"
                method="post"
                className="max-w-[720px] mx-auto flex flex-col gap-[18px]"
            >
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
                    placeholder="@"
                />

                <div className="half">
                    <FormInput
                        id="ph"
                        name="phone"
                        type="tel"
                        label="Phone Number"
                        required
                    />
                    <FormInput id="em" name="email" type="email" label="Email" required/>
                </div>


                {/*<FormSelect*/}
                {/*    id="goal"*/}
                {/*    name="goal"*/}
                {/*    label="Main goal"*/}
                {/*    options={["Lose fat", "Build muscle", "Both", "Something else"]}*/}
                {/*/>*/}

                <AchieveBtn type="submit" className="w-full mt-2">
                    Submit application
                </AchieveBtn>
            </form>
        </section>
    );
}