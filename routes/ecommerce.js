const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// @desc    Get inventory items
// @route   GET /api/ecommerce/inventory
// @access  Private (temporarily optional for testing)
router.get('/inventory', optionalAuth, asyncHandler(async (req, res) => {
  const inventory = [
    {
      id: '1',
      sku: 'LAPTOP-001',
      name: 'MacBook Pro 16"',
      description: 'Apple MacBook Pro 16-inch with M2 Pro chip',
      category: 'Electronics',
      brand: 'Apple',
      price: 2499.00,
      cost: 1999.00,
      quantity: 25,
      reserved: 3,
      available: 22,
      reorderLevel: 5,
      status: 'active',
      images: [
        'assets/images/ecommerce/macbook-pro.jpg'
      ],
      tags: ['laptop', 'apple', 'macbook', 'pro'],
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      sku: 'PHONE-001',
      name: 'iPhone 15 Pro',
      description: 'Apple iPhone 15 Pro with A17 Pro chip',
      category: 'Electronics',
      brand: 'Apple',
      price: 999.00,
      cost: 699.00,
      quantity: 50,
      reserved: 8,
      available: 42,
      reorderLevel: 10,
      status: 'active',
      images: [
        'assets/images/ecommerce/iphone-15-pro.jpg'
      ],
      tags: ['phone', 'apple', 'iphone', 'smartphone'],
      createdAt: new Date(Date.now() - 86400000 * 25).toISOString(), // 25 days ago
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
    },
    {
      id: '3',
      sku: 'TABLET-001',
      name: 'iPad Air',
      description: 'Apple iPad Air with M1 chip',
      category: 'Electronics',
      brand: 'Apple',
      price: 599.00,
      cost: 449.00,
      quantity: 15,
      reserved: 2,
      available: 13,
      reorderLevel: 8,
      status: 'active',
      images: [
        'assets/images/ecommerce/ipad-air.jpg'
      ],
      tags: ['tablet', 'apple', 'ipad', 'air'],
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), // 20 days ago
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
    },
    {
      id: '4',
      sku: 'WATCH-001',
      name: 'Apple Watch Series 9',
      description: 'Apple Watch Series 9 with GPS',
      category: 'Wearables',
      brand: 'Apple',
      price: 399.00,
      cost: 299.00,
      quantity: 3,
      reserved: 1,
      available: 2,
      reorderLevel: 5,
      status: 'low-stock',
      images: [
        'assets/images/ecommerce/apple-watch-series-9.jpg'
      ],
      tags: ['watch', 'apple', 'smartwatch', 'wearable'],
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      sku: 'HEADPHONES-001',
      name: 'AirPods Pro',
      description: 'Apple AirPods Pro with Active Noise Cancellation',
      category: 'Audio',
      brand: 'Apple',
      price: 249.00,
      cost: 179.00,
      quantity: 0,
      reserved: 0,
      available: 0,
      reorderLevel: 10,
      status: 'out-of-stock',
      images: [
        'assets/images/ecommerce/airpods-pro.jpg'
      ],
      tags: ['headphones', 'apple', 'airpods', 'wireless'],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
    }
  ];

  res.json(inventory);
}));

// @desc    Get specific inventory item
// @route   GET /api/ecommerce/inventory/:id
// @access  Private (temporarily optional for testing)
router.get('/inventory/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // In a real implementation, you would fetch from database
  const item = {
    id: id,
    sku: 'LAPTOP-001',
    name: 'MacBook Pro 16"',
    description: 'Apple MacBook Pro 16-inch with M2 Pro chip. Features include:\n\n• M2 Pro chip with 12-core CPU and 19-core GPU\n• 16GB unified memory\n• 512GB SSD storage\n• 16-inch Liquid Retina XDR display\n• 1080p FaceTime HD camera\n• Six-speaker sound system with force-cancelling woofers\n• Studio-quality three-microphone array\n• Up to 22 hours of battery life',
    category: 'Electronics',
    brand: 'Apple',
    price: 2499.00,
    cost: 1999.00,
    quantity: 25,
    reserved: 3,
    available: 22,
    reorderLevel: 5,
    status: 'active',
    images: [
      'assets/images/ecommerce/macbook-pro-1.jpg',
      'assets/images/ecommerce/macbook-pro-2.jpg',
      'assets/images/ecommerce/macbook-pro-3.jpg'
    ],
    tags: ['laptop', 'apple', 'macbook', 'pro', 'm2', 'professional'],
    specifications: {
      'Processor': 'Apple M2 Pro chip',
      'Memory': '16GB unified memory',
      'Storage': '512GB SSD',
      'Display': '16-inch Liquid Retina XDR',
      'Graphics': '19-core GPU',
      'Weight': '4.7 pounds (2.15 kg)',
      'Dimensions': '14.01 x 9.77 x 0.66 inches',
      'Battery': 'Up to 22 hours'
    },
    supplier: {
      id: 'supplier-1',
      name: 'Apple Inc.',
      contact: 'supplier@apple.com',
      phone: '+1-800-APL-CARE'
    },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json(item);
}));

// @desc    Create new inventory item
// @route   POST /api/ecommerce/inventory
// @access  Private
router.post('/inventory', auth, asyncHandler(async (req, res) => {
  const itemData = req.body;
  
  const newItem = {
    id: Date.now().toString(),
    ...itemData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json(newItem);
}));

// @desc    Update inventory item
// @route   PUT /api/ecommerce/inventory/:id
// @access  Private
router.put('/inventory/:id', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const updatedItem = {
    id,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  res.json(updatedItem);
}));

// @desc    Delete inventory item
// @route   DELETE /api/ecommerce/inventory/:id
// @access  Private
router.delete('/inventory/:id', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  res.json({ success: true, message: 'Inventory item deleted successfully' });
}));

// @desc    Get inventory categories
// @route   GET /api/ecommerce/categories
// @access  Private (temporarily optional for testing)
router.get('/categories', optionalAuth, asyncHandler(async (req, res) => {
  const categories = [
    { id: '1', name: 'Electronics', count: 45 },
    { id: '2', name: 'Wearables', count: 12 },
    { id: '3', name: 'Audio', count: 8 },
    { id: '4', name: 'Accessories', count: 23 },
    { id: '5', name: 'Software', count: 6 }
  ];

  res.json(categories);
}));

// @desc    Get inventory brands
// @route   GET /api/ecommerce/brands
// @access  Private (temporarily optional for testing)
router.get('/brands', optionalAuth, asyncHandler(async (req, res) => {
  const brands = [
    { id: '1', name: 'Apple', count: 35 },
    { id: '2', name: 'Samsung', count: 18 },
    { id: '3', name: 'Google', count: 12 },
    { id: '4', name: 'Microsoft', count: 15 },
    { id: '5', name: 'Sony', count: 14 }
  ];

  res.json(brands);
}));

module.exports = router;
