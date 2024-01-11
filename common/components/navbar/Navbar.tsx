"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FiUsers } from "react-icons/fi";

const Navbar = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [nav, setNav] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };
  const handleNavRequest = async (url: string) => {
    try {
      const response = await fetch(url);
      if (response.status === 302) {
        return router.push("/login");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const logos = [
    { name: "Taxieco", src: "/images/Company_Logo.png", className: "pt-2" },
    {
      name: "Trinity General Insurance",
      src: "/images/insurer_logos/Trinity_Logo.jpeg",
      className: "mx-2",
    },
  ];

  const navItems = [
    {
      name: "Log Out",
      href: "/api/auth/logout",
      icon: <FiUsers size={16} />,
      url: "/api/auth/logout",
    },
  ];

  return (
    <>
      <div className="sticky top-0 flex justify-between items-center h-[80px] mx-auto px-4 border-b font-bold uppercase bg-white text-gray-700">
        {/* Logo */}
        <div className="flex justify-center items-center gap-x-2">
          <Image
            width={150}
            height={20}
            src={logos[0].src}
            alt=""
            className={logos[0].className}
          />
          <span className="text-xs">|</span>
          <Image
            width={150}
            height={20}
            src={logos[1].src}
            alt=""
            className={logos[1].className}
          />
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex">
          {navItems.map((item, key) => (
            <li
              key={key}
              className="p-4 hover:bg-gray-200 rounded-md m-2 cursor-pointer duration-300 hover:text-black"
              onClick={() => {
                handleNavRequest(item.url);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>

        {/* Mobile Navigation Icon */}
        <div onClick={handleNav} className="block md:hidden">
          {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </div>

        {/* Mobile Navigation Menu */}
        <ul
          className={
            nav
              ? "fixed md:hidden left-0 top-[80px] w-[100%] bg-white ease-in-out duration-500"
              : "ease-in-out duration-500 w-full fixed left-0 top-[-100%] h-0 bottom-0"
          }
        >
          {/* Mobile Navigation Items */}
          {navItems.map((item, key) => (
            <li
              key={key}
              className="flex items-center h-[80px] p-4 border-b hover:bg-gray-200 duration-300 hover:text-black cursor-pointer"
              onClick={() => {
                handleNavRequest(item.url);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
      <main className="w-full">{children}</main>
    </>
  );
};

export default Navbar;
