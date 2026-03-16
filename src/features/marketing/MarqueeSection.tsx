import { motion } from "motion/react";
import * as icons from "simple-icons";

const tools = [
  { name: "GitHub", icon: icons.siGithub },
  { name: "Hugging Face", icon: icons.siHuggingface },
  { name: "Google Colab", icon: icons.siGooglecolab },
  { name: "Kaggle", icon: icons.siKaggle },
  { name: "Python", icon: icons.siPython },
  { name: "React", icon: icons.siReact },
  { name: "TypeScript", icon: icons.siTypescript },
  { name: "Bun", icon: icons.siBun },
  { name: "Vite", icon: icons.siVite },
  { name: "Tailwind CSS", icon: icons.siTailwindcss },
];

export function MarqueeSection() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-muted/30 py-8">
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

      <motion.div
        className="flex gap-16"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
      >
        {[...tools, ...tools].map((tool, index) => (
          <div
            key={`${tool.name}-${index}`}
            className="flex shrink-0 items-center gap-3 text-muted-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="currentColor"
              dangerouslySetInnerHTML={{ __html: tool.icon.svg }}
            />
            <span className="text-sm font-medium whitespace-nowrap">{tool.name}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
