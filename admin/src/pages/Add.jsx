import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

// A fixed list of common CSS color names
const colorSuggestionsList = [
  "AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque",
  "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue",
  "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan",
  "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGreen", "DarkKhaki",
  "DarkMagenta", "DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed", "DarkSalmon",
  "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkTurquoise", "DarkViolet",
  "DeepPink", "DeepSkyBlue", "DimGray", "DodgerBlue", "FireBrick", "FloralWhite",
  "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray",
  "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory",
  "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue",
  "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGreen",
  "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray",
  "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon",
  "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen",
  "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed",
  "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy",
  "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod",
  "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru",
  "Pink", "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown",
  "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna",
  "Silver", "SkyBlue", "SlateBlue", "SlateGray", "Snow", "SpringGreen", "SteelBlue",
  "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White",
  "WhiteSmoke", "Yellow", "YellowGreen"
];

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [combo, setCombo] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("");
  const [subCategorySuggestions, setSubCategorySuggestions] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [showSubCategorySuggestions, setShowSubCategorySuggestions] = useState(false);
  const [count, setCount] = useState("");

  const [bestseller, setBestseller] = useState(false);

  const [variants, setVariants] = useState([]);
  const [variantSize, setVariantSize] = useState("");
  const [variantAge, setVariantAge] = useState("");
  const [variantAgeUnit, setVariantAgeUnit] = useState("Years");
  const [variantQuantity, setVariantQuantity] = useState("");
  const [variantColor, setVariantColor] = useState("");

  // New states for color suggestions for variantColor input
  const [filteredColors, setFilteredColors] = useState(colorSuggestionsList);
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);

  const [loading, setLoading] = useState(false);

  // Fetch subcategories and brand suggestions as in your current code
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

  // New handler for variant color change with suggestions
  const handleVariantColorChange = (e) => {
    const value = e.target.value;
    setVariantColor(value);
    if (value.trim()) {
      const filtered = colorSuggestionsList.filter((color) =>
        color.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredColors(filtered);
    } else {
      setFilteredColors(colorSuggestionsList);
    }
    setShowColorSuggestions(true);
  };

  const handleColorSuggestionClick = (color) => {
    setVariantColor(color);
    setShowColorSuggestions(false);
  };

  // Helper function: compress image file before saving to state
  const compressAndSetImage = async (file, setter) => {
    try {
      const options = {
        maxSizeMB: 1, // Adjust maximum file size (in MB) as needed
        maxWidthOrHeight: 1920, // Optional: adjust resolution
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      setter(compressedFile);
    } catch (error) {
      console.error("Image compression error:", error);
      // If error occurs, fallback to original file
      setter(file);
    }
  };

  // Change handlers for each image input now call compressAndSetImage
  const handleImageChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      compressAndSetImage(file, setter);
    }
  };

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
      color: variantColor.trim(),
    };
    if (
      variants.find(
        (v) =>
          v.size === newVariant.size &&
          v.age === newVariant.age &&
          v.color.toLowerCase() === newVariant.color.toLowerCase()
      )
    ) {
      toast.error("This variant already exists.");
      return;
    }
    setVariants([...variants, newVariant]);
    setVariantSize("");
    setVariantAge("");
    setVariantAgeUnit("Years");
    setVariantQuantity("");
    setVariantColor("");
  };

  const removeVariant = (variantToRemove) => {
    setVariants((prev) =>
      prev.filter(
        (v) =>
          !(
            v.size === variantToRemove.size &&
            v.age === variantToRemove.age &&
            v.color.toLowerCase() === variantToRemove.color.toLowerCase()
          )
      )
    );
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || variants.length === 0) {
      toast.error("Please fill in all required fields. At least one variant must be provided.");
      return;
    }
    if (discountPrice && Number(discountPrice) >= Number(price)) {
      toast.error("Discounted price must be less than the product price.");
      return;
    }
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
      formData.append("variants", JSON.stringify(variants));
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);
      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        {
          headers: { token },
          timeout: 120000 // Increased timeout (in ms)
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
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
      if (error.code === "ECONNABORTED") {
        console.error("Timeout error:", error.message);
        toast.error("Upload timed out. Please try again or use Wi-Fi.");
      } else if (error.response) {
        console.error("Response error:", error.response);
        toast.error(error.response.data?.message || "Server error occurred.");
      } else if (error.request) {
        console.error("No response from server:", error.request);
        toast.error("No response from server. Please check your internet.");
      } else {
        console.error("Unexpected error:", error.message);
        toast.error("Network error. Please try again.");
      }
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
                  type="file"
                  id={item.id}
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, item.setter)}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
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
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Unisex">Unisex</option>
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
              onBlur={() =>
                setTimeout(() => setShowSubCategorySuggestions(false), 150)
              }
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
        </div>
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
            <label className="block text-xl font-medium mb-2">Combo</label>
            <input
              type="number"
              placeholder="Enter combo factor (optional)"
              onChange={(e) => setCombo(Number(e.target.value) || "")}
              value={combo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition placeholder-gray-400"
            />
          </div>
        </div>
        <div className="border p-4 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Add Variant</h2>
          <p className="text-sm text-gray-600">
            Enter at least a size or an age. If both are provided, they will be stored in a single variant entry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium mb-1">
                Size (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., X, M, L"
                value={variantSize}
                onChange={(e) => setVariantSize(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-1">
                Age (optional)
              </label>
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
                <label className="block text-lg font-medium mb-1">
                  Age Unit
                </label>
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
            <div className="relative">
              <label className="block text-lg font-medium mb-1">Color</label>
              <input
                type="text"
                placeholder="Enter color"
                value={variantColor}
                onChange={handleVariantColorChange}
                onFocus={() => setShowColorSuggestions(true)}
                onBlur={() => setTimeout(() => setShowColorSuggestions(false), 150)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {showColorSuggestions && filteredColors.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 border bg-white rounded-md max-h-40 overflow-auto">
                  {filteredColors.map((color, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onMouseDown={() => handleColorSuggestionClick(color)}
                    >
                      {color}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800"
          >
            Add Variant
          </button>
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
                      {v.age && (
                        <span>
                          {v.age} {v.ageUnit}
                        </span>
                      )}
                      <span>({v.quantity})</span>
                      <span>[{v.color}]</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {variants.length === 0 && (
          <p className="mt-2 text-sm text-red-500">
            Please add at least one variant.
          </p>
        )}
        </div>
        
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
