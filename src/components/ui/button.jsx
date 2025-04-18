import React from "react";
import clsx from "clsx";

export const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "base",
  ...props
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  const sizes = {
    base: "px-4 py-2 text-sm",
    sm: "px-3 py-1 text-sm",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={clsx(
        "rounded-md font-medium transition duration-200",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};