import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const currency = "₹ ";

const ProductCard = ({
  id,
  img,
  name,
  price,
  discountedPrice,
  count,
  bestseller = false, // make sure this matches your data field
}) => {
  const navigate = useNavigate();

  // Debug: confirm the value of the prop
  console.log("🚩 ProductCard – bestseller flag for", name, "is", bestseller);

  const discountPercent =
    discountedPrice && price
      ? Math.round(((price - discountedPrice) / price) * 100)
      : 0;

  const handleClick = (e) => {
    e.preventDefault();
    if (Number(count) === 0) {
      toast.error("Product is out of stock");
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/product/${id}`);
  };

  return (
    /* ---------- card wrapper ---------- */
    <div
      onClick={handleClick}
      className={`
    relative block
    ${Number(count) === 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
    group                                  /* enables group‑hover effects */
  `}
    >
      {/* ---------- the card ---------- */}
      <div
        className="
      relative bg-white rounded-xl overflow-hidden
      shadow-md transition-all duration-300 ease-out
      group-hover:shadow-xl group-hover:-translate-y-1
    "
      >
        {/* ✨ decorative gradient ring on hover */}
        <span
          className="
        pointer-events-none absolute inset-0 rounded-xl
        ring-0 ring-transparent
        group-hover:ring-4 group-hover:ring-yellow-400/40
        transition-all duration-300
      "
        />

        {/* ---------- image + discount badge ---------- */}
        <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
          {discountPercent > 0 && (
            <div
              className="
          absolute top-2 right-2 z-10
          bg-gradient-to-r from-red-500 to-pink-500
          text-white text-[0.7rem] font-extrabold tracking-wider
          px-2 py-1 rounded-lg shadow-lg
        "
            >
              {discountPercent}% OFF
            </div>
          )}

          {/* subtle zoom on hover */}
        {/* subtle zoom on hover */}
<img
  src={img}
  alt={name}
  className={`
    w-full h-full object-cover object-center
    transition-transform duration-300
    group-hover:scale-105
    ${Number(count) === 0 ? "filter blur-sm" : ""}
  `}
/>

        </div>

        {/* ---------- details ---------- */}
        <div className="p-2 sm:p-4">
          {/* product name – clamp to two lines & color pop on hover */}
          <h2
            className={`
        text-lg font-semibold leading-snug
        line-clamp-2
        ${bestseller ? "text-yellow-800" : "text-gray-800"}
        group-hover:text-amber-600
        transition-colors duration-300
      `}
          >
            {name}
          </h2>

          {/* price row */}
          <div className="mt-2 flex items-center gap-3">
            {discountedPrice ? (
              <>
                <p className="text-sm font-medium text-gray-500 line-through">
                  {currency}
                  {price}
                </p>
                <p className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600">
                  {currency}
                  {discountedPrice}
                </p>
              </>
            ) : (
              <p className="text-base font-semibold text-gray-800">
                {currency}
                {price}
              </p>
            )}
          </div>

          {/* stock + bestseller labels */}
          <div
            className="
          mt-3 flex flex-col items-start gap-2
          sm:flex-row sm:justify-between sm:items-center
        "
          >
            <span
              className={`text-[0.7rem] font-medium border border-current px-2 py-0.5 rounded-full ${
                Number(count) > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {Number(count) > 0 ? "In Stock" : "Out of Stock"}
            </span>

            {bestseller && (
              <span
                className="
              inline-flex items-center gap-1
              text-[0.65rem] font-extrabold uppercase tracking-wider
              bg-gradient-to-r from-yellow-400 to-yellow-600
              text-white
              px-3 py-1 rounded-full shadow-lg
              transform transition duration-200 hover:scale-105
              self-start sm:self-auto
              animate-pulse [animation-duration:2.5s]
            "
              >
                ★ Best Seller
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
