import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  // Image states
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  // Basic product fields
  const [name, setName] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [combo, setCombo] = useState(""); // New combo field
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("");
  const [subCategorySuggestions, setSubCategorySuggestions] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [showSubCategorySuggestions, setShowSubCategorySuggestions] = useState(false);
  const [count, setCount] = useState("");

  // Other product fields
  const [bestseller, setBestseller] = useState(false);

  // Unified variants array (each variant: { size, age, ageUnit, quantity, color })
  const [variants, setVariants] = useState([]);

  // Unified variant input fields
  const [variantSize, setVariantSize] = useState("");
  const [variantAge, setVariantAge] = useState("");
  const [variantAgeUnit, setVariantAgeUnit] = useState("Years");
  const [variantQuantity, setVariantQuantity] = useState("");
  const [variantColor, setVariantColor] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch distinct subcategories from the backend.
  useEffect(() => {
    async function fetchSubCategories() {
      try {
        const response = await axios.get(`${backendUrl}/api/product/subcategories`);
        if (response.data.success) {
          setSubCategorySuggestions(response.data.subCategories);
        } else {
          setSubCategorySuggestions([]);
          toast.error("Failed to load subcategories");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching subcategories");
      }
    }
    fetchSubCategories();
  }, []);

  // Fetch distinct brand names from the backend.
  useEffect(() => {
    async function fetchBrandNames() {
      try {
        const response = await axios.get(`${backendUrl}/api/product/brands`);
        if (response.data.success) {
          setBrandSuggestions(response.data.brands);
        } else {
          setBrandSuggestions([]);
          toast.error("Failed to load brand names");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching brand names");
      }
    }
    fetchBrandNames();
  }, []);

  // Handlers for live brand suggestions.
  const handleBrandChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value) {
      const filtered = brandSuggestions.filter((b) =>
        b.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(brandSuggestions);
    }
    setShowBrandSuggestions(true);
  };

  const handleBrandClick = (brand) => {
    setName(brand);
    setShowBrandSuggestions(false);
  };

  // Handler for subcategory suggestions.
  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    setSubCategory(value);
    if (value) {
      const filtered = subCategorySuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories(subCategorySuggestions);
    }
    setShowSubCategorySuggestions(true);
  };

  const handleSubCategoryClick = (suggestion) => {
    setSubCategory(suggestion);
    setShowSubCategorySuggestions(false);
  };

  // Unified variant handler.
  const addVariant = () => {
    if (!variantSize.trim() && !variantAge.trim()) {
      toast.error("Please enter at least a size or an age for the variant.");
      return;
    }
    if (!variantQuantity.trim() || isNaN(variantQuantity) || !variantColor.trim()) {
      toast.error("Please enter a valid quantity and color for the variant.");
      return;
    }
    const newVariant = {
      size: variantSize.trim() || null,
      age: variantAge.trim() || null,
      ageUnit: variantAge.trim() ? variantAgeUnit : null,
      quantity: Number(variantQuantity),
      color: variantColor.trim()
    };
    // Check for duplicates.
    if (variants.find(v => v.size === newVariant.size && v.age === newVariant.age && v.color.toLowerCase() === newVariant.color.toLowerCase())) {
      toast.error("This variant already exists.");
      return;
    }
    setVariants([...variants, newVariant]);
    // Clear variant inputs.
    setVariantSize("");
    setVariantAge("");
    setVariantAgeUnit("Years");
    setVariantQuantity("");
    setVariantColor("");
  };

  // Handlers for removing variants.
  const removeVariant = (variantToRemove) => {
    setVariants(prev => prev.filter(v => !(v.size === variantToRemove.size && v.age === variantToRemove.age && v.color.toLowerCase() === variantToRemove.color.toLowerCase())));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate required fields and ensure at least one variant exists.
    if (!name.trim() || !price || variants.length === 0) {
      toast.error("Please fill in all required fields. At least one variant must be provided.");
      return;
    }

    if (discountPrice && Number(discountPrice) >= Number(price)) {
      toast.error("Discounted price must be less than the product price.");
      return;
    }

    // Multiply price and discounted price by the combo value if provided.
    let finalPrice = Number(price);
    let finalDiscountPrice = discountPrice ? Number(discountPrice) : "";
    if (combo) {
      finalPrice *= Number(combo);
      if (finalDiscountPrice) {
        finalDiscountPrice *= Number(combo);
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", finalPrice);
      if (finalDiscountPrice) {
        formData.append("discountedPrice", finalDiscountPrice);
      }
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      if (count) {
        formData.append("count", count);
      }
      // Append the unified variants as a JSON string.
      formData.append("variants", JSON.stringify(variants));

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        // Reset all fields
        setName("");
        setDescription("");
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setPrice("");
        setCombo("");
        setDiscountPrice("");
        setVariants([]);
        setVariantSize("");
        setVariantAge("");
        setVariantAgeUnit("Years");
        setVariantQuantity("");
        setVariantColor("");
        setSubCategory("");
        setCount("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold inline-block border-b-2 border-gray-300 pb-4">
          Add New Product
        </h1>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-8">
        {/* Upload Images */}
        <div>
          <p className="text-xl font-semibold mb-3">Upload Images</p>
          <div className="flex flex-wrap gap-4">
            {[
              { img: image1, setter: setImage1, id: "image1" },
              { img: image2, setter: setImage2, id: "image2" },
              { img: image3, setter: setImage3, id: "image3" },
              { img: image4, setter: setImage4, id: "image4" },
            ].map((item, index) => (
              <label key={index} htmlFor={item.id} className="cursor-pointer">
                <img
                  className="w-24 h-24 object-cover rounded-md shadow border border-gray-300"
                  src={
                    !item.img
                      ? assets.upload_area
                      : URL.createObjectURL(item.img)
                  }
                  alt={`Upload ${item.id}`}
                />
                <input
                  onChange={(e) => item.setter(e.target.files[0])}
                  type="file"
                  id={item.id}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>

        {/* Brand Name with live suggestions */}
        <div className="relative">
          <label className="block text-xl font-medium mb-2">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter brand name"
            required
            onChange={handleBrandChange}
            onFocus={() => setShowBrandSuggestions(true)}
            onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 150)}
            value={name}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition placeholder-gray-400"
          />
          {showBrandSuggestions && filteredBrands.length > 0 && (
            <div className="absolute top-full left-0 right-0 border border-gray-300 bg-white z-10 max-h-40 overflow-auto rounded-md">
              {filteredBrands.map((brand, index) => (
                <div
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onMouseDown={() => handleBrandClick(brand)}
                >
                  {brand}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-xl font-medium mb-2">
            Product Description
          </label>
          <textarea
            placeholder="Enter product description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition placeholder-gray-400"
          />
        </div>

        {/* Price, Combo and Discount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 25"
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              value={price}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-xl font-medium mb-2">
              Discounted Price
            </label>
            <input
              type="number"
              placeholder="Optional"
              onChange={(e) => setDiscountPrice(Number(e.target.value) || 0)}
              value={discountPrice}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-xl font-medium mb-2">
              Combo
            </label>
            <input
              type="number"
              placeholder="Enter combo factor (optional)"
              onChange={(e) => setCombo(Number(e.target.value) || "")}
              value={combo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition placeholder-gray-400"
            />
          </div>
        </div>

        {/* Category & Sub Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Category <span className="text-red-500">*</span>
            </label>
            <select
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Boy">Boy</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div className="relative">
            <label className="block text-xl font-medium mb-2">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter subcategory"
              onChange={handleSubCategoryChange}
              onFocus={() => {
                setShowSubCategorySuggestions(true);
                setFilteredSubCategories(subCategorySuggestions);
              }}
              onBlur={() => setTimeout(() => setShowSubCategorySuggestions(false), 150)}
              value={subCategory}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition placeholder-gray-400"
            />
            {showSubCategorySuggestions && filteredSubCategories.length > 0 && (
              <div className="absolute top-full left-0 right-0 border border-gray-300 bg-white z-10 max-h-40 overflow-auto rounded-md">
                {filteredSubCategories.map((s, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSubCategoryClick(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div></div>
        </div>

        {/* Unified Variant Input Section */}
        <div className="border p-4 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Add Variant</h2>
          <p className="text-sm text-gray-600">
            Enter at least a size or an age. If both are provided, they will be stored in a single variant entry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium mb-1">Size (optional)</label>
              <input
                type="text"
                placeholder="e.g., X, M, L"
                value={variantSize}
                onChange={(e) => setVariantSize(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-1">Age (optional)</label>
              <input
                type="text"
                placeholder="e.g., 3 or 3-4"
                value={variantAge}
                onChange={(e) => setVariantAge(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {variantAge && (
              <div>
                <label className="block text-lg font-medium mb-1">Age Unit</label>
                <select
                  value={variantAgeUnit}
                  onChange={(e) => setVariantAgeUnit(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="Years">Years</option>
                  <option value="Months">Months</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-lg font-medium mb-1">Quantity</label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={variantQuantity}
                onChange={(e) => setVariantQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-1">Color</label>
              <input
                type="text"
                placeholder="Enter color"
                value={variantColor}
                onChange={(e) => setVariantColor(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800"
          >
            Add Variant
          </button>
          {/* Display added variants */}
          <div className="mt-4 space-y-2">
            {variants.length > 0 && (
              <div>
                <p className="font-semibold">Variants</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => removeVariant(v)}
                      className="flex items-center gap-1 bg-gray-600 text-white px-2 py-1 rounded cursor-pointer"
                      title="Click to remove"
                    >
                      {v.size && <span>{v.size}</span>}
                      {v.age && <span>{v.age} {v.ageUnit}</span>}
                      <span>({v.quantity})</span>
                      <span>[{v.color}]</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation: Require at least one variant */}
        {variants.length === 0 && (
          <p className="mt-2 text-sm text-red-500">
            Please add at least one variant.
          </p>
        )}

        {/* Bestseller */}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="bestseller"
            checked={bestseller}
            onChange={() => setBestseller((prev) => !prev)}
            className="w-5 h-5"
          />
          <label htmlFor="bestseller" className="cursor-pointer text-xl">
            Add to Bestseller
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-32 flex justify-center items-center py-3 bg-green-500 text-white rounded-lg transition transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-dashed border-white rounded-full animate-spin"></div>
          ) : (
            "ADD"
          )}
        </button>
      </form>
    </div>
  );
};

export default Add;
