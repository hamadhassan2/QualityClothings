import express from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  updateProduct,
  getSubCategories,
  getBrands,
  listFilteredProducts
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import productModel from "../models/productModel.js"; // Ensure productModel is imported

const productRouter = express.Router();

productRouter.post("/add", adminAuth, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), addProduct);

productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);
// New filter route
productRouter.post("/filter", listFilteredProducts);
productRouter.get("/subcategories", getSubCategories);
productRouter.get("/brands", getBrands);
productRouter.post(
  "/update",
  adminAuth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  updateProduct
);

productRouter.post("/reduce-quantity", async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;

    console.log("Received reduce-quantity request:", { productId, variantId, quantity }); // Debugging log

    if (!productId || !variantId || !quantity) {
      return res.status(400).json({ success: false, message: "Invalid input data" });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant = product.variants.find((v) => v._id.toString() === variantId);

    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    if (variant.quantity < quantity) {
      return res.status(400).json({ success: false, message: "Insufficient stock" });
    }

    variant.quantity -= quantity;
    product.count = product.variants.reduce((acc, v) => acc + v.quantity, 0);

    await product.save();

    return res.json({ success: true, message: "Quantity updated successfully" });
  } catch (error) {
    console.error("Error in reduce-quantity endpoint:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default productRouter;
