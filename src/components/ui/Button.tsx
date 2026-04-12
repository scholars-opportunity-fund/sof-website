import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  onClick?: never;
  type?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-copper text-cloud hover:bg-copper-hover",
  secondary:
    "bg-ink text-cloud hover:bg-gunmetal",
  outline:
    "border border-copper text-copper hover:bg-copper hover:text-cloud",
  ghost:
    "text-slate hover:text-ink",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  href,
  ...rest
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide uppercase transition-colors duration-200 rounded";

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
