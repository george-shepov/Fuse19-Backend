const Task = require('../models/Task');

const sampleTasks = [
  {
    title: 'Implement user authentication system',
    description: 'Create a secure authentication system with JWT tokens, password hashing, and session management.',
    completed: true,
    priority: 'high',
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (completed)
    tags: ['authentication', 'security', 'backend'],
    category: 'Development',
    estimatedHours: 16,
    actualHours: 18
  },
  {
    title: 'Design responsive landing page',
    description: 'Create a modern, responsive landing page that works well on all devices and showcases key features.',
    completed: true,
    priority: 'high',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    tags: ['design', 'frontend', 'responsive'],
    category: 'Design',
    estimatedHours: 12,
    actualHours: 14
  },
  {
    title: 'Set up CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline using GitHub Actions or similar service.',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    tags: ['devops', 'automation', 'deployment'],
    category: 'DevOps',
    estimatedHours: 8
  },
  {
    title: 'Integrate payment processing',
    description: 'Add Stripe or PayPal integration for handling payments securely.',
    completed: false,
    priority: 'high',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    tags: ['payments', 'integration', 'backend'],
    category: 'Development',
    estimatedHours: 20
  },
  {
    title: 'Write API documentation',
    description: 'Create comprehensive API documentation using Swagger/OpenAPI with examples and detailed descriptions.',
    completed: true,
    priority: 'medium',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    tags: ['documentation', 'api', 'swagger'],
    category: 'Documentation',
    estimatedHours: 6,
    actualHours: 8
  },
  {
    title: 'Implement real-time chat feature',
    description: 'Add WebSocket-based chat functionality with typing indicators and message history.',
    completed: true,
    priority: 'medium',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    tags: ['chat', 'websocket', 'real-time'],
    category: 'Development',
    estimatedHours: 24,
    actualHours: 28
  },
  {
    title: 'Optimize database queries',
    description: 'Review and optimize slow database queries, add proper indexing, and implement caching where appropriate.',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    tags: ['database', 'performance', 'optimization'],
    category: 'Performance',
    estimatedHours: 10
  },
  {
    title: 'Mobile app testing',
    description: 'Conduct thorough testing of mobile application on various devices and screen sizes.',
    completed: false,
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    tags: ['testing', 'mobile', 'qa'],
    category: 'Testing',
    estimatedHours: 16
  },
  {
    title: 'Update security dependencies',
    description: 'Review and update all dependencies to their latest secure versions, fix any vulnerabilities.',
    completed: false,
    priority: 'urgent',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    tags: ['security', 'dependencies', 'maintenance'],
    category: 'Security',
    estimatedHours: 4
  },
  {
    title: 'User feedback analysis',
    description: 'Analyze user feedback from beta testing and create actionable improvement recommendations.',
    completed: false,
    priority: 'low',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    tags: ['feedback', 'analysis', 'user-experience'],
    category: 'Research',
    estimatedHours: 8
  },
  {
    title: 'Email notification system',
    description: 'Implement email notifications for important events like password resets, account updates, etc.',
    completed: true,
    priority: 'medium',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    tags: ['email', 'notifications', 'backend'],
    category: 'Development',
    estimatedHours: 12,
    actualHours: 10
  },
  {
    title: 'Load testing and performance analysis',
    description: 'Conduct load testing to identify performance bottlenecks and optimize system performance.',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
    tags: ['performance', 'testing', 'optimization'],
    category: 'Performance',
    estimatedHours: 14
  },
  {
    title: 'Backup and disaster recovery setup',
    description: 'Implement automated backup system and create disaster recovery procedures.',
    completed: false,
    priority: 'low',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    tags: ['backup', 'disaster-recovery', 'infrastructure'],
    category: 'Infrastructure',
    estimatedHours: 12
  },
  {
    title: 'Accessibility improvements',
    description: 'Improve application accessibility following WCAG guidelines for better user experience.',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    tags: ['accessibility', 'frontend', 'user-experience'],
    category: 'Frontend',
    estimatedHours: 20
  },
  {
    title: 'Third-party API integration testing',
    description: 'Test all third-party API integrations and implement proper error handling and fallbacks.',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    tags: ['api', 'integration', 'testing'],
    category: 'Testing',
    estimatedHours: 8
  }
];

const seedTasks = async (users) => {
  try {
    console.log('🌱 Seeding tasks...');
    
    // Clear existing tasks (except production)
    if (process.env.NODE_ENV !== 'production') {
      await Task.deleteMany({});
      console.log('🗑️  Cleared existing tasks');
    }

    const tasks = [];
    const userIds = users.map(user => user._id);
    
    for (let i = 0; i < sampleTasks.length; i++) {
      const taskData = { ...sampleTasks[i] };
      
      // Assign task to a random user (or cycle through users)
      taskData.createdBy = userIds[i % userIds.length];
      
      // Assign task to someone (could be same person or different)
      if (Math.random() > 0.3) {
        taskData.assignedTo = userIds[Math.floor(Math.random() * userIds.length)];
      }
      
      taskData.createdAt = new Date();
      taskData.updatedAt = new Date();
      
      const task = new Task(taskData);
      await task.save();
      tasks.push(task);
      
      console.log(`✅ Created task: ${taskData.title}`);
    }

    console.log(`🎉 Successfully seeded ${tasks.length} tasks`);
    return tasks;
  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
    throw error;
  }
};

module.exports = {
  seedTasks,
  sampleTasks
};