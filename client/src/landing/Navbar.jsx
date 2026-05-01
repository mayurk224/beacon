import React from 'react'
import { Link } from 'react-router-dom'
import logo from "./assets/512bba5e8a77bfb262b1e7628dc497c0.png"

const Navbar = () => {
  return (
    <div className='w-full flex justify-between px-6 md:px-10 py-4 items-center'>

        {/* logo */}
        <Link to={'/'}>
            <img src={logo} className='w-10 h-10 object-contain' alt="logo" />
        </Link>

        {/* get started button */}
        <Link to={'/signin'}>
            <button className='
                px-5 py-2 
                text-sm md:text-base 
                font-medium 
                border-b border-b-[#1a1a1a] 
                transition-all duration-300 
                hover:bg-[#1a1a1a] hover:text-white
                rounded-2xl
            '>
                Get Started
            </button>
        </Link>

    </div>
  )
}

export default Navbar