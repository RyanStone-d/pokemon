import { CubeIcon } from "@heroicons/react/24/outline";

export default function Logo() {
  return (
    <div className="flex items-center leading-none text-white">
      <CubeIcon className="w-12 h-12" />
      <p className="text-[16px] font-bold">Pokemon</p>
    </div>
  );
}
