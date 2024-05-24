import { useState } from "react";

export function useSwitch() {
  const [unique, setUnique] = useState<boolean>(false);
  const switchComponent = (
    <div
      className="relative h-[27px] w-[52px] cursor-pointer rounded-full border-[1px] border-gray-500 transition-all duration-300 ease-in-out"
      style={{ background: unique ? "rgb(209 213 219)" : "transparent" }}
      onClick={() => setUnique((unique) => !unique)}
    >
      <button
        className="absolute top-0 m-[1px] h-[23px] w-[23px] rounded-full border-[1px] bg-white transition-all duration-300 ease-in-out"
        style={unique ? { left: "50%" } : { left: "0%" }}
      ></button>
    </div>
  );
  return [switchComponent, unique];
}
