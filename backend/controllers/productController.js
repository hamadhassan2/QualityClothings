import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import fs from 'fs';
import path from 'path';

// Aggregate variant options (size, age, etc.)
const aggregateVariantOptions = (variants) => {
  if (!variants || !Array.isArray(variants)) return [];
  const options = variants
    .map((v) => {
      if (v.age && v.ageUnit) {
        return `${v.age} ${v.ageUnit}`.trim();
      } else if (v.size) {
        return v.size.toUpperCase();
      }
      return null;
    })
    .filter(Boolean);
  return Array.from(new Set(options));
};

// List filtered products (available and out-of-stock)
const listFilteredProducts = async (req, res) => {
  try {
    const {
      search,
      genderFilter,
      categoryFilter,
      ageFilter,
      sizeFilter,
      colorFilter,
      priceRangeFilter,
      priceInput,
      discountFilter,
      sortType,
    } = req.body;

    let query = {}; // To handle both available and out-of-stock queries

    // Add search and other filters to the query
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (genderFilter && genderFilter.length > 0) {
      query.category = { $in: genderFilter.sort((a, b) => a.localeCompare(b)) }; // Sort gender filter alphabetically
    }
    if (categoryFilter && categoryFilter.length > 0) {
      query.subCategory = {
        $in: categoryFilter.sort((a, b) => a.localeCompare(b)),
      }; // Sort category filter alphabetically
    }

    const variantFilters = [];
    if (ageFilter && ageFilter.length > 0) {
      // Sort age filter: months first, then years
      const sortedAgeFilter = ageFilter.sort((a, b) => {
        const [aValue, aUnit] = a.split(" ");
        const [bValue, bUnit] = b.split(" ");

        if (aUnit === "months" && bUnit === "years") return -1;
        if (aUnit === "years" && bUnit === "months") return 1;
        return parseInt(aValue) - parseInt(bValue);
      });

      const ageConditions = sortedAgeFilter.map((item) => {
        const parts = item.split(" ");
        const ageValue = parts[0].trim();
        const ageUnit = parts[1] ? parts[1].trim() : "";
        return {
          age: { $regex: `^${ageValue}$`, $options: "i" },
          ageUnit: { $regex: `^${ageUnit}$`, $options: "i" },
        };
      });
      variantFilters.push({ $or: ageConditions });
    }
    if (sizeFilter && sizeFilter.length > 0) {
      variantFilters.push({
        size: { $in: sizeFilter.sort((a, b) => a.localeCompare(b)) },
      }); // Sort size filter alphabetically
    }
    if (colorFilter && colorFilter.length > 0) {
      variantFilters.push({
        color: { $in: colorFilter.sort((a, b) => a.localeCompare(b)) },
      }); // Sort color filter alphabetically
    }
    if (variantFilters.length > 0) {
      query["variants"] = { $elemMatch: { $or: variantFilters } };
    }

    if (priceRangeFilter && priceRangeFilter.length > 0) {
      query.$and = query.$and || [];
      const priceRangeOr = priceRangeFilter.map((range) => {
        if (range.label === "Below 250") {
          return { discountedPrice: { $lt: 250 } };
        } else if (range.label === "250 to 500") {
          return { discountedPrice: { $gte: 250, $lt: 500 } };
        } else if (range.label === "500 to 750") {
          return { discountedPrice: { $gte: 500, $lt: 750 } };
        } else if (range.label === "750 to 1000") {
          return { discountedPrice: { $gte: 750, $lt: 1000 } };
        } else if (range.label === "Above 1000") {
          return { discountedPrice: { $gte: 1000 } };
        }
        return {};
      });
      query.$and.push({ $or: priceRangeOr });
    }
    if (priceInput && (priceInput.min !== "" || priceInput.max !== "")) {
      query.discountedPrice = query.discountedPrice || {};
      if (priceInput.min !== "") {
        query.discountedPrice.$gte = Number(priceInput.min);
      }
      if (priceInput.max !== "") {
        query.discountedPrice.$lt = Number(priceInput.max);
      }
    }

    let products = await productModel.find(query).lean();

    // Apply discount filter
    if (discountFilter && discountFilter.length > 0) {
      const discountRanges = [
        { label: "0-20%", min: 0, max: 20 },
        { label: "20-40%", min: 20, max: 40 },
        { label: "40-60%", min: 40, max: 60 },
        { label: "60-80%", min: 60, max: 80 },
        { label: "80-100%", min: 80, max: 100 },
      ];
      products = products.filter((product) => {
        if (!product.discountedPrice) return false;
        const discountPercent = Math.round(
          ((product.price - product.discountedPrice) / product.price) * 100
        );
        return discountFilter.some((label) => {
          const range = discountRanges.find((r) => r.label === label);
          return discountPercent >= range.min && discountPercent < range.max;
        });
      });
    }

    // Sort products based on selected sortType
    // In listFilteredProducts function, modify the sorting logic:
    let sort = {};
    if (sortType === "low-high") {
      sort.price = 1;
    } else if (sortType === "high-low") {
      sort.price = -1;
    } else {
      // Default sorting: bestsellers first, then by date
      sort = { bestseller: -1, date: -1 };
    }

    products = await productModel.find(query).sort(sort).lean();

    // Aggregate variants and add them to products
    products = products.map((product) => {
      product.ages = aggregateVariantOptions(product.variants);
      return product;
    });

    // Separate available and out-of-stock products
    const availableProducts = products.filter((product) => product.count > 0);
    const outOfStockProducts = products.filter(
      (product) => product.count === 0
    );

    return res.json({ success: true, availableProducts, outOfStockProducts });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Add product
// controllers/productController.js

const addProduct = async (req, res) => {
  try {
    console.log('=== ADD PRODUCT ===');
    console.log('Incoming req.body:', req.body);
    console.log('Incoming req.files keys:', Object.keys(req.files || {}));

    // 1️⃣ Destructure raw fields
    const {
      name,
      price: priceStr,
      discountedPrice: dpStr,
      description,
      category,
      subCategory,
      variants,
      bestseller,
      count: countStr,
    } = req.body;

    console.log('Raw priceStr:', priceStr, ' dpStr:', dpStr, ' countStr:', countStr);

    // 2️⃣ Handle images
    const image1 = req.files.image1?.[0];
    const image2 = req.files.image2?.[0];
    const image3 = req.files.image3?.[0];
    const image4 = req.files.image4?.[0];
    const images = [image1, image2, image3, image4].filter(Boolean);
    const imagesUrl = images.map((img) => `/uploads/${img.filename}`);
    console.log('Uploaded files → URLs:', imagesUrl);

    // 3️⃣ Parse variants JSON if needed
    let parsedVariants = variants;
    if (typeof variants === 'string') {
      try {
        parsedVariants = JSON.parse(variants);
      } catch (e) {
        console.error('❌ Failed to parse variants JSON:', variants, e);
        return res.status(400).json({ success: false, message: 'Invalid variants format' });
      }
    }
    console.log('Parsed variants:', parsedVariants);

    // 4️⃣ Convert numeric fields
    const priceNum = parseFloat(priceStr);
    if (Number.isNaN(priceNum)) {
      console.warn(`⚠️ price "${priceStr}" is not a number`);
    }
    const dpNum = dpStr != null ? parseFloat(dpStr) : undefined;
    if (dpStr != null && Number.isNaN(dpNum)) {
      console.warn(`⚠️ discountedPrice "${dpStr}" is not a number`);
    }
    const countNum = countStr != null ? parseInt(countStr, 10) : 0;
    if (countStr != null && Number.isNaN(countNum)) {
      console.warn(`⚠️ count "${countStr}" is not a number, defaulting to 0`);
    }

    // 5️⃣ Build product object
    const productData = {
      name,
      price: Number.isNaN(priceNum) ? 0 : priceNum,
      discountedPrice: Number.isNaN(dpNum) ? undefined : dpNum,
      description,
      category,
      subCategory,
      variants: parsedVariants,
      bestseller: bestseller === 'true',
      image: imagesUrl,
      count: Number.isNaN(countNum) ? 0 : countNum,
      date: Date.now(),
    };
    console.log('Final productData to save:', productData);

    // 6️⃣ Save
    const product = new productModel(productData);
    await product.save();

    console.log('✅ Product saved with ID:', product._id);
    return res.json({ success: true, message: 'Product added successfully' });
  } catch (error) {
    console.error('🔥 Error in addProduct:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Update product
// Update product
// Update product
// controllers/productController.js

// Update product (with debug logging)
const updateProduct = async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT ===');
    console.log('Incoming req.body:', req.body);
    console.log('Incoming req.files keys:', Object.keys(req.files || {}));

    // 1️⃣ Destructure raw strings from the form
    const {
      productId,
      name,
      description,
      price: priceStr,
      discountedPrice: dpStr,
      category,
      subCategory,
      variants,
      bestseller,
      count: countStr,
      combo: comboStr
    } = req.body;

    // 2️⃣ Fetch existing product
    const existing = await productModel.findById(productId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 3️⃣ Delete old image files for any replaced slots
    //    Assumes your uploads live in projectRoot/uploads
   [1,2,3,4].forEach(i => {
  const incoming = req.files[`image${i}`];
  if (!incoming || !incoming.length) return;     // only delete if there's a new upload

  const oldUrl = Array.isArray(existing.image)
    ? existing.image[i - 1]
    : null;
  if (!oldUrl) return;

  // 1) get just the filename
  const filename = path.basename(oldUrl);        // e.g. "1746956567875.png"

  // 2) build the real path to your uploads folder
  //    __dirname is ".../backend/controllers", so "../uploads" is correct
  const oldPath = path.join(__dirname, '../uploads', filename);

  // 3) unlink it
  fs.unlink(oldPath, err => {
    if (err) {
      console.error('⚠️ Failed to delete old image:', oldPath, err);
    } else {
      console.log('✅ Deleted old image:', oldPath);
    }
  });
});
    // 4️⃣ Build updateData object
    const updateData = {};

    if (name !== undefined)        updateData.name        = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined)    updateData.category    = category;
    if (subCategory !== undefined) updateData.subCategory = subCategory;
    if (bestseller !== undefined)  updateData.bestseller  = bestseller === 'true';

    // Parse & validate price
    let priceNum = parseFloat(priceStr);
    if (Number.isNaN(priceNum)) priceNum = existing.price;
    updateData.price = priceNum;

    // Parse & validate discountedPrice
    if (dpStr != null) {
      const dpNum = parseFloat(dpStr);
      if (!Number.isNaN(dpNum)) updateData.discountedPrice = dpNum;
    }

    // Parse count & combo
    const countNum = parseInt(countStr, 10);
    if (!Number.isNaN(countNum)) updateData.count = countNum;
    const comboNum = parseInt(comboStr, 10);
    if (!Number.isNaN(comboNum)) updateData.combo = comboNum;

    // Parse variants JSON
    if (variants !== undefined) {
      try {
        updateData.variants = typeof variants === 'string' 
          ? JSON.parse(variants) 
          : variants;
      } catch (e) {
        console.error('❌ Failed to parse variants JSON:', variants, e);
      }
    }

    // 5️⃣ Build the new image array, slot-by-slot
    const newUploads = {};
    [1, 2, 3, 4].forEach(i => {
      const files = req.files[`image${i}`];
      if (files && files.length) {
        newUploads[i - 1] = `/uploads/${files[0].filename}`;
      }
    });

    const oldImages = Array.isArray(existing.image)
      ? existing.image
      : [existing.image].filter(Boolean);

    const finalImages = [0, 1, 2, 3]
      .map(slot => newUploads[slot] || oldImages[slot] || null)
      .filter(Boolean);

    updateData.image = finalImages;

    // 6️⃣ Perform the update and return the new document
    const updated = await productModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    console.log('✅ Update succeeded:', updated._id);
    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });

  } catch (err) {
    console.error('🔥 Error in updateProduct:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};




// List all products
const listProducts = async (req, res) => {
  try {
    let products = await productModel.find({}).sort({ date: -1 }).lean();
    products = products.map((product) => {
      product.ages = aggregateVariantOptions(product.variants);
      return product;
    });
    return res.json({ success: true, products });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Remove product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    return res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get a single product by ID
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    let product = await productModel.findById(productId).lean();
    if (product) {
      product.ages = aggregateVariantOptions(product.variants);
    }
    return res.json({ success: true, product });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get subcategories
const getSubCategories = async (req, res) => {
  try {
    const subCategories = await productModel.distinct("subCategory");
    return res.json({ success: true, subCategories });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get brands
const getBrands = async (req, res) => {
  try {
    const brands = await productModel.distinct("name");
    return res.json({ success: true, brands });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export {
  listFilteredProducts,
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  updateProduct,
  getSubCategories,
  getBrands,
};
