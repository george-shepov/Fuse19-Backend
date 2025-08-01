const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// @desc    Get analytics dashboard data
// @route   GET /api/dashboards/analytics
// @access  Private (temporarily optional for testing)
router.get('/analytics', optionalAuth, asyncHandler(async (req, res) => {
  // Return data in the format expected by the frontend (matching mock API structure)
  const analyticsData = {
    visitors: {
      chart: {
        '2020': [
          { name: 'Jan', value: 4054 },
          { name: 'Feb', value: 7725 },
          { name: 'Mar', value: 3841 },
          { name: 'Apr', value: 7920 },
          { name: 'May', value: 4391 },
          { name: 'Jun', value: 8127 },
          { name: 'Jul', value: 5964 },
          { name: 'Aug', value: 8496 },
          { name: 'Sep', value: 6572 },
          { name: 'Oct', value: 7814 },
          { name: 'Nov', value: 4934 },
          { name: 'Dec', value: 6851 }
        ],
        '2021': [
          { name: 'Jan', value: 5147 },
          { name: 'Feb', value: 8321 },
          { name: 'Mar', value: 4965 },
          { name: 'Apr', value: 8752 },
          { name: 'May', value: 5834 },
          { name: 'Jun', value: 9248 },
          { name: 'Jul', value: 6891 },
          { name: 'Aug', value: 9574 },
          { name: 'Sep', value: 7463 },
          { name: 'Oct', value: 8951 },
          { name: 'Nov', value: 5782 },
          { name: 'Dec', value: 7649 }
        ]
      },
      dataset: '2021',
      datasetOptions: ['2020', '2021'],
      overview: {
        'this-month': {
          'new-visitors': 73479,
          'unique-visitors': 648929
        },
        'last-month': {
          'new-visitors': 69781,
          'unique-visitors': 592063
        }
      }
    },
    conversions: {
      amount: 4567,
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        { name: 'Conversions', data: [4412, 4345, 4541, 4677, 4322, 4123, 4654, 4567, 4233, 4456, 4789, 4321] }
      ]
    },
    impressions: {
      amount: 87,
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        { name: 'Impressions', data: [67, 89, 87, 65, 78, 98, 87, 76, 65, 87, 98, 76] }
      ]
    },
    visits: {
      amount: 62,
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        { name: 'Visits', data: [76, 65, 87, 98, 76, 65, 87, 98, 76, 65, 87, 62] }
      ]
    }
  };

  res.json(analyticsData);
}));

// @desc    Get project dashboard data
// @route   GET /api/dashboards/project
// @access  Private (temporarily optional for testing)
router.get('/project', optionalAuth, asyncHandler(async (req, res) => {
  // Return data in the format expected by the frontend (matching mock API structure)
  const projectData = {
    githubIssues: {
      overview: {
        'this-week': {
          'new-issues': 214,
          'closed-issues': 75,
          fixed: 3,
          'wont-fix': 4,
          're-opened': 8,
          'needs-triage': 6,
        },
        'last-week': {
          'new-issues': 197,
          'closed-issues': 72,
          fixed: 6,
          'wont-fix': 11,
          're-opened': 6,
          'needs-triage': 5,
        },
      },
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: {
        'this-week': [
          {
            name: 'New issues',
            type: 'line',
            data: [42, 28, 43, 34, 20, 25, 22],
          },
          {
            name: 'Closed issues',
            type: 'column',
            data: [11, 10, 8, 11, 8, 10, 17],
          },
        ],
        'last-week': [
          {
            name: 'New issues',
            type: 'line',
            data: [37, 32, 39, 27, 18, 24, 20],
          },
          {
            name: 'Closed issues',
            type: 'column',
            data: [9, 8, 10, 12, 7, 11, 15],
          },
        ],
      },
    },
    taskDistribution: {
      overview: {
        'this-week': {
          new: 594,
          completed: 287,
        },
        'last-week': {
          new: 526,
          completed: 260,
        },
      },
      labels: ['API', 'Backend', 'Frontend', 'Issues'],
      series: {
        'this-week': [15, 20, 38, 27],
        'last-week': [19, 16, 42, 23],
      },
    },
    budgetDistribution: {
      categories: ['Concept', 'Design', 'Implementation', 'Testing', 'Deployment'],
      series: [
        {
          name: 'Budget Distribution',
          data: [85, 70, 75, 90, 65]
        }
      ]
    },
    weeklyExpenses: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        {
          name: 'Expenses',
          data: [2100, 1800, 2400, 2200, 1900, 1600, 1400]
        }
      ]
    },
    monthlyExpenses: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        {
          name: 'Expenses',
          data: [45000, 38000, 52000, 48000, 41000, 35000, 42000, 39000, 46000, 44000, 37000, 40000]
        }
      ]
    },
    yearlyExpenses: {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      series: [
        {
          name: 'Expenses',
          data: [420000, 380000, 450000, 520000, 480000, 510000]
        }
      ]
    },
    schedule: {
      today: [
        {
          id: '1',
          title: 'Daily Standup',
          time: '09:00',
          location: 'Conference Room A'
        },
        {
          id: '2',
          title: 'Code Review',
          time: '14:00',
          location: 'Online'
        }
      ],
      tomorrow: [
        {
          id: '3',
          title: 'Sprint Planning',
          time: '10:00',
          location: 'Conference Room B'
        }
      ]
    }
  };

  res.json(projectData);
}));

// @desc    Get finance dashboard data
// @route   GET /api/dashboards/finance
// @access  Private
router.get('/finance', auth, asyncHandler(async (req, res) => {
  // TODO: Implement finance dashboard
  res.json({
    success: true,
    data: {
      revenue: '$45,250',
      expenses: '$12,840',
      profit: '$32,410',
      growthRate: '12.5%'
    }
  });
}));

// @desc    Get crypto dashboard data
// @route   GET /api/dashboard/crypto
// @access  Private
router.get('/crypto', auth, asyncHandler(async (req, res) => {
  // TODO: Implement crypto dashboard
  res.json({
    success: true,
    data: {
      portfolio: {
        total: '$125,450',
        change: '+5.2%'
      },
      assets: [
        { symbol: 'BTC', value: '$85,000', change: '+3.2%' },
        { symbol: 'ETH', value: '$25,450', change: '+2.1%' },
        { symbol: 'ADA', value: '$15,000', change: '+8.5%' }
      ]
    }
  });
}));

module.exports = router;