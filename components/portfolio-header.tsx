"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { ChevronDown, X } from "lucide-react";
import SocialLinks from "./social-links";
import PersonalTabs from "./personal-tabs";

const ThemeToggle = dynamic(() =>
  import("@/components/global-ui/theme-toggle").then((m) => m.ThemeToggle)
);

export function PortfolioHeader() {
  const name = "Zachary Sturman";
  const title =
    "I think a lot about how design influences trust, and how AI can support human judgment instead of replacing it.";

  return (
    <header className="mb-12 text-center md:text-left">
      <div className="flex items-center justify-end">
        <ThemeToggle />
      </div>

{/*       <h1 className="text-4xl font-light tracking-tight text-foreground transition-colors group-hover:text-muted-foreground md:text-5xl"> */}
<h1 className="text-4xl md:text-5xl font-light dark:text-[#4a9eff] text-[#244468] uppercase tracking-wide">
        {name}
      </h1>

      <h2 className="text-xl md:text-2xl text-muted-foreground mb-4 text-balance">
        {title}
      </h2>

      <SocialLinks />
      <PersonalTabs />
    </header>
  );
}
