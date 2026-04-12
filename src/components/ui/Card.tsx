interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "dark";
}

const cardVariants = {
  default: "bg-background-alt border border-border/60",
  elevated: "bg-background-elevated border border-border/40",
  dark: "bg-gunmetal text-foreground-on-dark",
};

export default function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <div className={`p-8 ${cardVariants[variant]} ${className}`}>
      {children}
    </div>
  );
}
