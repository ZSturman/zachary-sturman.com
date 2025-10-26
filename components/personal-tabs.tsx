import { cn } from "@/lib/utils";
import { useState } from "react";
import ResumeTab from "./personal-tabs/resume-tab";
import PersonalSummaryTab from "./personal-tabs/personal-summary-tab";
import ProfessionalSummaryTab from "./personal-tabs/professional-summary-tab";
import EducationTab from "./personal-tabs/education-tab";
import ExperienceTab from "./personal-tabs/experience-tab";
import VolunteerTab from "./personal-tabs/volunteer-tab";
import Image from "next/image";

type PersonalMenuItemId =
  | "resume"
  | "personal"
  | "professional"
  | "education"
  | "experience"
  | "volunteer";

type PersonalMenuItem = {
  label: string;
  iconPath: string;
  content: React.ReactNode;
};

const personalMenuItems: Record<PersonalMenuItemId, PersonalMenuItem> = {
  resume: {
    label: "Resume",
    iconPath: "icons/personal-resume.svg",
    content: <ResumeTab />,
  },
  personal: {
    label: "Personal Summary",
    iconPath: "icons/user.svg",
    content: <PersonalSummaryTab />,
  },
  professional: {
    label: "Professional Summary",
    iconPath: "icons/briefcase.svg",
    content: <ProfessionalSummaryTab />,
  },
  education: {
    label: "Education",
    iconPath: "icons/education.svg",
    content: <EducationTab />,
  },
  experience: {
    label: "Experience",
    iconPath: "icons/text-file.svg",
    content: <ExperienceTab />,
  },
  volunteer: {
    label: "Volunteer Work",
    iconPath: "icons/volunteer.svg",
    content: <VolunteerTab />,
  },
};

const menuOrder: PersonalMenuItemId[] = [
  "resume",
  "personal",
  "professional",
  "education",
  "experience",
  "volunteer",
];

const PersonalTabs = () => {
  const [activeSection, setActiveSection] = useState<PersonalMenuItemId | null>(
    null
  );

  return (
    <div>
      <div className="mb-8 border-b border-border">
        <nav
          className="flex gap-6 overflow-x-auto"
          aria-label="Portfolio sections"
        >
          {menuOrder.map((id) => {
            const item = personalMenuItems[id];
            return (
              <button
                key={id}
                onClick={() =>
                  setActiveSection(activeSection === id ? null : id)
                }
                className={cn(
                  "whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  activeSection === id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Image
                  src={`${item.iconPath}`}
                  alt={`${item.label} icon`}
                  width={16}
                  height={16}
                  className="inline-block mr-2 mb-1 dark:invert"
                />

                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeSection && <>{personalMenuItems[activeSection].content}</>}
    </div>
  );
};

export default PersonalTabs;
