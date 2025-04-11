import axios from 'axios';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import TextField from '@mui/material/TextField';

// Global search component remains unchanged
const EnhancedSearch = ({ searchTerm, setSearchTerm, searchField, setSearchField }) => (
  <div className="flex flex-col sm:flex-row items-center">
    <select
      value={searchField}
      onChange={(e) => setSearchField(e.target.value)}
      className="w-full sm:w-48 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black transition"
      style={{ height: '56px' }}
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
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'gray',
          padding: '10px'
        },
      }}
    />
  </div>
);

// Helper functions for unified variants.
const computeCountUnified = (product) => {
  if (!product.variants || product.variants.length === 0) return 0;
  const uniqueVariants = {};
  product.variants.forEach((v) => {
    const key = `${v.size || ""}_${v.age || ""}_${v.ageUnit || ""}_${v.color.toLowerCase()}`;
    if (!uniqueVariants[key]) {
      uniqueVariants[key] = Number(v.quantity || 0);
    }
  });
  return Object.values(uniqueVariants).reduce((sum, qty) => sum + qty, 0);
};

const computeColorsUnified = (product) => {
  if (!product.variants || product.variants.length === 0) return [];
  const colors = product.variants.map(v => v.color);
  return Array.from(new Set(colors));
};

const computeCount = computeCountUnified;
const computeColors = computeColorsUnified;

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  // Global search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");

  // Filter states for available products.
  const [availableFilter, setAvailableFilter] = useState({
    name: [],
    category: [],
    subCategory: [],
    color: [],
    variants_age: [],
    variants_size: []
  });
  const [availableOpenFilter, setAvailableOpenFilter] = useState({
    name: false,
    category: false,
    subCategory: false,
    color: false,
    variants_age: false,
    variants_size: false,
  });
  // Filter states for out-of-stock products.
  const [outFilter, setOutFilter] = useState({
    name: [],
    category: [],
    subCategory: [],
    color: [],
    variants_age: [],
    variants_size: []
  });
  const [outOpenFilter, setOutOpenFilter] = useState({
    name: false,
    category: false,
    subCategory: false,
    color: false,
    variants_age: false,
    variants_size: false,
  });

  const [subCategorySuggestions, setSubCategorySuggestions] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [showSubCategorySuggestions, setShowSubCategorySuggestions] = useState(false);
  const navigate = useNavigate();

  // Refs for filter dropdown containers.
  const availableFilterContainerRef = useRef(null);
  const outFilterContainerRef = useRef(null);

  // Fetch list from backend.
  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Fetch subcategories for live suggestions.
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

  // Close available filter dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (availableFilterContainerRef.current && !availableFilterContainerRef.current.contains(e.target)) {
        setAvailableOpenFilter({
          name: false,
          category: false,
          subCategory: false,
          color: false,
          variants_age: false,
          variants_size: false,
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close out-of-stock filter dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutsideOut = (e) => {
      if (outFilterContainerRef.current && !outFilterContainerRef.current.contains(e.target)) {
        setOutOpenFilter({
          name: false,
          category: false,
          subCategory: false,
          color: false,
          variants_age: false,
          variants_size: false,
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutsideOut);
    return () => document.removeEventListener("mousedown", handleClickOutsideOut);
  }, []);

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(`${backendUrl}/api/product/remove`, { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // === Edit Modal Helpers for Subcategory ===
  const handleEditSubCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedProduct(prev => ({ ...prev, subCategory: value }));
    if (value) {
      const filtered = subCategorySuggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories(subCategorySuggestions);
    }
    setShowSubCategorySuggestions(true);
  };

  const handleEditSubCategoryClick = (suggestion) => {
    setSelectedProduct(prev => ({ ...prev, subCategory: suggestion }));
    setShowSubCategorySuggestions(false);
  };

  const openEditModal = (product) => {
    setSelectedProduct({ ...product, combo: product.combo || 1 });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
    setShowEditModal(false);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const { _id, name, description, price, discountedPrice, category, subCategory, variants, bestseller, combo } = selectedProduct;
      const comboFactor = combo ? Number(combo) : 1;
      const finalPrice = Number(price) * comboFactor;
      const finalDiscountPrice = discountedPrice ? Number(discountedPrice) * comboFactor : undefined;
      const computedCount = computeCount(selectedProduct);
      const updatedData = {
        productId: _id,
        name,
        description,
        price: finalPrice,
        discountedPrice: finalDiscountPrice,
        category,
        subCategory,
        variants,
        bestseller: bestseller.toString(),
        count: computedCount,
        combo
      };
      const response = await axios.post(`${backendUrl}/api/product/update`, updatedData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        setList(prevList => prevList.map(item => item._id === selectedProduct._id ? { ...selectedProduct } : item));
        closeEditModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await removeProduct(productToDelete._id);
      setProductToDelete(null);
    }
  };

  // === Toggle Functions for Filters ===
  const toggleAvailableFilter = (field) => {
    setAvailableOpenFilter(prev => ({
      name: false,
      category: false,
      subCategory: false,
      color: false,
      variants_age: false,
      variants_size: false,
      [field]: !prev[field]
    }));
  };

  const toggleOutFilter = (field) => {
    setOutOpenFilter(prev => ({
      name: false,
      category: false,
      subCategory: false,
      color: false,
      variants_age: false,
      variants_size: false,
      [field]: !prev[field]
    }));
  };

  const handleAvailableFilterChange = (field, option, checked) => {
    const current = availableFilter[field];
    const updater = checked ? [...current, option] : current.filter(item => item !== option);
    setAvailableFilter(prev => ({ ...prev, [field]: updater }));
  };

  const resetAvailableFilters = () => {
    setAvailableFilter({
      name: [],
      category: [],
      subCategory: [],
      color: [],
      variants_age: [],
      variants_size: []
    });
    setAvailableOpenFilter({
      name: false,
      category: false,
      subCategory: false,
      color: false,
      variants_age: false,
      variants_size: false,
    });
  };

  const handleOutFilterChange = (field, option, checked) => {
    const current = outFilter[field];
    const updater = checked ? [...current, option] : current.filter(item => item !== option);
    setOutFilter(prev => ({ ...prev, [field]: updater }));
  };

  const resetOutFilters = () => {
    setOutFilter({
      name: [],
      category: [],
      subCategory: [],
      color: [],
      variants_age: [],
      variants_size: []
    });
    setOutOpenFilter({
      name: false,
      category: false,
      subCategory: false,
      color: false,
      variants_age: false,
      variants_size: false,
    });
  };

  // === Compute Distinct Filter Options ===
  const globalDistinctNames = useMemo(() => {
    return Array.from(new Set(list.map(item => item.name))).sort();
  }, [list]);

  const globalDistinctCategories = useMemo(() => {
    return Array.from(new Set(list.map(item => item.category))).sort();
  }, [list]);

  const globalDistinctSubCategories = useMemo(() => {
    return Array.from(new Set(list.map(item => item.subCategory || "-"))).sort();
  }, [list]);

  const globalDistinctColors = useMemo(() => {
    const colors = list.flatMap(item => computeColors(item));
    return Array.from(new Set(colors)).sort();
  }, [list]);

  // Update distinct variants_age to combine age and ageUnit.
  const globalDistinctVariantsAge = useMemo(() => {
    const ages = list.flatMap(item =>
      (item.variants || []).map(v => v.age ? `${v.age} ${v.ageUnit || ""}`.trim() : "").filter(Boolean)
    );
    return Array.from(new Set(ages)).sort();
  }, [list]);

  // For variants_size, we simply use the size value.
  const globalDistinctVariantsSize = useMemo(() => {
    const sizes = list.flatMap(item =>
      (item.variants || []).map(v => v.size).filter(Boolean)
    );
    return Array.from(new Set(sizes)).sort();
  }, [list]);

  // === Filtering Functions ===
  const filterListForAvailable = (item) => {
    if (searchTerm && item[searchField]?.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) === -1)
      return false;
    if (availableFilter.name.length && !availableFilter.name.includes(item.name))
      return false;
    if (availableFilter.category.length && !availableFilter.category.includes(item.category))
      return false;
    if (availableFilter.subCategory.length && !availableFilter.subCategory.includes(item.subCategory || "-"))
      return false;
    const colors = computeColors(item);
    if (availableFilter.color.length && !colors.some(c => availableFilter.color.includes(c)))
      return false;
    if (availableFilter.variants_age.length) {
      // Combine age and unit for each variant.
      const ageLabels = item.variants ? item.variants.map(v => v.age ? `${v.age} ${v.ageUnit || ""}`.trim() : "-") : [];
      if (!ageLabels.some(val => availableFilter.variants_age.includes(val)))
        return false;
    }
    if (availableFilter.variants_size.length) {
      const sizeLabels = item.variants ? item.variants.map(v => v.size || "-") : [];
      if (!sizeLabels.some(val => availableFilter.variants_size.includes(val)))
        return false;
    }
    return true;
  };

  const filterListForOut = (item) => {
    if (searchTerm && item[searchField]?.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) === -1)
      return false;
    if (outFilter.name.length && !outFilter.name.includes(item.name))
      return false;
    if (outFilter.category.length && !outFilter.category.includes(item.category))
      return false;
    if (outFilter.subCategory.length && !outFilter.subCategory.includes(item.subCategory || "-"))
      return false;
    const colors = computeColors(item);
    if (outFilter.color.length && !colors.some(c => outFilter.color.includes(c)))
      return false;
    if (outFilter.variants_age.length) {
      const ageLabels = item.variants ? item.variants.map(v => v.age ? `${v.age} ${v.ageUnit || ""}`.trim() : "-") : [];
      if (!ageLabels.some(val => outFilter.variants_age.includes(val)))
        return false;
    }
    if (outFilter.variants_size.length) {
      const sizeLabels = item.variants ? item.variants.map(v => v.size || "-") : [];
      if (!sizeLabels.some(val => outFilter.variants_size.includes(val)))
        return false;
    }
    return true;
  };

  const availableList = list.filter(item => filterListForAvailable(item) && computeCount(item) > 0);
  const outOfStockList = list.filter(item => filterListForOut(item) && computeCount(item) === 0);

  useEffect(() => {
    fetchList();
  }, []);

  const isAvailableActive = Object.values(availableFilter).some(arr => arr.length > 0);
  const isOutActive = Object.values(outFilter).some(arr => arr.length > 0);

  return (
    <section className="p-3">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <p className="mb-4 md:mb-0 text-3xl font-bold">ALL PRODUCTS LIST</p>
        <EnhancedSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchField={searchField}
          setSearchField={setSearchField}
        />
      </div>

      {/* Available Products */}
      <div>
        <h3 className="text-xl font-semibold mb-3">AVAILABLE PRODUCTS</h3>
        <div className="overflow-x-auto">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-600 text-white text-sm min-w-[1000px] rounded-sm">
            <span>Image</span>
            <span>NAME</span>
            <span>CATEGORY</span>
            <span>SUB CATEGORY</span>
            <span className="text-center">COLOR</span>
            <span>PRICE</span>
            <span>DISCOUNTED PRICE</span>
            <span className="text-center">AGE</span>
            <span>SIZE</span>
            <span>COUNT</span>
            <span className="text-center">ACTION</span>
          </div>
          {/* Filter Row: Each cell corresponds to the header column */}
          <div
            ref={availableFilterContainerRef}
            className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-2 px-4 bg-gray-100 text-gray-800 text-xs min-w-[1000px]"
          >
            {/* Column 1: Image (no filter) */}
            <div></div>
            {/* Column 2: Name Filter */}
            <div className="relative">
              <button
                type="button"
                style={{ height: '32px' }}
                onClick={() => toggleAvailableFilter('name')}
                className="border p-1 bg-white w-full text-left rounded-md shadow-sm"
              >
                {availableFilter.name.length ? availableFilter.name.join(', ') : 'NAME'}
              </button>
              {availableOpenFilter.name && (
                <div className="absolute z-20 bg-white border rounded-md shadow-lg mt-1 p-1 max-h-40 overflow-y-auto w-full">
                  {globalDistinctNames.map((option, idx) => (
                    <label key={idx} className="block py-1">
                      <input
                        type="checkbox"
                        value={option}
                        checked={availableFilter.name.includes(option)}
                        onChange={(e) => handleAvailableFilterChange('name', option, e.target.checked)}
                      /> {option.toUpperCase()}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Column 3: Category Filter */}
            <div className="relative">
              <button
                type="button"
                style={{ height: '32px' }}
                onClick={() => toggleAvailableFilter('category')}
                className="border p-1 bg-white w-full text-left rounded-md shadow-sm"
              >
                {availableFilter.category.length ? availableFilter.category.join(', ') : 'CATEGORY'}
              </button>
              {availableOpenFilter.category && (
                <div className="absolute z-20 bg-white border rounded-md shadow-lg mt-1 p-1 max-h-40 overflow-y-auto w-full">
                  {globalDistinctCategories.map((option, idx) => (
                    <label key={idx} className="block py-1">
                      <input
                        type="checkbox"
                        value={option}
                        checked={availableFilter.category.includes(option)}
                        onChange={(e) => handleAvailableFilterChange('category', option, e.target.checked)}
                      /> {option.toUpperCase()}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Column 4: Sub Category Filter */}
            <div className="relative">
              <button
                type="button"
                style={{ height: '32px' }}
                onClick={() => toggleAvailableFilter('subCategory')}
                className="border p-1 bg-white w-full text-left rounded-md shadow-sm"
              >
                {availableFilter.subCategory.length ? availableFilter.subCategory.join(', ') : 'SUB '}
              </button>
              {availableOpenFilter.subCategory && (
                <div className="absolute z-20 bg-white border rounded-md shadow-lg mt-1 p-1 max-h-40 overflow-y-auto w-full">
                  {globalDistinctSubCategories.map((option, idx) => (
                    <label key={idx} className="block py-1">
                      <input
                        type="checkbox"
                        value={option}
                        checked={availableFilter.subCategory.includes(option)}
                        onChange={(e) => handleAvailableFilterChange('subCategory', option, e.target.checked)}
                      /> {option.toUpperCase()}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Column 5: Color Filter */}
            <div className="relative">
              <button
                type="button"
                style={{ height: '32px' }}
                onClick={() => toggleAvailableFilter('color')}
                className="border p-1 bg-white w-full text-left rounded-md shadow-sm"
              >
                {availableFilter.color.length ? availableFilter.color.join(', ') : 'COLOR'}
              </button>
              {availableOpenFilter.color && (
                <div className="absolute z-20 bg-white border rounded-md shadow-lg mt-1 p-1 max-h-40 overflow-y-auto w-full">
                  {globalDistinctColors.map((option, idx) => (
                    <label key={idx} className="block py-1">
                      <input
                        type="checkbox"
                        value={option}
                        checked={availableFilter.color.includes(option)}
                        onChange={(e) => handleAvailableFilterChange('color', option, e.target.checked)}
                      /> {option.toUpperCase()}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Column 6: Price (no filter) */}
            <div></div>
            {/* Column 7: Discounted Price (no filter) */}
            <div></div>
            {/* Column 8: Age Filter */}
            <div className="relative">
              <button
                type="button"
                style={{ height: '32px' }}
                onClick={() => toggleAvailableFilter('variants_age')}
                className="border p-1 bg-white w-full text-left rounded-md shadow-sm"
              >
                {availableFilter.variants_age.length ? availableFilter.variants_age.join(', ') : 'AGE'}
              </button>
              {availableOpenFilter.variants_age && (
                <div className="absolute z-20 bg-white border rounded-md shadow-lg mt-1 p-1 max-h-40 overflow-y-auto w-full">
                  {globalDistinctVariantsAge.map((option, idx) => (
                    <label key={idx} className="block py-1">
                      <input
                        type="checkbox"
                        value={option}
                        checked={availableFilter.variants_age.includes(option)}
                        onChange={(e) => handleAvailableFilterChange('variants_age', option, e.target.checked)}
                      /> {option.toUpperCase()}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Column 9: Size Filter */}
            <div className="relative">
              <button
                type="button"
                style={{ height: '32px' }}
                onClick={() => toggleAvailableFilter('variants_size')}
                className="border p-1 bg-white w-full text-left rounded-md shadow-sm"
              >
                {availableFilter.variants_size.length ? availableFilter.variants_size.join(', ') : 'SIZE'}
              </button>
              {availableOpenFilter.variants_size && (
                <div className="absolute z-20 bg-white border rounded-md shadow-lg mt-1 p-1 max-h-40 overflow-y-auto w-full">
                  {globalDistinctVariantsSize.map((option, idx) => (
                    <label key={idx} className="block py-1">
                      <input
                        type="checkbox"
                        value={option}
                        checked={availableFilter.variants_size.includes(option)}
                        onChange={(e) => handleAvailableFilterChange('variants_size', option, e.target.checked)}
                      /> {option.toUpperCase()}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Column 10: Count (no filter) */}
            <div></div>
            {/* Column 11: Action: Reset Button */}
            <div className="flex justify-center">
              <button
                type="button"
                style={{ height: '32px' }}
                onClick={resetAvailableFilters}
                className={`border px-3 py-1 rounded-md transition ${
                  isAvailableActive
                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                    : 'bg-white text-gray-800 border-gray-500 hover:bg-gray-200'
                }`}
              >
                RESET
              </button>
            </div>
          </div>
          {/* Available Products Rows */}
          {availableList.length > 0 ? (
            availableList.map((item, index) => (
              <div key={item._id || index} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-3 px-4 border-b hover:bg-gray-50 min-w-[1000px]">
                <img
                  src={Array.isArray(item.image) ? item.image[0] : item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span className="text-gray-800 font-medium">{item.name.toUpperCase()}</span>
                <span className="text-gray-700">{item.category.toUpperCase()}</span>
                <span className="text-gray-700 text-center">{(item.subCategory || '-').toUpperCase()}</span>
                <span className="text-gray-700 text-center">{computeColors(item).length ? computeColors(item).join(", ") : '-'}</span>
                <span className="text-gray-800 font-semibold">{currency}{item.price}</span>
                <span className="text-gray-800 font-semibold">
                  {typeof item.discountedPrice === "number" ? `${currency}${item.discountedPrice}` : '-'}
                </span>
                <span className="text-center text-gray-700">
                  {item.variants && item.variants.filter(v => v.age).length > 0
                    ? item.variants.filter(v => v.age).map(v => `${v.age} ${v.ageUnit} (${v.quantity})`).join(', ')
                    : '-'}
                </span>
                <span className="text-gray-700">
                  {item.variants && item.variants.filter(v => v.size).length > 0
                    ? item.variants.filter(v => v.size).map(v => `${v.size} (${v.quantity})`).join(', ')
                    : '-'}
                </span>
                <span className="text-gray-700">{computeCount(item)}</span>
                <div className="flex justify-center items-center gap-3">
                  <div
                    onClick={() => openEditModal(item)}
                    className="cursor-pointer text-black hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-sm"
                  >
                    <FaEdit size={16} />
                  </div>
                  <div
                    onClick={() => setProductToDelete(item)}
                    className="cursor-pointer text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-sm"
                  >
                    <FaTrash size={16} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-gray-600">No available products found.</p>
          )}
        </div>
      </div>

      {/* Out of Stock Products */}
      {outOfStockList.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-black mb-3">OUT OF STOCK PRODUCTS</h3>
          <div className="overflow-x-auto">
            {/* Header Row for Out of Stock */}
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-600 text-white text-sm min-w-[1000px] rounded-sm">
              <span>Image</span>
              <span>NAME</span>
              <span>CATEGORY</span>
              <span>SUB CATEGORY</span>
              <span className="text-center">COLOR</span>
              <span>PRICE</span>
              <span>DISCOUNTED PRICE</span>
              <span className="text-center">AGE</span>
              <span>SIZE</span>
              <span>COUNT</span>
              <span className="text-center">ACTION</span>
            </div>
            {/* Filter Row for Out of Stock */}
            <div
              ref={outFilterContainerRef}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-2 px-4 bg-gray-100 text-gray-800 text-xs min-w-[1000px]"
            >
              <div></div>
              {/* Out-of-stock filters can be similar – here we'll just add Name filter for brevity */}
              <div className="relative">
                <button
                  type="button"
                  style={{ height: '32px' }}
                  onClick={() => toggleOutFilter('name')}
                  className="border p-1 bg-white w-full text-left rounded-md shadow-sm"
                >
                  {outFilter.name.length ? outFilter.name.join(', ') : 'NAME'}
                </button>
                {outOpenFilter.name && (
                  <div className="absolute z-20 bg-white border rounded-md shadow-lg mt-1 p-1 max-h-40 overflow-y-auto w-full">
                    {globalDistinctNames.map((option, idx) => (
                      <label key={idx} className="block py-1">
                        <input
                          type="checkbox"
                          value={option}
                          checked={outFilter.name.includes(option)}
                          onChange={(e) => handleOutFilterChange('name', option, e.target.checked)}
                        /> {option.toUpperCase()}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  style={{ height: '32px' }}
                  onClick={resetOutFilters}
                  className={`border px-3 py-1 rounded-md transition ${
                    isOutActive
                      ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                      : 'bg-white text-gray-800 border-gray-500 hover:bg-gray-200'
                  }`}
                >
                  RESET
                </button>
              </div>
            </div>
            {/* Out of Stock Products Rows */}
            {outOfStockList.length > 0 ? (
              outOfStockList.map((item, index) => (
                <div key={item._id || index} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-3 px-4 border-b hover:bg-gray-50 min-w-[1000px]">
                  <img
                    src={Array.isArray(item.image) ? item.image[0] : item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="text-gray-800 font-medium">{item.name.toUpperCase()}</span>
                  <span className="text-gray-700">{item.category.toUpperCase()}</span>
                  <span className="text-gray-700 text-center">{(item.subCategory || '-').toUpperCase()}</span>
                  <span className="text-gray-700 text-center">{computeColors(item).length ? computeColors(item).join(", ") : '-'}</span>
                  <span className="text-gray-800 font-semibold">{currency}{item.price}</span>
                  <span className="text-gray-800 font-semibold">
                    {typeof item.discountedPrice === "number" ? `${currency}${item.discountedPrice}` : '-'}
                  </span>
                  <span className="text-center text-gray-700">
                    {item.variants && item.variants.filter(v => v.age).length > 0
                      ? item.variants.filter(v => v.age).map(v => `${v.age} ${v.ageUnit} (${v.quantity})`).join(', ')
                      : '-'}
                  </span>
                  <span className="text-gray-700">
                    {item.variants && item.variants.filter(v => v.size).length > 0
                      ? item.variants.filter(v => v.size).map(v => `${v.size} (${v.quantity})`).join(', ')
                      : '-'}
                  </span>
                  <span className="text-gray-700">{computeCount(item)}</span>
                  <div className="flex justify-center items-center gap-3">
                    <div
                      onClick={() => openEditModal(item)}
                      className="cursor-pointer text-black hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                      <FaEdit size={16} />
                    </div>
                    <div
                      onClick={() => setProductToDelete(item)}
                      className="cursor-pointer text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                      <FaTrash size={16} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-600">No out of stock products found.</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-auto pt-4 md:pt-2">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={updateProduct} className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-xl font-medium mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, name: e.target.value })
                  }
                  placeholder="Enter brand name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>
              {/* Product Description */}
              <div>
                <label className="block text-xl font-medium mb-2">
                  Product Description
                </label>
                <textarea
                  value={selectedProduct.description}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, description: e.target.value })
                  }
                  placeholder="Enter product description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>
              {/* Price, Discounted Price, Combo, and Count */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xl font-medium mb-2">
                    Product Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) || 0 })
                    }
                    placeholder="e.g., 25"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                </div>
                <div>
                  <label className="block text-xl font-medium mb-2">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    value={selectedProduct.discountedPrice || ""}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, discountedPrice: Number(e.target.value) || 0 })
                    }
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                </div>
                <div>
                  <label className="block text-xl font-medium mb-2">
                    Combo
                  </label>
                  <input
                    type="number"
                    value={selectedProduct.combo}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, combo: Number(e.target.value) || 1 })
                    }
                    placeholder="Combo factor"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                </div>
                <div>
                  <label className="block text-xl font-medium mb-2">
                    Product Count
                  </label>
                  <input
                    type="number"
                    value={computeCount(selectedProduct)}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none"
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
                    value={selectedProduct.category}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, category: e.target.value })
                    }
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
                    value={selectedProduct.subCategory}
                    onChange={handleEditSubCategoryChange}
                    onFocus={() => {
                      setShowSubCategorySuggestions(true);
                      setFilteredSubCategories(subCategorySuggestions);
                    }}
                    onBlur={() =>
                      setTimeout(() => setShowSubCategorySuggestions(false), 150)
                    }
                    placeholder="Enter subcategory"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                  {showSubCategorySuggestions && filteredSubCategories.length > 0 && (
                    <div className="absolute top-full left-0 right-0 border border-gray-300 bg-white z-10 max-h-40 overflow-auto rounded-md">
                      {filteredSubCategories.map((s, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onMouseDown={() => handleEditSubCategoryClick(s)}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div></div>
              </div>

              {/* Unified Variant Section */}
              <div className="p-4 border border-gray-300 rounded-lg shadow-sm space-y-4">
                <h3 className="text-xl font-semibold mb-4">Product Variants</h3>
                {/* Existing Variants */}
                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProduct.variants.map((variant, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedProduct({
                            ...selectedProduct,
                            variants: selectedProduct.variants.filter((_, i) => i !== idx)
                          });
                        }}
                        className="flex items-center gap-1 bg-gray-600 text-white px-2 py-1 rounded cursor-pointer"
                        title="Click to remove"
                      >
                        {variant.size && <span>{variant.size}</span>}
                        {variant.age && <span>{variant.age} {variant.ageUnit}</span>}
                        <span>({variant.quantity})</span>
                        <span>[{variant.color}]</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* New Variant Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-lg font-medium mb-1">Size (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., X, M, L"
                      value={selectedProduct.newVariantSize || ""}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, newVariantSize: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium mb-1">Age (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., 3 or 3-4"
                      value={selectedProduct.newVariantAge || ""}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, newVariantAge: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  {selectedProduct.newVariantAge && (
                    <div>
                      <label className="block text-lg font-medium mb-1">Age Unit</label>
                      <select
                        value={selectedProduct.newVariantAgeUnit || "Years"}
                        onChange={(e) =>
                          setSelectedProduct({ ...selectedProduct, newVariantAgeUnit: e.target.value })
                        }
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
                      value={selectedProduct.newVariantQuantity || ""}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, newVariantQuantity: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium mb-1">Color</label>
                    <input
                      type="text"
                      placeholder="Enter color"
                      value={selectedProduct.newVariantColor || ""}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, newVariantColor: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const size = selectedProduct.newVariantSize?.trim();
                    const age = selectedProduct.newVariantAge?.trim();
                    const ageUnit = selectedProduct.newVariantAge ? selectedProduct.newVariantAgeUnit : null;
                    const quantity = Number(selectedProduct.newVariantQuantity);
                    const color = selectedProduct.newVariantColor?.trim();
                    if (!size && !age) {
                      toast.error("Please enter at least a size or an age.");
                      return;
                    }
                    if (!quantity || isNaN(quantity) || !color) {
                      toast.error("Please enter a valid quantity and color.");
                      return;
                    }
                    const newVariant = { size: size || null, age: age || null, ageUnit, quantity, color };
                    setSelectedProduct({
                      ...selectedProduct,
                      variants: [...(selectedProduct.variants || []), newVariant],
                      newVariantSize: "",
                      newVariantAge: "",
                      newVariantAgeUnit: "Years",
                      newVariantQuantity: "",
                      newVariantColor: ""
                    });
                  }}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800"
                >
                  Add Variant
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm mx-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Confirm Delete</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to remove this product?</p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default List;
