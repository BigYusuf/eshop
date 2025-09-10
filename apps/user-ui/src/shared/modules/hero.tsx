"use client";

import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const HeroSection = () => {
  const router = useRouter();
  return (
    <div className="bg-[#115061] flex h-[85vh] w-full flex-col justify-center">
      <div className="md:flex justify-between m-auto w-[90%] md:w-[80%] h-full items-center">
        <div className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from 40$
          </p>
          <h1 className="text-white text-6xl font-extrabold font-Roboto">
            The best watch <br />
            Collection 2025
          </h1>
          <p className="text-3xl font-Oregano text-white pt-4">
            Exclusive offer <span className="text-yellow-400">10%</span> this
            week
          </p>
          <br />
          <button
            onClick={() => router.push("/products")}
            className="gap-2 w-[140px] h-[40px] font-semibold rounded-md transition cursor-pointer bg-white hover:bg-black hover:text-white"
          >
            Shop Now <MoveRight className="inline-block" />
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="https://ik.imagekit.io/fz0xzwtey/products/slider-img-1.png"
            // src={"https://res.cloudinary.com/dzcmadjl1/image/upload/v1700346823/pexels-pixabay-190819_ozgk7m.png"}
            width={450}
            height={450}
            alt=""
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
