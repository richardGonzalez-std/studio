import Image from "next/image";

export function Logo() {
  return (
    <div className="flex h-16 items-center justify-center p-2">
      <Image
        src="/logopepweb.png"
        alt="Credipep Logo"
        width={227}
        height={225}
        priority
      />
    </div>
  );
}
