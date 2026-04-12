interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "dark";
}

const cardVariants = {
  default: "bg-background-alt border border-border",
  elevated: "bg-background-elevated shadow-sm border border-border",
  dark: "bg-gunmetal text-foreground-on-dark",
};

export default function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <div className={`rounded-lg p-6 ${cardVariants[variant]} ${className}`}>
      {children}
    </div>
  );
}
