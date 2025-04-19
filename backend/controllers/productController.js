import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

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
const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      discountedPrice,
      description,
      category,
      subCategory,
      variants,
      bestseller,
      count,
    } = req.body;
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );
    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
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
      count: count ? Number(count) : 0, // Default to 0 for new products
      date: Date.now(),
    };
    const product = new productModel(productData);
    await product.save();
    return res.json({ success: true, message: "Product added successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      price,
      discountedPrice,
      description,
      category,
      subCategory,
      variants,
      bestseller,
      count,
    } = req.body;
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
      count: count ? Number(count) : 0, // Ensure count is updated
    };
    await productModel.findByIdAndUpdate(productId, updateData);
    return res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
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
