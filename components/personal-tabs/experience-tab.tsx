import React from 'react'

const ExperienceTab = () => {
  const data = {
    positions: [
      {
        title: "Software Engineer",
        company: "Tech Solutions Inc.",
        period: "June 2022 - Present",
        highlights: [
          "Developed and maintained web applications using React and Node.js, improving user engagement by 20%.",
          "Collaborated with cross-functional teams to design and implement new features, resulting in a 15% increase in customer satisfaction.",
          "Optimized application performance, reducing load times by 30% through code refactoring and efficient database queries."
        ]
      },
      {
        title: "Junior Developer",
        company: "Web Innovators LLC",
        period: "July 2020 - May 2022",
        highlights: [
          "Assisted in the development of e-commerce platforms, contributing to a 10% increase in sales for clients.",
          "Wrote unit and integration tests to ensure code quality and reliability, leading to a 25% reduction in bugs reported.",
          "Participated in code reviews and team meetings, fostering a collaborative development environment."
        ]
      }
    ]
  }
  return (
    <div className="space-y-4">
      {data.positions.map((position) => (
        <div key={position.title + position.company} className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="mb-1 flex items-baseline justify-between gap-4">
            <h3 className="font-medium">{position.title}</h3>
            <span className="text-sm text-muted-foreground">{position.period}</span>
          </div>
          <div className="mb-3 text-sm text-muted-foreground">{position.company}</div>
          <ul className="space-y-1">
            {position.highlights.map((highlight, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                • {highlight}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default ExperienceTab