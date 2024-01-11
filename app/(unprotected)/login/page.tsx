import Image from "next/image";
import React from "react";
import LoginCard from "./components/LoginCard";

export default function page() {
  return (
    // <div className="w-full h-[100%] bg-black">
    //   <iframe
    //     className="w-[100vw] h-[100vh]"
    //     src={
    //       "https://ap-southeast-1.quicksight.aws.amazon.com/embed/15a30f727fe349ceaf9c1e1d9e023692/dashboards/faf09cdb-0599-4c1d-a36c-8ba71934c3ae?isauthcode=true&identityprovider=quicksight&code=AYABeMcWgo5yq2S7OtkW4lB74T0AAAABAAdhd3Mta21zAFBhcm46YXdzOmttczphcC1zb3V0aGVhc3QtMTo5Nzc1ODQzODI4MTY6a2V5LzM1YTcwZDUzLTc3ZDAtNDA3MC05YTg1LWE4Yzg1ZjQwMzY2YQC4AQIBAHhDqgt7TFd8z372DH2I7seJ1IWSmXR2mGwc7gJKuVmIYwFWM_aPVELYLdf7wGjTeeGcAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMgOlK4OUwiCD7AacAAgEQgDvJHY3-3jPjw4b0lB14vaq7vDB-W_-2Sw_991yKI0UrAIBPomhyiQl5OLt5bsf89mwxr1JXtdllqIhijgIAAAAADAAAEAAAAAAAAAAAAAAAAAADy6k_50Z_IYy5xsX4smQt_____wAAAAEAAAAAAAAAAAAAAAEAAACe9SgjRWjrXoiZ78rfUgrjo6kQl2R341000IylY9OrGiMrri3GfCn4gO0hdscO7-irPl0n631g6tC2W_Tznt2oLSlhbmsciYtixuZ3QXxwlwcW74X5KIte1T_ycQ1T9EVBUOlY-oEny1E94FBGQu-RTbmaAu2wEKBqdhS5_THO2IVl_0vHLzuet0HVOXM1FOQpJZSXbzaRgTp3UoPZrK2Zfh_IzNtDnfSEjHpe-j1N"
    //     }
    //   ></iframe>
    // </div>
    <section className="h-screen w-full flex items-center justify-center">
      <div className="relative w-[350px] h-[425px] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 border rounded-lg">
        <Image
          width={200}
          height={20}
          src="/images/Company_Logo.png"
          alt=""
          className="absolute -top-[35px] bg-white"
        />

        <LoginCard />
      </div>
    </section>
  );
}
