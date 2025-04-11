import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  size: { type: String },       // Optional: if using size
  age: { type: String },        // Optional: if using age
  ageUnit: { type: String },    // Optional (e.g., "Years" or "Months")
  quantity: { type: Number, required: true },
  color: { type: String, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  variants: [variantSchema], // Unified variants array
  bestseller: { type: Boolean },
  count: { type: Number, default: 0 },
  date: { type: Number, required: true }
});

// Pre-save hook to compute count and uppercase variant sizes.
productSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    // Convert each variant's size to uppercase.
    this.variants = this.variants.map((variant) => {
      if (variant.size) {
        variant.size = variant.size.toUpperCase();
      }
      return variant;
    });
    this.count = this.variants.reduce((acc, variant) => acc + Number(variant.quantity || 0), 0);
  } else {
    this.count = 0;
  }
  next();
});

// Pre-findOneAndUpdate hook to compute count from unified variants.
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.variants) {
    let variants = update.variants;
    if (typeof variants === "string") {
      variants = JSON.parse(variants);
    }
    variants = variants.map((variant) => {
      if (variant.size) {
        variant.size = variant.size.toUpperCase();
      }
      return variant;
    });
    const total = variants.reduce((acc, variant) => acc + Number(variant.quantity || 0), 0);
    update.count = total;
    this.setUpdate({ ...update, variants });
  }
  next();
});

const productModel = mongoose.models.Product || mongoose.model("Product", productSchema);
export default productModel;
