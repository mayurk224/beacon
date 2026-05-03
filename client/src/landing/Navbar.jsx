import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='w-full flex  justify-between px-6 md:px-10 py-4 items-center'>

        {/* logo */}
        <Link to={'/'}>
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-inset flex items-center justify-center">
                <img src="/logo.webp" className='w-full h-full object-cover mix-blend-difference' alt="logo" />
            </div>
        </Link>

        {/* get started button */}

        <div className="hidden md:flex items-center gap-4">
            <Link to={'/signin'}>
                <button className='btn-primary'>
                    Sign in
                </button>
            </Link>

        <Link to={'/signup'}>
            <button className='px-4 py-1.5 border border-border-muted rounded bg-transparent hover:bg-surface-elevated hover:border-brand hover:text-brand transition-colors text-[13px] font-medium text-primary'>
                Sign up
            </button>
        </Link>
        </div>
    </div>
  )
}

export default Navbar