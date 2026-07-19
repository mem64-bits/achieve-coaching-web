// src/components/AchieveSeparator.tsx
import {cn} from "@/lib/utils";

interface Props {
    thickness?: string;
    /** Accept hex codes (e.g., "#3b43c1") or Tailwind classes (e.g., "bg-red-500") */
    color?: string;
    variant?: "solid" | "gradient" | "glow";
    className?: string;
}

export default function AchieveSeparator({
                                             thickness = "2px",
                                             color = "#3b43c1", // Default to Achieve Blue
                                             variant = "glow",
                                             className,
                                         }: Props) {

    // Logic to determine if color is a hex/rgb or a tailwind class
    const isTailwindClass = color.startsWith("bg-");

    const variants = {
        solid: isTailwindClass ? color : "",
        gradient: `bg-linear-to-r from-transparent via-[${color}] to-transparent`,
        // If variant is glow, we apply the color to the background AND the shadow
        glow: isTailwindClass ? `${color} shadow-lg` : "",
    };

    return (
        <div
            role="none"
            className={cn(
                "w-full block min-w-full transition-all duration-300",
                !isTailwindClass && variants[variant], // Only apply variant classes if not using direct TW class
                className
            )}
            style={{
                height: thickness,
                minHeight: thickness,
                /* Bypasses Tailwind limits: sets color and glow dynamically */
                backgroundColor: !isTailwindClass ? color : undefined,
                boxShadow: variant === "glow" && !isTailwindClass
                    ? `0 0 15px ${color}80` // 80 adds 50% transparency to hex glow
                    : undefined,
                transform: 'translateZ(0)'
            }}
        />
    );
}