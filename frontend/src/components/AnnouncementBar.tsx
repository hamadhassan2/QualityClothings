import React from "react";

const AnnouncementBar = () => {
  /* ✨  the message you want to repeat  */
  const text = "🚚  FREE SHIPPING ON ORDERS ₹1000 & ABOVE   •  SHOP NOW  •  HURRY!";
  /* duplicate the string so it fills >100 % width (smooth loop) */
  const doubled = `${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}
  ${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}${text}`;

  return (
    <>
      {/* floating bar */}
      <div
        className="
          fixed top-0 left-0 w-full z-50
          bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500
          text-white font-semibold tracking-wide
          shadow-md select-none overflow-hidden
        "
        style={{ height: "42px" }}            /* keeps height consistent */
      >
        <div className="whitespace-nowrap ticker-animate leading-[42px] ml-16 mr-16">
          {doubled}
        </div>
      </div>

      {/* push the rest of the page down the same height */}
      <div style={{ height: "42px" }} />
    </>
  );
};

export default AnnouncementBar;
