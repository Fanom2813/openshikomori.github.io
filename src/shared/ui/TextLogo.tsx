interface TextLogoProps {
  className?: string;
}

export function TextLogo({ className }: TextLogoProps) {
  return (
    <div className={`flex items-center gap-1 font-bold tracking-tight ${className}`}>
      {/* Full text - hidden on mobile */}
      <span className="hidden sm:inline-flex sm:items-center">
        <span className="text-[#009639]">Open</span>
        <span className="text-[#FFD100]">Shi</span>
        <span className="text-[#E1001A]">ko</span>
        <span className="text-[#003DA5]">mori</span>
      </span>

      {/* Short text - visible only on mobile */}
      <span className="flex items-center sm:hidden">
        <span className="text-[#009639]">Open</span>
        <span className="text-[#FFD100]">Shi</span>
      </span>
    </div>
  );
}
