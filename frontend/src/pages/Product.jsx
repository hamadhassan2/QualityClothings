import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProduct from "../components/RelatedProduct";
import { toast } from "react-toastify";
import { MutatingDots } from "react-loader-spinner";
import { backendUrl } from "../App"; 
const Product = () => {
  const { productId } = useParams();
  const { products, cartItems, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [availableAges, setAvailableAges] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [productImages, setProductImages] = useState([]); // Add this line
  // Scroll to top and show loader when the component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Show loader animation for 1.5 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
      const fetchProductData = () => {
          const product = products.find((item) => item._id === productId);
          if (!product) return;
    
          setProductData(product);
    
          // Build absolute URLs for every image on your VPS
         const raw = Array.isArray(product.image)
            ? product.image
            : [product.image];
         const images = raw.map(src =>
            // if it’s already an HTTP URL, leave it; otherwise prefix with backendUrl
            src.startsWith("http") ? src : `${backendUrl}${src}`
          );
    
        setProductImages(images);
         if (images.length) setMainImage(images[0]);
        };
    fetchProductData();
  }, [productId, products]);

  useEffect(() => {
    if (productData && !mainImage) {
      setMainImage(
        Array.isArray(productData.image)
          ? productData.image[0]
          : productData.image
      );
    }
  }, [productData, mainImage]);
  useEffect(() => {
    setAnimate(true);
  }, []);

  const sizes =
    productData && productData.variants
      ? Array.from(new Set(productData.variants.map((v) => v.size))).filter(
          Boolean
        )
      : [];

  useEffect(() => {
    if (!productData) return;
    if (selectedSize) {
      const filteredVariants = productData.variants.filter(
        (v) => v.size === selectedSize
      );
      const ages = Array.from(
        new Set(
          filteredVariants
            .map((v) =>
              v.age !== undefined && v.ageUnit ? `${v.age} ${v.ageUnit}` : null
            )
            .filter(Boolean)
        )
      );
      const colors = Array.from(
        new Set(filteredVariants.map((v) => v.color).filter(Boolean))
      );
      setAvailableAges(ages);
      setAvailableColors(colors);
      if (ages.length === 0) setSelectedAge("");
      setSelectedColor("");
    } else {
      const allVariants = productData.variants;
      const ages = Array.from(
        new Set(
          allVariants
            .map((v) =>
              v.age !== undefined && v.ageUnit ? `${v.age} ${v.ageUnit}` : null
            )
            .filter(Boolean)
        )
      );
      let colors;
      if (selectedAge) {
        colors = Array.from(
          new Set(
            allVariants
              .filter((v) =>
                v.age !== undefined && v.ageUnit
                  ? `${v.age} ${v.ageUnit}` === selectedAge
                  : false
              )
              .map((v) => v.color)
              .filter(Boolean)
          )
        );
      } else {
        colors = Array.from(
          new Set(allVariants.map((v) => v.color).filter(Boolean))
        );
      }
      setAvailableAges(ages);
      setAvailableColors(colors);
      setSelectedColor("");
    }
  }, [selectedSize, selectedAge, productData]);

  if (!productData)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );

  const handleAddToCart = () => {
    if (
      (sizes.length > 0 || availableAges.length > 0) &&
      !selectedSize &&
      !selectedAge
    ) {
      toast.error("Please select at least a size or an age.");
      return;
    }
    // If only one color is available and the user hasn't selected any, set that color by default.
    let finalSelectedColor = selectedColor;
    if (availableColors.length === 1 && !selectedColor) {
      finalSelectedColor = availableColors[0];
    }
    // If there are multiple colors and none is selected, prompt the user.
    if (availableColors.length > 1 && !finalSelectedColor) {
      toast.error("Please select a color.");
      return;
    }
    const matchingVariant = productData.variants.find((v) => {
      const sizeMatch = selectedSize ? v.size === selectedSize : true;
      const ageMatch = selectedAge
        ? `${v.age} ${v.ageUnit}` === selectedAge
        : true;
      const colorMatch = finalSelectedColor
        ? v.color === finalSelectedColor
        : true;
      return sizeMatch && ageMatch && colorMatch;
    });
    if (!matchingVariant) {
      toast.error("The selected variant is not available.");
      return;
    }
    const currentQty =
      (cartItems[productData._id] &&
        cartItems[productData._id][matchingVariant._id]) ||
      0;
    if (currentQty + 1 > Number(matchingVariant.quantity)) {
      toast.error(
        ` Only ${matchingVariant.quantity} available.`
      );
      return;
    }
    addToCart(productData._id, matchingVariant);
  };

  return (
    <div className="border-t pt-10 relative">
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
      <div
        className={`max-w-7xl mx-auto px-4 transition-opacity duration-700 ${
          animate ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1 flex flex-col-reverse md:flex-row">
            {/* Thumbnail Container */}
            <div className="flex flex-wrap md:flex-col md:overflow-y-auto md:w-1/5 w-full border-r pr-2 gap-2">
              {productImages.map((item, index) => (
                <img
                  key={index}
                  src={item}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setMainImage(item)}
                  className={`w-1/5 md:w-full h-20 object-cover cursor-pointer border rounded transition duration-200 ${
                    mainImage === item ? "border-gray-800" : "border-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Main Image Container */}
            <div className="w-full md:w-4/5">
              <img
                src={mainImage}
                alt="Product"
                className="w-full h-auto max-h-[500px] object-contain rounded shadow-lg"
              />
            </div>
          </div>
          <div className="flex-1 space-y-6 text-left">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {productData.name}
              </h1>
              {productData.subCategory && (
                <p className="mt-1 text-lg text-gray-600">
                  {productData.subCategory}
                </p>
              )}
            </div>
            <div className="flex items-center justify-start gap-2">
              {productData.discountedPrice ? (
                <>
                  <p className="text-2xl md:text-3xl font-semibold text-red-600">
                    ₹{productData.discountedPrice}
                  </p>
                  <p className="text-lg md:text-xl text-gray-500 line-through">
                    ₹{productData.price}
                  </p>
                </>
              ) : (
                <p className="text-2xl md:text-3xl font-semibold text-gray-800">
                  ₹{productData.price}
                </p>
              )}
            </div>
            {sizes.length > 0 && (
              <div>
                <p className="text-lg font-medium mb-2">Select Size</p>
                <div className="flex gap-2 flex-wrap justify-start">
                  {sizes.map((size, index) => {
                    const isAvailable = productData.variants.some(
                      (v) => v.size === size && v.quantity > 0
                    );
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isAvailable) {
                            toast.error(
                              `Size ${size} is currently unavailable`
                            );
                            return;
                          }
                          setSelectedSize(size);
                        }}
                        className={`border py-2 px-4 rounded transition duration-200 font-medium relative ${
                          size === selectedSize
                            ? "bg-gray-800 text-white border-gray-800"
                            : !isAvailable
                            ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                            : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
                        }`}
                        disabled={!isAvailable}
                      >
                        {size}
                        {!isAvailable && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl text-red-500">✕</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedSize ? (
              <>
                {availableAges.length > 0 && (
                  <div>
                    <p className="text-lg font-medium mb-2">Select Age</p>
                    <div className="flex gap-2 flex-wrap justify-start">
                      {availableAges.map((ageLabel, index) => {
                        const isAvailable = productData.variants.some(
                          (v) =>
                            `${v.age} ${v.ageUnit}` === ageLabel &&
                            v.quantity > 0
                        );
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              if (!isAvailable) {
                                toast.error(
                                  `Age ${ageLabel} is currently unavailable`
                                );
                                return;
                              }
                              setSelectedAge(ageLabel);
                            }}
                            className={`border py-2 px-4 rounded transition duration-200 font-medium relative ${
                              ageLabel === selectedAge
                                ? "bg-gray-800 text-white border-gray-800"
                                : !isAvailable
                                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                                : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
                            }`}
                            disabled={!isAvailable}
                          >
                            {ageLabel}
                            {!isAvailable && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl text-red-500">✕</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {availableColors.length > 0 && (
                  <div>
                    <p className="text-lg font-medium mb-2">Select Color</p>
                    <div className="flex gap-2 flex-wrap justify-start">
                      {availableColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-8 h-8 rounded-full border transition duration-200 ${
                            selectedColor === color
                              ? "border-gray-800"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedColor && (
                      <p className="mt-2 text-left text-gray-700">
                        Selected Color:{" "}
                        <span className="font-medium">{selectedColor}</span>
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {availableAges.length > 0 && (
                  <div>
                    <p className="text-lg font-medium mb-2">Select Age</p>
                    <div className="flex gap-2 flex-wrap justify-start">
                      {availableAges.map((ageLabel, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAge(ageLabel)}
                          disabled={
                            productData.variants.filter(
                              (v) =>
                                `${v.age} ${v.ageUnit}` === ageLabel &&
                                v.quantity > 0
                            ).length === 0
                          }
                          className={`border py-2 px-4 rounded transition duration-200 font-medium ${
                            ageLabel === selectedAge
                              ? "bg-gray-800 text-white border-gray-800"
                              : productData.variants.filter(
                                  (v) =>
                                    `${v.age} ${v.ageUnit}` === ageLabel &&
                                    v.quantity > 0
                                ).length === 0
                              ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                              : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
                          }`}
                        >
                          {ageLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {availableColors.length > 0 && (
                  <div>
                    <p className="text-lg font-medium mb-2">Select Color</p>
                    <div className="flex gap-2 flex-wrap justify-start">
                      {availableColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-8 h-8 rounded-full border transition duration-200 ${
                            selectedColor === color
                              ? "border-gray-800"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedColor && (
                      <p className="mt-2 text-left text-gray-700">
                        Selected Color:{" "}
                        <span className="font-medium">{selectedColor}</span>
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-800 text-white py-3 rounded text-lg font-medium transition duration-200 hover:bg-gray-700 hover:shadow-lg"
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
      {productData.description && (
        <div className="mt-10 w-full bg-white py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Product Description
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {productData.description}
            </p>
          </div>
        </div>
      )}
      <RelatedProduct
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;
