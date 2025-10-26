import React from 'react'
import { Button } from '../ui/button'
import { Download } from 'lucide-react'

const ResumeTab = () => {

  const data = {
    summary: "Experienced software developer with a strong background in building scalable web applications and working across the full stack. Proficient in modern frameworks and libraries, with a passion for learning new technologies and improving code quality.",
    skills: [
      {
        category: "Programming Languages",
        items: ["JavaScript", "TypeScript", "Python", "Java"]
      },
      {
        category: "Frameworks & Libraries",
        items: ["React", "Node.js", "Express", "Django"]
      },
      {
        category: "Databases",
        items: ["PostgreSQL", "MongoDB", "MySQL"]
      },
      {
        category: "Tools & Platforms",
        items: ["Git", "Docker", "AWS", "CI/CD"]
      }
    ],
    downloadUrl: "/path/to/full-resume.pdf"
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Summary</h3>
        <p className="leading-relaxed">{data.summary}</p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Skills & Knowledge</h3>
        <div className="space-y-4">
          {data.skills.map((skillGroup) => (
            <div key={skillGroup.category}>
              <h4 className="mb-2 text-sm font-medium">{skillGroup.category}</h4>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((skill) => (
                  <span key={skill} className="rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.downloadUrl && (
        <Button size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download Full Resume
        </Button>
      )}
    </div>
  )
}

export default ResumeTab