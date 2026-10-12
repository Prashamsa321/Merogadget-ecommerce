import Brand from '../models/Brand.js';
import Product from '../models/product.js';

// Get all brands with product counts
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ name: 1 });

    const counts = await Product.aggregate([
      { $match: { brand: { $exists: true, $ne: '' } } },
      { $group: { _id: { $toLower: '$brand' }, count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    const brandsWithCount = brands.map(b => ({
      ...b.toObject(),
      productCount: countMap[b.name.toLowerCase()] || 0
    }));

    res.status(200).json({
      success: true,
      brands: brandsWithCount
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
};

// Create new brand
export const createBrand = async (req, res) => {
  try {
    const { name, logo } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
    }

    const existing = await Brand.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Brand already exists'
      });
    }

    const brand = new Brand({
      name: name.trim(),
      logo: logo || ''
    });

    await brand.save();

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      brand
    });
  } catch (error) {
    console.error('Create brand error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Brand name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating brand',
      error: error.message
    });
  }
};

// Update brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    const existing = await Brand.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Brand name already exists'
      });
    }

    brand.name = name.trim();
    if (logo !== undefined) brand.logo = logo;

    await brand.save();

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      brand
    });
  } catch (error) {
    console.error('Update brand error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Brand name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating brand',
      error: error.message
    });
  }
};

// Delete brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    await Brand.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting brand',
      error: error.message
    });
  }
};

// Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    res.status(200).json({
      success: true,
      brand
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brand',
      error: error.message
    });
  }
};