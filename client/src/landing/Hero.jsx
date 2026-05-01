import React from 'react'
import HeroBgImg from "./assets/864cbf68-c5b1-4c2b-857e-9e9f4f3b57d5.png"
import HeroImg from "./assets/heroimg.png"

const Hero = () => {
    return (
        <section className='w-full min-h-[500px] lg:h-screen relative overflow-hidden text-white'>

            {/* TEXT */}
            <div className='
                absolute z-10 
                top-1/2 left-1/2 
                -translate-x-1/2 -translate-y-1/2 
                w-full flex justify-center
                pointer-events-none
            '>
                <h1 className='
                    cyber 
                    text-[16vw] 
                    sm:text-[14vw] 
                    md:text-[10vw] 
                    lg:text-[15vw] 
                    tracking-widest 
                    text-white/90
                    text-center
                '>
                    Beacon
                </h1>
            </div>

            {/* BG IMAGE */}
            <div className='absolute inset-0 z-0'>
                <img src={HeroBgImg} className='w-full h-full object-cover' alt="" />
            </div>

            {/* HERO IMAGE */}
            <div className='absolute inset-0 z-20'>
                <img 
                    src={HeroImg} 
                    className='
                        w-full 
                        md:max-w-[50%] 
                        lg:max-w-[60%] 
                        object-contain 
                        absolute 
                        left-1/2 
                        -translate-x-1/2 
                        bottom-0
                    ' 
                    alt="" 
                />
            </div>

        </section>
    )
}

export default Hero