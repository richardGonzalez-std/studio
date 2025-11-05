// Importamos la función 'redirect' de Next.js para redirigir al usuario.
import { redirect } from 'next/navigation';

// Esta es la función principal de la página de inicio.
export default function Home() {
  // Redirigimos automáticamente al usuario al panel de administración.
  redirect('/dashboard');

  // No se renderiza ningún contenido aquí, ya que la redirección ocurre en el servidor.
  return null;
}
