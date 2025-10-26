// Generic content blocks that can be reused across sections
export interface ContentBlock {
  label: string
  content: string | string[]
}

export interface TagGroup {
  category?: string
  items: string[]
}

export interface TimelineItem {
  title: string
  subtitle: string
  period?: string
  description?: string
  details?: string[]
}

// Unified section content interface
export interface SectionContent {
  blocks?: ContentBlock[]
  tagGroups?: TagGroup[]
  timelineItems?: TimelineItem[]
  downloadUrl?: string
}

// Legacy interfaces for backwards compatibility
export interface ContactMethod {
  type: string
  value: string
  preferred?: boolean
}

export interface Goal {
  timeframe: string
  description: string
}

// Simplified type aliases
export type ResumeContent = SectionContent
export type PersonalContent = SectionContent
export type ProfessionalContent = SectionContent
export type VolunteerContent = SectionContent
export type EducationContent = SectionContent
export type ExperienceContent = SectionContent

export interface PortfolioData {
  resume: ResumeContent
  personal: PersonalContent
  professional: ProfessionalContent
  volunteer: VolunteerContent
  education: EducationContent
  experience: ExperienceContent
  contact: ContactMethod[]
  goals: Goal[]
}




export const personalTabsData: PortfolioData = {
  resume: {
    blocks: [
      {
        label: "Summary",
        content: "Download my full resume to see a comprehensive overview of my skills, experience, and accomplishments."
      }
    ],
    tagGroups: [
      {
        category: "Technical Skills",
        items: ["React", "TypeScript", "Node.js", "Python", "AWS"]
      },
      {
        category: "Design Tools",
        items: ["Figma", "Adobe Creative Suite", "Blender"]
      }
    ],
    downloadUrl: "/resume.pdf"
  },
  personal: {
    blocks: [
      {
        label: "Why I Do What I Do",
        content: "I grew up fascinated by how things work. From taking apart radios as a kid to building my first website at 14, I've always been driven by curiosity and the desire to create meaningful experiences."
      },
      {
        label: "My Thoughts on AI",
        content: "I think a lot about how data and people move through technology, how design influences trust, and how AI can support human judgment instead of replacing it."
      },
      {
        label: "Interests & Hobbies",
        content: [
          "Film and storytelling",
          "3D animation and modeling",
          "Science fiction writing",
          "Data visualization"
        ]
      }
    ]
  },
  professional: {
    blocks: [
      {
        label: "My Journey",
        content: "Before programming, I studied film at Full Sail University and spent years in production—TV, commercials, and features—before moving through a mix of work that ranged from broadcast operations to casino dealing."
      },
      {
        label: "My Approach",
        content: "I build software that helps people work with and make sense of data. Sometimes that means cleaning and reshaping information until it tells a clearer story; other times, it means designing the systems that guide it from one place to another."
      }
    ],
    tagGroups: [
      {
        items: ["Full-stack Development", "Data Engineering", "UI/UX Design", "System Architecture"]
      }
    ]
  },
  volunteer: {
    timelineItems: [
      {
        title: "Denver Dumb Friends League",
        subtitle: "Volunteer",
        description: "Supporting animal welfare and rescue operations"
      },
      {
        title: "Big Cat Rescue",
        subtitle: "Supporter",
        description: "Contributing to wildlife conservation efforts"
      },
      {
        title: "Cocoa Beach Cleanup",
        subtitle: "Participant",
        description: "Regular beach cleanup and environmental conservation"
      }
    ]
  },
  education: {
    timelineItems: [
      {
        title: "B.S. in Media Communication",
        subtitle: "Full Sail University",
        period: "2014"
      }
    ],
    blocks: [
      {
        label: "Certificates",
        content: [
          "Google Certified Data Analyst (2022)",
          "AWS Certified Cloud Practitioner (2023)"
        ]
      }
    ]
  },
  experience: {
    timelineItems: [
      {
        title: "Senior Software Engineer",
        subtitle: "TechCorp",
        period: "2021-Present",
        details: [
          "Led development of data visualization platform",
          "Architected scalable backend systems",
          "Mentored junior developers"
        ]
      },
      {
        title: "Lead Frontend Developer",
        subtitle: "StartupXYZ",
        period: "2018-2021",
        details: [
          "Built responsive web applications",
          "Implemented design systems",
          "Optimized application performance"
        ]
      }
    ]
  },
  contact: [],
  goals: []
}

