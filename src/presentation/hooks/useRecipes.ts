import { useEffect, useState } from "react";
import { Receta } from "../../domain/models/Receta";
import { RecipesUseCase } from "../../domain/useCases/recipes/RecipesUseCase";

const recipesUseCase = new RecipesUseCase();

export function useRecipes() {
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarRecetas();
    }, []);

    const cargarRecetas = async () => {
        // ... (sin cambios)
        setCargando(true);
        const data = await recipesUseCase.obtenerRecetas();
        setRecetas(data);
        setCargando(false);
    };

    const buscar = async (ingrediente: string) => {
        // ... (sin cambios)
        setCargando(true);
        const data = await recipesUseCase.buscarPorIngrediente(ingrediente);
        setRecetas(data);
        setCargando(false);
    };

    const crear = async (
        // ... (sin cambios)
        titulo: string,
        descripcion: string,
        ingredientes: string[],
        chefId: string,
        imagenUri?: string
    ) => {
        const resultado = await recipesUseCase.crearReceta(
            titulo,
            descripcion,
            ingredientes,
            chefId,
            imagenUri
        );
        if (resultado.success) {
            await cargarRecetas(); // Recargar la lista
        }
        return resultado;
    };

    const actualizar = async (
        id: string,
        titulo: string,
        descripcion: string,
        ingredientes: string[],
        imagenUri?: string // <-- ¡AQUÍ ESTÁ EL 5TO ARGUMENTO!
    ) => {
        const resultado = await recipesUseCase.actualizarReceta(
            id,
            titulo,
            descripcion,
            ingredientes,
            imagenUri 
        );
        if (resultado.success) {
            await cargarRecetas();
        }
        return resultado;
    };

    const eliminar = async (id: string) => {
        // ... (sin cambios)
        const resultado = await recipesUseCase.eliminarReceta(id);
        if (resultado.success) {
            await cargarRecetas();
        }
        return resultado;
    };

    const seleccionarImagen = async () => {
        // ... (sin cambios)
        return await recipesUseCase.seleccionarImagen();
    };

    // --- ¡NUEVA FUNCIÓN! ---
    const tomarFoto = async () => {
        // ... (sin cambios)
        return await recipesUseCase.tomarFoto();
    };

    return {
        recetas,
        cargando,
        cargarRecetas,
        buscar,
        crear,
        actualizar, // <-- Esta función ahora tiene 5 argumentos
        eliminar,
        seleccionarImagen,
        tomarFoto, 
    };
}