import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, Github } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useContribution } from "@/features/contribution";

const navigationItems = [
  { key: "about", path: "/about", label: "About" },
  { key: "dataset", path: "/dataset", label: "Dataset" },
  { key: "roadmap", path: "/roadmap", label: "Roadmap" },
] as const;

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { openContributionModal } = useContribution();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-background/95 backdrop-blur-xl"
          : "border-transparent bg-background/50 backdrop-blur-sm"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="OpenShikomori"
            className="h-8 w-auto"
          />
          <div className="hidden sm:flex sm:flex-col">
            <span className="text-sm font-bold uppercase tracking-wider text-foreground">
              OpenShikomori
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              AI Research Lab
            </span>
          </div>
        </a>

        {/* Right Side - Navigation, GitHub & CTA */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link
            to="/"
            className={`group relative px-4 py-2 text-sm font-medium transition-colors hover:text-foreground ${
              isActive("/") ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Home
            <span
              className={`absolute bottom-1 left-4 right-4 h-px bg-primary transition-transform duration-200 ${
                isActive("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
          {navigationItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`group relative px-4 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                isActive(item.path) ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item.label}
              <span
                className={`absolute bottom-1 left-4 right-4 h-px bg-primary transition-transform duration-200 ${
                  isActive(item.path) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
          <a
            href="https://github.com/Open-Shikomori"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
          <button
            onClick={openContributionModal}
            className="ml-2 inline-flex h-9 items-center gap-2 border border-border bg-primary px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 cursor-pointer"
          >
            Contribute
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-9 w-9 items-center justify-center border border-border lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between border-b border-border/50 px-2 py-3 text-sm font-medium hover:text-foreground ${
                isActive("/") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Home
              <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
            </Link>
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between border-b border-border/50 px-2 py-3 text-sm font-medium hover:text-foreground ${
                  isActive(item.path) ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
              </Link>
            ))}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/Open-Shikomori"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openContributionModal();
                }}
                className="flex flex-1 items-center justify-center gap-2 border border-border bg-primary py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground cursor-pointer"
              >
                Contribute
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
