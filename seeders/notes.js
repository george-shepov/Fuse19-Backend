const Note = require('../models/Note');

const sampleNotes = [
  {
    title: 'Project Planning Meeting Notes',
    content: `# Project Planning Meeting - Q4 2024

## Attendees
- John Doe (Lead Developer)
- Jane Smith (UX Designer)
- Mike Johnson (Project Manager)

## Key Points Discussed
1. **Timeline**: Target completion by end of Q1 2025
2. **Budget**: Approved budget of $150,000
3. **Technology Stack**:
   - Frontend: React 18 with TypeScript
   - Backend: Node.js with Express
   - Database: MongoDB
   - Hosting: AWS

## Action Items
- [ ] Set up development environment
- [ ] Create wireframes and mockups
- [ ] Define API specifications
- [ ] Set up CI/CD pipeline

## Next Meeting
Scheduled for next Friday at 2:00 PM PST`,
    tags: ['meeting', 'project-planning', 'q4-2024'],
    isPinned: true,
    isArchived: false
  },
  {
    title: 'API Design Guidelines',
    content: `# API Design Guidelines

## REST API Best Practices

### 1. Use Consistent Naming Conventions
- Use nouns for resource names
- Use plural nouns for collections
- Use kebab-case for multi-word resources

### 2. HTTP Methods
- **GET**: Retrieve data
- **POST**: Create new resources
- **PUT**: Update entire resource
- **PATCH**: Partial update
- **DELETE**: Remove resource

### 3. Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

### 4. Response Format
\`\`\`json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
\`\`\`

### 5. Error Handling
Always include meaningful error messages and appropriate status codes.`,
    tags: ['api', 'guidelines', 'development', 'best-practices'],
    isPinned: false,
    isArchived: false
  },
  {
    title: 'Weekly Team Standup',
    content: `# Weekly Team Standup - Week 42

## What did we accomplish last week?
- Completed user authentication module
- Fixed 15 bugs from testing phase
- Deployed staging environment
- Updated documentation

## What are we working on this week?
- File upload functionality
- Real-time chat implementation
- Database performance optimization
- Mobile app testing

## Blockers and Challenges
- Waiting for API keys from third-party service
- Need design approval for new dashboard layout
- Server capacity planning for production

## Team Metrics
- **Velocity**: 32 story points
- **Bug fix rate**: 95%
- **Code coverage**: 87%
- **Customer satisfaction**: 4.6/5`,
    tags: ['standup', 'team', 'weekly', 'metrics'],
    isPinned: false,
    isArchived: false
  },
  {
    title: 'Database Schema Design',
    content: `# Database Schema Design

## User Management
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'moderator') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## File Storage
\`\`\`sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size INTEGER,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Indexing Strategy
- Index on user.email for login queries
- Index on files.user_id for user file queries
- Composite index on (created_at, user_id) for timeline queries`,
    tags: ['database', 'schema', 'sql', 'design'],
    isPinned: true,
    isArchived: false
  },
  {
    title: 'Security Checklist',
    content: `# Security Checklist for Web Applications

## Authentication & Authorization
- [ ] Implement strong password policies
- [ ] Use secure session management
- [ ] Implement rate limiting
- [ ] Add multi-factor authentication
- [ ] Validate JWT tokens properly

## Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS for all communications
- [ ] Implement proper access controls
- [ ] Sanitize user inputs
- [ ] Validate file uploads

## Infrastructure Security
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Implement proper logging
- [ ] Set up monitoring and alerts
- [ ] Regular security audits

## OWASP Top 10 Protection
1. Injection attacks prevention
2. Broken authentication fixes
3. Sensitive data exposure protection
4. XML external entities prevention
5. Broken access control fixes
6. Security misconfiguration prevention
7. Cross-site scripting prevention
8. Insecure deserialization protection
9. Component vulnerability management
10. Insufficient logging monitoring`,
    tags: ['security', 'checklist', 'owasp', 'best-practices'],
    isPinned: true,
    isArchived: false
  },
  {
    title: 'Performance Optimization Ideas',
    content: `# Performance Optimization Ideas

## Frontend Optimizations
- **Code Splitting**: Implement route-based code splitting
- **Lazy Loading**: Load images and components on demand
- **Caching**: Use service workers for offline functionality
- **Bundle Analysis**: Analyze and reduce bundle size
- **CDN**: Use CDN for static assets

## Backend Optimizations
- **Database Indexing**: Add indexes for frequently queried fields
- **Query Optimization**: Use aggregation pipelines efficiently
- **Caching Layer**: Implement Redis for session and data caching
- **Connection Pooling**: Optimize database connections
- **API Response Compression**: Use gzip compression

## Infrastructure
- **Load Balancing**: Distribute traffic across multiple servers
- **Auto Scaling**: Implement horizontal scaling
- **Monitoring**: Set up performance monitoring
- **CDN Integration**: Use CloudFront or similar services

## Metrics to Track
- Page Load Time: < 3 seconds
- API Response Time: < 500ms
- Database Query Time: < 100ms
- Memory Usage: < 80% of available
- CPU Usage: < 70% average`,
    tags: ['performance', 'optimization', 'frontend', 'backend'],
    isPinned: false,
    isArchived: false
  },
  {
    title: 'Code Review Guidelines',
    content: `# Code Review Guidelines

## Before Submitting for Review
- [ ] Code compiles without warnings
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Self-review completed

## Review Checklist
### Functionality
- Does the code work as intended?
- Are edge cases handled?
- Is error handling appropriate?

### Code Quality
- Is the code readable and maintainable?
- Are variable names descriptive?
- Is the code properly organized?
- Are there any code smells?

### Performance
- Are there any obvious performance issues?
- Is the algorithm efficient?
- Are database queries optimized?

### Security
- Are there any security vulnerabilities?
- Is user input properly validated?
- Are sensitive data handled correctly?

## Review Etiquette
- Be constructive and specific
- Focus on the code, not the person
- Explain the "why" behind suggestions
- Acknowledge good practices`,
    tags: ['code-review', 'guidelines', 'quality', 'team'],
    isPinned: false,
    isArchived: false
  },
  {
    title: 'Learning Resources',
    content: `# Learning Resources

## Web Development
### JavaScript
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [JavaScript.info](https://javascript.info/)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)

### React
- [Official React Documentation](https://reactjs.org/docs/)
- [React Patterns](https://reactpatterns.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Node.js
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## System Design
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [High Scalability](http://highscalability.com/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)

## Databases
- [MongoDB University](https://university.mongodb.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Redis Documentation](https://redis.io/documentation)

## DevOps
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS Documentation](https://docs.aws.amazon.com/)`,
    tags: ['learning', 'resources', 'development', 'education'],
    isPinned: false,
    isArchived: false
  }
];

const seedNotes = async (users) => {
  try {
    console.log('🌱 Seeding notes...');
    
    // Clear existing notes (except production)
    if (process.env.NODE_ENV !== 'production') {
      await Note.deleteMany({});
      console.log('🗑️  Cleared existing notes');
    }

    const notes = [];
    const userIds = users.map(user => user._id);
    
    for (let i = 0; i < sampleNotes.length; i++) {
      const noteData = { ...sampleNotes[i] };
      
      // Assign note to a random user (or cycle through users)
      noteData.createdBy = userIds[i % userIds.length];
      noteData.createdAt = new Date();
      noteData.updatedAt = new Date();
      
      const note = new Note(noteData);
      await note.save();
      notes.push(note);
      
      console.log(`✅ Created note: ${noteData.title}`);
    }

    console.log(`🎉 Successfully seeded ${notes.length} notes`);
    return notes;
  } catch (error) {
    console.error('❌ Error seeding notes:', error);
    throw error;
  }
};

module.exports = {
  seedNotes,
  sampleNotes
};