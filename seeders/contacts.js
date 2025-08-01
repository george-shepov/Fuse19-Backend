const Contact = require('../models/Contact');

const sampleContacts = [
  {
    firstName: 'Alice',
    lastName: 'Cooper',
    email: 'alice.cooper@techcorp.com',
    phone: '+1-555-0201',
    company: 'TechCorp Industries',
    position: 'Software Engineer',
    avatar: 'assets/images/avatars/female-01.jpg',
    tags: ['colleague', 'developer', 'frontend'],
    notes: 'Excellent React developer. Worked together on the mobile app project.',
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    }
  },
  {
    firstName: 'Bob',
    lastName: 'Martinez',
    email: 'bob.martinez@designstudio.com',
    phone: '+1-555-0202',
    company: 'Design Studio Pro',
    position: 'UI/UX Designer',
    avatar: 'assets/images/avatars/male-02.jpg',
    tags: ['designer', 'creative', 'freelancer'],
    notes: 'Amazing designer with great attention to detail. Available for freelance work.',
    address: {
      street: '456 Design Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    }
  },
  {
    firstName: 'Carol',
    lastName: 'Davis',
    email: 'carol.davis@marketing.com',
    phone: '+1-555-0203',
    company: 'Marketing Solutions',
    position: 'Marketing Manager',
    avatar: 'assets/images/avatars/female-03.jpg',
    tags: ['marketing', 'manager', 'social-media'],
    notes: 'Expert in digital marketing and social media campaigns.',
    address: {
      street: '789 Marketing Blvd',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@consulting.com',
    phone: '+1-555-0204',
    company: 'Business Consulting Inc',
    position: 'Senior Consultant',
    avatar: 'assets/images/avatars/male-04.jpg',
    tags: ['consultant', 'business', 'strategy'],
    notes: 'Strategic business consultant with expertise in digital transformation.',
    address: {
      street: '321 Business Way',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  },
  {
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@startup.io',
    phone: '+1-555-0205',
    company: 'Startup Ventures',
    position: 'Product Manager',
    avatar: 'assets/images/avatars/female-05.jpg',
    tags: ['product', 'startup', 'agile'],
    notes: 'Dynamic product manager with experience in startup environments.',
    address: {
      street: '654 Innovation Dr',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA'
    }
  },
  {
    firstName: 'Frank',
    lastName: 'Garcia',
    email: 'frank.garcia@enterprise.com',
    phone: '+1-555-0206',
    company: 'Enterprise Solutions',
    position: 'DevOps Engineer',
    avatar: 'assets/images/avatars/male-06.jpg',
    tags: ['devops', 'cloud', 'automation'],
    notes: 'DevOps specialist with expertise in AWS and Kubernetes.',
    address: {
      street: '987 Enterprise Ln',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    }
  },
  {
    firstName: 'Grace',
    lastName: 'Lee',
    email: 'grace.lee@fintech.com',
    phone: '+1-555-0207',
    company: 'FinTech Solutions',
    position: 'Data Scientist',
    avatar: 'assets/images/avatars/female-07.jpg',
    tags: ['data-science', 'fintech', 'ai'],
    notes: 'Data scientist specializing in machine learning and financial analytics.',
    address: {
      street: '147 Data Street',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'USA'
    }
  },
  {
    firstName: 'Henry',
    lastName: 'Taylor',
    email: 'henry.taylor@media.com',
    phone: '+1-555-0208',
    company: 'Media Group',
    position: 'Creative Director',
    avatar: 'assets/images/avatars/male-08.jpg',
    tags: ['creative', 'media', 'video'],
    notes: 'Creative director with extensive experience in video production and branding.',
    address: {
      street: '258 Media Ave',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    }
  },
  {
    firstName: 'Isabella',
    lastName: 'Rodriguez',
    email: 'isabella.rodriguez@health.com',
    phone: '+1-555-0209',
    company: 'HealthTech Inc',
    position: 'Project Coordinator',
    avatar: 'assets/images/avatars/female-09.jpg',
    tags: ['healthcare', 'project-management', 'tech'],
    notes: 'Project coordinator in healthcare technology with focus on patient care systems.',
    address: {
      street: '369 Health Blvd',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201',
      country: 'USA'
    }
  },
  {
    firstName: 'Jack',
    lastName: 'Anderson',
    email: 'jack.anderson@ecommerce.com',
    phone: '+1-555-0210',
    company: 'E-Commerce Solutions',
    position: 'Full Stack Developer',
    avatar: 'assets/images/avatars/male-10.jpg',
    tags: ['developer', 'full-stack', 'ecommerce'],
    notes: 'Full stack developer with extensive experience in e-commerce platforms.',
    address: {
      street: '741 Commerce Way',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA'
    }
  }
];

const seedContacts = async (users) => {
  try {
    console.log('🌱 Seeding contacts...');
    
    // Clear existing contacts (except production)
    if (process.env.NODE_ENV !== 'production') {
      await Contact.deleteMany({});
      console.log('🗑️  Cleared existing contacts');
    }

    const contacts = [];
    const userIds = users.map(user => user._id);
    
    for (let i = 0; i < sampleContacts.length; i++) {
      const contactData = { ...sampleContacts[i] };
      
      // Assign contact to a random user (or cycle through users)
      contactData.createdBy = userIds[i % userIds.length];
      contactData.createdAt = new Date();
      contactData.updatedAt = new Date();
      
      const contact = new Contact(contactData);
      await contact.save();
      contacts.push(contact);
      
      console.log(`✅ Created contact: ${contactData.firstName} ${contactData.lastName}`);
    }

    console.log(`🎉 Successfully seeded ${contacts.length} contacts`);
    return contacts;
  } catch (error) {
    console.error('❌ Error seeding contacts:', error);
    throw error;
  }
};

module.exports = {
  seedContacts,
  sampleContacts
};