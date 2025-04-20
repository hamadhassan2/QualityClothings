import axios from "axios";
import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import TextField from "@mui/material/TextField";
import Title from "../components/Title";
import ProductCard from "../components/ProductCard";
import { MutatingDots } from "react-loader-spinner";
import { ShopContext } from "../context/ShopContext";

// Global search component remains unchanged
const EnhancedSearch = ({ searchTerm, setSearchTerm, searchField, setSearchField }) => (
  <div className="flex flex-col sm:flex-row items-center">
    <select
      value={searchField}
      onChange={(e) => setSearchField(e.target.value)}
      className="w-full sm:w-48 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black transition"
      style={{ height: "56px" }}
    >
      <option value="name">Name</option>
      <option value="category">Category</option>
      <option value="subCategory">Sub Category</option>
      <option value="color">Color</option>
      <option value="price">Price</option>
      <option value="variants.age">Age</option>
      <option value="variants.size">Size</option>
    </select>
    <TextField
      fullWidth
      variant="outlined"
      placeholder={`Search by ${searchField}`}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "gray",
          padding: "10px",
        },
      }}
    />
  </div>
);

// Utility to shuffle an array (Fisher‑Yates)
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Collection = () => {
  const { search, showSearch } = useContext(ShopContext);
  const [allProducts, setAllProducts] = useState([]);
  // products will be computed locally from allProducts and filters
  const [products, setProducts] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Dropdown visibility for each filter type:
  const [showGenderFilter, setShowGenderFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showAgeFilter, setShowAgeFilter] = useState(false);
  const [showSizeFilter, setShowSizeFilter] = useState(false);
  const [showColorFilter, setShowColorFilter] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showDiscountFilter, setShowDiscountFilter] = useState(false);

  // Persisted filters state (loaded from localStorage if available)
  const defaultFilters = {
    genderFilter: [],
    categoryFilter: [],
    brandFilter: [],
    ageFilter: [],
    sizeFilter: [],
    colorFilter: [],
    priceRangeFilter: [],
    priceInput: { min: "", max: "" },
    discountFilter: [],
    sortType: "relevant",
    search: "",
  };
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem("collectionFilters");
      return saved ? JSON.parse(saved) : defaultFilters;
    } catch {
      return defaultFilters;
    }
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("collectionFilters", JSON.stringify(filters));
    } catch {
      // ignore write errors (e.g. storage full)
    }
  }, [filters]);

  // Global search state.
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const navigate = useNavigate();

  // Helper function for age display.
  const getDisplayAge = (age) => age;

  // Fetch products from backend.
  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) {
        setAllProducts(res.data.products);
      } else {
        console.error("Failed to fetch products:", res.data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Remove loader animation.
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setShowAnimation(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Build distinct filter options.
  // Replace your current uniqueGenders with:
// Corrected filter implementations without syntax errors
const uniqueGenders = Array.from(new Set(allProducts.map(item => item.category)))
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));

const uniqueCategories = Array.from(new Set(allProducts.map(item => item.subCategory)))
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));

const uniqueBrands = Array.from(new Set(allProducts.map(item => item.name)))
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));

const uniqueAges = Array.from(
  new Set(
    allProducts.flatMap(item => 
      (item.variants || [])
        .map(v => v.age ? `${v.age} ${v.ageUnit}`.trim() : null)
        .filter(Boolean)
    )
  )
).sort((a, b) => {
  const [aNum, aUnit] = a.split(' ');
  const [bNum, bUnit] = b.split(' ');
  
  // Convert months to years for comparison if needed
  const aValue = aUnit === 'Months' ? parseFloat(aNum)/12 : parseFloat(aNum);
  const bValue = bUnit === 'Months' ? parseFloat(bNum)/12 : parseFloat(bNum);
  
  return aValue - bValue;
});

const uniqueSizes = Array.from(
  new Set(
    allProducts.flatMap(item => 
      (item.variants || [])
        .map(v => v.size)
        .filter(Boolean)
        .map(size => size.toString().toUpperCase())
    )
  )
).sort((a, b) => {
  // Handle numeric sizes (e.g., shoe sizes)
  if (!isNaN(a)) return parseFloat(a) - parseFloat(b);
  
  // Handle standard clothing sizes
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const aIndex = sizeOrder.indexOf(a);
  const bIndex = sizeOrder.indexOf(b);
  
  // If both are standard sizes, compare their order
  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  
  // If one is standard and one isn't, standard comes first
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;
  
  // Fallback to alphabetical
  return a.localeCompare(b);
});

const uniqueColors = Array.from(
  new Set(
    allProducts.flatMap(item => 
      (item.variants || [])
        .map(v => v.color)
        .filter(Boolean)
        .map(color => color.charAt(0).toUpperCase() + color.slice(1).toLowerCase())
    )
  )
).sort((a, b) => a.localeCompare(b));

// Price ranges (already ordered)
const priceRanges = [
  { label: "Below 250", min: 0, max: 250 },
  { label: "250 to 500", min: 250, max: 500 },
  { label: "500 to 750", min: 500, max: 750 },
  { label: "750 to 1000", min: 750, max: 1000 },
];
const maxProductPrice = allProducts.length > 0 ? Math.max(...allProducts.map((item) => item.price)) : 0;
if (maxProductPrice >= 1000) {
  priceRanges.push({ label: "Above 1000", min: 1000 });
}
// Discount ranges (already ordered)
const discountRanges = [
  { label: "0-20%", min: 0, max: 20 },
  { label: "20-40%", min: 20, max: 40 },
  { label: "40-60%", min: 40, max: 60 },
  { label: "60-80%", min: 60, max: 80 },
  { label: "80-100%", min: 80, max: 100 }
];

  // Custom toggleFilter: for priceRangeFilter, compare by label.
  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      if (key === "priceRangeFilter") {
        const exists = prev.priceRangeFilter.some((item) => item.label === value.label);
        return {
          ...prev,
          priceRangeFilter: exists
            ? prev.priceRangeFilter.filter((item) => item.label !== value.label)
            : [...prev.priceRangeFilter, value],
        };
      } else {
        const current = prev[key] || [];
        if (current.includes(value)) {
          return { ...prev, [key]: current.filter((item) => item !== value) };
        } else {
          return { ...prev, [key]: [...current, value] };
        }
      }
    });
  };

  // Numeric price input updating.
  const updatePriceInput = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      priceInput: { ...prev.priceInput, [key]: value },
    }));
  };

  // Custom removeFilter function for priceRangeFilter.
  const removeFilter = (filterKey, value) => {
    setFilters((prev) => {
      if (filterKey === "priceRangeFilter") {
        return {
          ...prev,
          priceRangeFilter: prev.priceRangeFilter.filter((item) => item.label !== value.label),
        };
      }
      return {
        ...prev,
        [filterKey]: prev[filterKey].filter((item) => item !== value),
      };
    });
  };

  // Ensure best sellers always appear first, even after shuffle
  const filteredProducts = useMemo(() => {
    // First, filter the products.
    const filtered = allProducts.filter((product) => {
      let match = true;
      // Search text filter.
      if (filters.search || search) {
        const searchTermLocal = (filters.search || search).toLowerCase();
        match = match && product.name.toLowerCase().includes(searchTermLocal);
      }
      // Gender filter.
      if (filters.genderFilter.length > 0) {
        match = match && filters.genderFilter.includes(product.category);
      }
      // Category filter.
      if (filters.categoryFilter.length > 0) {
        match = match && filters.categoryFilter.includes(product.subCategory);
      }
      // Brand filter.
      if (filters.brandFilter.length > 0) {
        match = match && filters.brandFilter.includes(product.name);
      }
      // Age filter: if any variant's "age ageUnit" matches one of the filters.
      if (filters.ageFilter.length > 0) {
        match =
          match &&
          product.variants &&
          product.variants.some((v) => {
            const variantAge = `${v.age} ${v.ageUnit}`.trim();
            return filters.ageFilter.includes(variantAge);
          });
      }
      // Size filter.
      if (filters.sizeFilter.length > 0) {
        match =
          match &&
          product.variants &&
          product.variants.some((v) => filters.sizeFilter.includes(v.size));
      }
      // Color filter.
      if (filters.colorFilter.length > 0) {
        match =
          match &&
          product.variants &&
          product.variants.some((v) => filters.colorFilter.includes(v.color));
      }
      // Price range filter (on discountedPrice).
      if (filters.priceRangeFilter.length > 0) {
        if (!product.discountedPrice) return false;
        match =
          match &&
          filters.priceRangeFilter.some((range) => {
            if (range.max) {
              return product.discountedPrice >= range.min && product.discountedPrice < range.max;
            } else {
              return product.discountedPrice >= range.min;
            }
          });
      }
      // Price input filter (manual min/max) on discountedPrice.
      if (filters.priceInput.min !== "" || filters.priceInput.max !== "") {
        if (!product.discountedPrice) return false;
        const minVal = filters.priceInput.min !== "" ? Number(filters.priceInput.min) : 0;
        const maxVal = filters.priceInput.max !== "" ? Number(filters.priceInput.max) : Infinity;
        match = match && product.discountedPrice >= minVal && product.discountedPrice < maxVal;
      }
      // Discount filter.
      if (filters.discountFilter.length > 0) {
        const discountPercent = product.discountedPrice
          ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
          : 0;
        match =
          match &&
          filters.discountFilter.some((label) => {
            if (label === "0-20%") return discountPercent >= 0 && discountPercent < 20;
            if (label === "20-40%") return discountPercent >= 20 && discountPercent < 40;
            if (label === "40-60%") return discountPercent >= 40 && discountPercent < 60;
            if (label === "60-80%") return discountPercent >= 60 && discountPercent < 80;
            if (label === "80-100%") return discountPercent >= 80 && discountPercent < 100;
            return false;
          });
      }
      return match;
    });

    // Shuffle the filtered products
    let shuffledProducts = shuffleArray(filtered);

    const bestSellers = filtered.filter(p => p.bestseller && p.count > 0);
  const regularProducts = filtered.filter(p => !p.bestseller && p.count > 0);
  const outOfStockProducts = filtered.filter(p => p.count === 0);

  // Apply sorting based on the selected sortType
  const sortProducts = (products) => {
    switch (filters.sortType) {
      case 'low-high':
        return [...products].sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
      case 'high-low':
        return [...products].sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
      case 'relevant':
      default:
        // For relevant, shuffle within groups but keep bestsellers first
        return shuffleArray(products);
    }
  };

  // Apply sorting to each group
  const sortedBestSellers = sortProducts(bestSellers);
  const sortedRegularProducts = sortProducts(regularProducts);
  const sortedOutOfStock = outOfStockProducts; // Don't sort out of stock items

  return [
    ...sortedBestSellers,
    ...sortedRegularProducts,
    ...sortedOutOfStock
  ];
}, [allProducts, filters, search]);

  useEffect(() => {
    setProducts(filteredProducts);
  }, [filteredProducts]);
  const filterContent = (
    <div className="space-y-6">
      {/* GENDER Filter */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowGenderFilter(!showGenderFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            GENDER
          </button>
          <button
            onClick={() => setShowGenderFilter(!showGenderFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            {showGenderFilter ? "–" : "+"}
          </button>
        </div>
        {showGenderFilter && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {uniqueGenders.map((g) => (
                <label key={g} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gray-600"
                    value={g}
                    onChange={() => toggleFilter("genderFilter", g)}
                    checked={filters.genderFilter.includes(g)}
                  />
                  {g} (
                  {allProducts.filter((item) => item.category === g).length})
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* CATEGORY Filter */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            CATEGORY
          </button>
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            {showCategoryFilter ? "–" : "+"}
          </button>
        </div>
        {showCategoryFilter && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {uniqueCategories.map((cat) => (
                <label key={cat} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gray-600"
                    value={cat}
                    onChange={() => toggleFilter("categoryFilter", cat)}
                    checked={filters.categoryFilter.includes(cat)}
                  />
                  {cat} (
                  {
                    allProducts.filter((item) => item.subCategory === cat)
                      .length
                  }
                  )
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* BRAND Filter */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowBrandFilter(!showBrandFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            BRAND
          </button>
          <button
            onClick={() => setShowBrandFilter(!showBrandFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            {showBrandFilter ? "–" : "+"}
          </button>
        </div>
        {showBrandFilter && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {uniqueBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gray-600"
                    value={brand}
                    onChange={() => toggleFilter("brandFilter", brand)}
                    checked={filters.brandFilter.includes(brand)}
                  />
                  {brand} (
                  {allProducts.filter((item) => item.name === brand).length})
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* AGE Filter */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowAgeFilter(!showAgeFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            AGE
          </button>
          <button
            onClick={() => setShowAgeFilter(!showAgeFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            {showAgeFilter ? "–" : "+"}
          </button>
        </div>
        {showAgeFilter && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {uniqueAges.map((ageLabel) => (
                <label key={ageLabel} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gray-600"
                    value={ageLabel}
                    onChange={() => toggleFilter("ageFilter", ageLabel)}
                    checked={filters.ageFilter.includes(ageLabel)}
                  />
                  {getDisplayAge(ageLabel)} (
                  {
                    allProducts.filter(
                      (item) =>
                        item.variants &&
                        item.variants.some(
                          (v) =>
                            v.age && `${v.age} ${v.ageUnit}`.trim() === ageLabel
                        )
                    ).length
                  }
                  )
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* SIZE Filter */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowSizeFilter(!showSizeFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            SIZE
          </button>
          <button
            onClick={() => setShowSizeFilter(!showSizeFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            {showSizeFilter ? "–" : "+"}
          </button>
        </div>
        {showSizeFilter && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {uniqueSizes.map((sizeLabel) => (
                <label key={sizeLabel} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gray-600"
                    value={sizeLabel}
                    onChange={() => toggleFilter("sizeFilter", sizeLabel)}
                    checked={filters.sizeFilter.includes(sizeLabel)}
                  />
                  {sizeLabel.toUpperCase()} (
                  {
                    allProducts.filter(
                      (item) =>
                        item.variants &&
                        item.variants.some((v) => v.size === sizeLabel)
                    ).length
                  }
                  )
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* COLOR Filter */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowColorFilter(!showColorFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            COLOR
          </button>
          <button
            onClick={() => setShowColorFilter(!showColorFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            {showColorFilter ? "–" : "+"}
          </button>
        </div>
        {showColorFilter && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {uniqueColors.map((color) => (
                <label key={color} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gray-600"
                    value={color}
                    onChange={() => toggleFilter("colorFilter", color)}
                    checked={filters.colorFilter.includes(color)}
                  />
                  {color} (
                  {
                    allProducts.filter(
                      (item) =>
                        item.variants &&
                        item.variants.some((v) => v.color === color)
                    ).length
                  }
                  )
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* PRICE Filter */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            PRICE
          </button>
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            {showPriceFilter ? "–" : "+"}
          </button>
        </div>
        {showPriceFilter && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {priceRanges.map((range) => (
                <label key={range.label} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gray-600"
                    onChange={() => toggleFilter("priceRangeFilter", range)}
                    checked={filters.priceRangeFilter.some(
                      (r) => r.label === range.label
                    )}
                  />
                  {range.label} (
                  {
                    allProducts.filter((item) => {
                      if (!item.discountedPrice) return false;
                      if (range.max) {
                        return (
                          item.discountedPrice >= range.min &&
                          item.discountedPrice < range.max
                        );
                      } else {
                        return item.discountedPrice >= range.min;
                      }
                    }).length
                  }
                  )
                </label>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.priceInput.min}
                  onChange={(e) => updatePriceInput("min", e.target.value)}
                  className="border px-2 py-1 rounded-md text-sm"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.priceInput.max}
                  onChange={(e) => updatePriceInput("max", e.target.value)}
                  className="border px-2 py-1 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* DISCOUNT Filter */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowDiscountFilter(!showDiscountFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            DISCOUNT
          </button>
          <button
            onClick={() => setShowDiscountFilter(!showDiscountFilter)}
            className="text-2xl font-semibold text-gray-800"
          >
            {showDiscountFilter ? "–" : "+"}
          </button>
        </div>
        {showDiscountFilter && (
          <div className="mt-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {discountRanges.map((range) => (
                <label key={range.label} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gray-600"
                    onChange={() => toggleFilter("discountFilter", range.label)}
                    checked={filters.discountFilter.includes(range.label)}
                  />
                  {range.label} (
                  {
                    allProducts.filter((item) => {
                      if (!item.discountedPrice) return 0;
                      const discountPercent = Math.round(
                        ((item.price - item.discountedPrice) / item.price) * 100
                      );
                      return (
                        discountPercent >= range.min &&
                        discountPercent < range.max
                      );
                    }).length
                  }
                  )
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
 

  return (
    <div className="relative">
      <div
        className={`max-w-7xl mx-auto px-0 py-6 ${
          isFiltering ? "blur-sm" : ""
        }`}
      >
        <div className="sm:hidden mb-6">
          <h1 className="text-xl font-bold text-center ">Al Collections</h1>
        </div>
        {/*<div className="sm:hidden mb-4 flex items-center justify-between">*/}
        <div className="sm:hidden sticky top-32 z-40 bg-white mb-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setShowMobileFilter(true)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              showMobileFilter ? "bg-transparent" : "bg-gray-800 text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V20a1 1 0 01-1.447.894l-4-2A1 1 0 009 18v-4.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
            Filters
          </button>
          <select
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sortType: e.target.value }))
            }
            className="border border-gray-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 border-t pt-10  relative">
          {/* <div className="hidden sm:block min-w-[180px]">{filterContent}</div> */}
          <div className="hidden sm:block min-w-[180px] sticky top-36 self-start">{filterContent}</div>
          <div className="flex-1 relative">
            <div className="hidden sm:flex flex-col sm:flex-row items-center justify-between mb-3 sticky top-[140px] z-40 bg-white py-2 bg-white">
              <Title text1="ALL" text2="COLLECTIONS" />
              <select
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortType: e.target.value }))
                }
                className="mt-4 sm:mt-0 border border-gray-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="relevant">Sort by: Relevant</option>
                <option value="low-high">Sort by: Low to High</option>
                <option value="high-low">Sort by: High to Low</option>
              </select>
            </div>
            {(filters.genderFilter.length > 0 ||
              filters.categoryFilter.length > 0 ||
              filters.brandFilter.length > 0 ||
              filters.ageFilter.length > 0 ||
              filters.sizeFilter.length > 0 ||
              filters.colorFilter.length > 0 ||
              filters.priceRangeFilter.length > 0 ||
              filters.discountFilter.length > 0 ||
              filters.priceInput.min !== "" ||
              filters.priceInput.max !== "") && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.genderFilter.map((filter) => (
                    <span
                      key={`gender-${filter}`}
                      className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeFilter("genderFilter", filter)}
                    >
                      Gender: {filter} &times;
                    </span>
                  ))}
                  {filters.categoryFilter.map((filter) => (
                    <span
                      key={`category-${filter}`}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeFilter("categoryFilter", filter)}
                    >
                      Category: {filter} &times;
                    </span>
                  ))}
                  {filters.brandFilter.map((filter) => (
                    <span
                      key={`brand-${filter}`}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeFilter("brandFilter", filter)}
                    >
                      Brand: {filter} &times;
                    </span>
                  ))}
                  {filters.ageFilter.map((filter) => (
                    <span
                      key={`age-${filter}`}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeFilter("ageFilter", filter)}
                    >
                      Age: {filter} &times;
                    </span>
                  ))}
                  {filters.sizeFilter.map((filter) => (
                    <span
                      key={`size-${filter}`}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeFilter("sizeFilter", filter)}
                    >
                      Size: {filter.toUpperCase()} &times;
                    </span>
                  ))}
                  {filters.colorFilter.map((filter) => (
                    <span
                      key={`color-${filter}`}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeFilter("colorFilter", filter)}
                    >
                      Color: {filter} &times;
                    </span>
                  ))}
                  {filters.priceRangeFilter.map((filter) => (
                    <span
                      key={`priceRange-${filter.label}`}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeFilter("priceRangeFilter", filter)}
                    >
                      Price Range: {filter.label} &times;
                    </span>
                  ))}
                  {filters.priceInput.min !== "" && (
                    <span
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          priceInput: { ...prev.priceInput, min: "" },
                        }))
                      }
                    >
                      Min: {filters.priceInput.min} &times;
                    </span>
                  )}
                  {filters.priceInput.max !== "" && (
                    <span
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          priceInput: { ...prev.priceInput, max: "" },
                        }))
                      }
                    >
                      Max: {filters.priceInput.max} &times;
                    </span>
                  )}
                  {filters.discountFilter.map((filter) => (
                    <span
                      key={`discount-${filter}`}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeFilter("discountFilter", filter)}
                    >
                      Discount: {filter} &times;
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((item, index) => {
                  const img = Array.isArray(item.image)
                    ? item.image[0]
                    : item.image;
                  return (
                    <ProductCard
                      key={item._id || index}
                      id={item._id}
                      name={item.name}
                      price={item.price}
                      img={img}
                      category={item.category}
                      subCategory={item.subCategory}
                      discountedPrice={item.discountedPrice}
                      ages={item.ages}
                      count={item.count}
                      color={item.color}
                      bestseller={item.bestseller}
                    />
                  );
                })
              ) : (
                <p className="text-center text-gray-600 col-span-full">
                  No products found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <MutatingDots
            height="120"
            width="120"
            color="#32cd32"
            secondaryColor="#2ecc71"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            visible={true}
          />
        </div>
      )}
      {isFiltering && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white bg-opacity-70">
          <MutatingDots
            height="80"
            width="80"
            color="#32cd32"
            secondaryColor="#2ecc71"
            radius="12.5"
            ariaLabel="filter-loading"
            visible={true}
          />
        </div>
      )}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-6 flex justify-center items-start backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-2xl font-bold">Filters</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="text-2xl font-bold text-red-500 hover:text-red-700"
              >
                &#10005;
              </button>
            </div>
            {filterContent}
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowMobileFilter(false);
                }}
                className="w-full py-2 bg-gray-800 text-white rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
