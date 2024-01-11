"use client";

import Loader from "@/common/components/Loader";
import Navbar from "@/common/components/navbar/Navbar";
import { getDashboardUrl } from "@/common/const";
import { useEffect, useState } from "react";

export default function Home() {
  const [embedUrl, setEmbedUrl] = useState("");

  const getDashboard = async () => {
    try {
      const data = await fetch(getDashboardUrl).then((res) => res.json());
      data.embedUrl && setEmbedUrl(data.embedUrl);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    !embedUrl && getDashboard();
  }, []);
  return (
    <main className="">
      {embedUrl !== "" ? (
        <iframe className="w-[100vw] h-[100vh]" src={embedUrl}></iframe>
      ) : (
        <Loader />
      )}
    </main>
  );
}
