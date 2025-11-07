import Image from "next/image";

export function Logo() {
  return (
    <div className="flex h-16 items-center justify-center p-2">
      <Image
        src="https://www.dsf.cr/wp-content/uploads/2021/08/logo-dsf.png"
        alt="DSF Logo"
        width={140}
        height={40}
        priority
      />
    </div>
  );
}
