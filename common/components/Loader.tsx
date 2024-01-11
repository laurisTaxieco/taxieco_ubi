import { BarLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <BarLoader color="#ff0000" height={5} width={200} />
    </div>
  );
};

export default Loader;
