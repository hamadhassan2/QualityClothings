import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Helper function to aggregate variant options.
const aggregateVariantOptions = (variants) => {
  if (!variants || !Array.isArray(variants)) return [];
  // Map over variants: if age and ageUnit exist, use that; otherwise, if size exists, use the uppercase size.
  const options = variants.map(v => {
    if (v.age && v.ageUnit) {
      return `${v.age} ${v.ageUnit}`.trim();
    } else if (v.size) {
      return v.size.toUpperCase();
    }
    return null;
  }).filter(Boolean);
  return Array.from(new Set(options)); // Remove duplicates.
};

// List products with filters using unified variants.
const listFilteredProducts = async (req, res) => {
  try {
    const {
      search, 
      genderFilter,      // e.g., ["Men", "Women"]
      categoryFilter,    // e.g., ["Shirts", "Dresses"]
      ageFilter,         // e.g., ["5 Year", "3 Month"]
      sizeFilter,        // e.g., ["M", "L"]
      colorFilter,       // e.g., ["red", "blue"]
      priceRangeFilter,  // e.g., [{ label: "Below 250", min: 0, max: 250 }, ...]
      priceInput,        // e.g., { min: "200", max: "1500" }
      discountFilter,    // e.g., ["20-40%", "40-60%"]
      sortType           // e.g., "low-high", "high-low", or "relevant"
    } = req.body;

    let query = { count: { $gt: 0 } };

    // Text search on name.
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    // Filter by category (gender)
    if (genderFilter && genderFilter.length > 0) {
      query.category = { $in: genderFilter };
    }
    // Filter by subcategory.
    if (categoryFilter && categoryFilter.length > 0) {
      query.subCategory = { $in: categoryFilter };
    }

    // Unified Variant Filter Logic.
    const variantFilters = [];
    // Age filter: Parse strings like "5 Year" or "3 Month" into age and unit conditions.
    if (ageFilter && ageFilter.length > 0) {
      const ageConditions = ageFilter.map(item => {
        const parts = item.split(" ");
        const ageNum = Number(parts[0]);
        const ageUnit = parts[1] ? parts[1].trim() : "";
        return { age: ageNum, ageUnit: ageUnit };
      });
      variantFilters.push({ $or: ageConditions });
    }
    // Size filter.
    if (sizeFilter && sizeFilter.length > 0) {
      variantFilters.push({ size: { $in: sizeFilter } });
    }
    // Color filter.
    if (colorFilter && colorFilter.length > 0) {
      variantFilters.push({ color: { $in: colorFilter } });
    }
    if (variantFilters.length > 0) {
      query["variants"] = { $elemMatch: { $or: variantFilters } };
    }

    // Price Range Filter on discountedPrice.
    if (priceRangeFilter && priceRangeFilter.length > 0) {
      query.$and = query.$and || [];
      const priceRangeOr = priceRangeFilter.map(range => {
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

    // Initial product fetch.
    let products = await productModel.find(query).lean();

    // Discount Filter.
    if (discountFilter && discountFilter.length > 0) {
      const discountRanges = [
        { label: "0-20%", min: 0, max: 20 },
        { label: "20-40%", min: 20, max: 40 },
        { label: "40-60%", min: 40, max: 60 },
        { label: "60-80%", min: 60, max: 80 },
        { label: "80-100%", min: 80, max: 100 }
      ];
      products = products.filter(product => {
        if (!product.discountedPrice) return false;
        const discountPercent = Math.round(((product.price - product.discountedPrice) / product.price) * 100);
        return discountFilter.some(label => {
          const range = discountRanges.find(r => r.label === label);
          return discountPercent >= range.min && discountPercent < range.max;
        });
      });
    }

    // Sorting Logic.
    let sort = {};
    if (sortType === "low-high") {
      sort.price = 1;
    } else if (sortType === "high-low") {
      sort.price = -1;
    } else {
      sort.date = -1;
    }
    if (!(discountFilter && discountFilter.length > 0)) {
      products = await productModel.find(query).sort(sort).lean();
    } else {
      products = products.sort((a, b) => {
        if (sort.price) {
          return sort.price === 1 ? a.price - b.price : b.price - a.price;
        } else {
          return b.date - a.date;
        }
      });
    }

    // Aggregate available options (age or size) from each product's variants.
    products = products.map(product => {
      product.ages = aggregateVariantOptions(product.variants);
      return product;
    });

    return res.json({ success: true, products });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, price, discountedPrice, description, category, subCategory, variants, bestseller, count } = req.body;
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter(item => item !== undefined);
    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );
    let parsedVariants = variants;
    if (typeof variants === "string") {
      parsedVariants = JSON.parse(variants);
    }
    const productData = {
      name,
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
      description,
      category,
      subCategory,
      variants: parsedVariants,
      bestseller: bestseller === "true",
      image: imagesUrl,
      count: count ? Number(count) : undefined,
      date: Date.now(),
    };
    const product = new productModel(productData);
    await product.save();
    return res.json({ success: true, message: "Product added successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId, name, price, discountedPrice, description, category, subCategory, variants, bestseller, count } = req.body;
    let parsedVariants = variants;
    if (typeof variants === "string") {
      parsedVariants = JSON.parse(variants);
    }
    const updateData = {
      name,
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
      description,
      category,
      subCategory,
      variants: parsedVariants,
      bestseller: bestseller === "true",
      count: count ? Number(count) : undefined,
    };
    await productModel.findByIdAndUpdate(productId, updateData);
    return res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const listProducts = async (req, res) => {
  try {
    let products = await productModel
      .find({ count: { $gt: 0 } })
      .sort({ date: -1 })
      .lean();

    // Aggregate available options (age/size) from variants.
    products = products.map(product => {
      product.ages = aggregateVariantOptions(product.variants);
      return product;
    });

    return res.json({ success: true, products });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    return res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

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

const getSubCategories = async (req, res) => {
  try {
    const subCategories = await productModel.distinct("subCategory");
    return res.json({ success: true, subCategories });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

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
  getBrands
};
