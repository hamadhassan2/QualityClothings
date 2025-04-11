import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ setToken }) => {  // Corrected prop passing
  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <img className='w-[max(10%,80px)]' src={assets.admin_icon} alt="logo" />
        
        <button 
          onClick={() => {
            localStorage.removeItem('token');  // Remove token from localStorage
            setToken('');  // Update state to trigger reactivity
          }} 
          className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-lg text-xs sm:text-sm'
        >
          Logout
        </button>
    </div>
  )
}

export default Navbar
