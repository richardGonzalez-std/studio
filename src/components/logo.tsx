// Importamos el componente 'Image' de Next.js para optimizar la carga de imágenes.
import Image from "next/image";

// Este componente representa el logo de la aplicación.
export function Logo() {
  // La función devuelve el JSX (la estructura HTML) del logo.
  return (
    // 'div' es el contenedor principal del logo.
    <div className="flex items-center justify-center p-2">
      {/* 
        Usamos el componente Image para mostrar el logo.
        - src: La ruta a la imagen del logo. Apunta a una URL externa.
        - width y height: Las dimensiones de la imagen.
        - alt: Texto alternativo que describe la imagen para accesibilidad.
      */}
      <Image 
        src="https://www.dsf.cr/assets/img/demo/logo.png" 
        width={120} 
        height={32} 
        alt="Logo de Fundación Derecho Sin Fronteras"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
