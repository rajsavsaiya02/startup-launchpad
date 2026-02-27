import React from "react";
import { cn } from "../../utils/cn";
import { Eye, EyeOff } from "lucide-react";

export const Input = React.forwardRef(
  ({ label, error, icon: Icon, className, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              <Icon className="h-5 w-5" />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              "flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
              "disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-10",
              isPassword && "pr-10",
              error && "border-error focus:ring-error/20 focus:border-error",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-error animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
