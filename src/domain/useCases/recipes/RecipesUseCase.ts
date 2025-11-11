import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../data/services/supabaseClient";
import { Receta } from "../../models/Receta";

export class RecipesUseCase {
    // ... (Los métodos anteriores van aquí) ...
    async obtenerRecetas(): Promise<Receta[]> {
        // ... (sin cambios)
        try {
            const { data, error } = await supabase
                .from("recetas")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.log("Error al obtener recetas:", error);
            return [];
        }
    }

    async buscarPorIngrediente(ingrediente: string): Promise<Receta[]> {
        // ... (sin cambios)
        try {
            const { data, error } = await supabase
                .from("recetas")
                .select("*")
                .contains("ingredientes", [ingrediente])
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.log("Error en búsqueda:", error);
            return [];
        }
    }

    async crearReceta(
        // ... (sin cambios)
        titulo: string,
        descripcion: string,
        ingredientes: string[],
        chefId: string,
        imagenUri?: string
    ) {
        try {
            let imagenUrl = null;

            // Si hay imagen, la subimos primero
            if (imagenUri) {
                imagenUrl = await this.subirImagen(imagenUri);
            }

            const { data, error } = await supabase
                .from("recetas")
                .insert({
                    titulo,
                    descripcion,
                    ingredientes,
                    chef_id: chefId,
                    imagen_url: imagenUrl,
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, receta: data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Actualizar receta existente
    async actualizarReceta(
        id: string,
        titulo: string,
        descripcion: string,
        ingredientes: string[],
        imagenUri?: string // <-- ¡AQUÍ ESTÁ EL 5TO ARGUMENTO!
    ) {
        try {
            let updateData: any = {
                titulo,
                descripcion,
                ingredientes,
            };

            // Si se proporciona una nueva imagen, la subimos
            if (imagenUri) {
                console.log("🔵 Subiendo nueva imagen para actualización...");
                const imagenUrl = await this.subirImagen(imagenUri);
                if (imagenUrl) {
                    updateData.imagen_url = imagenUrl; // <-- Añadimos la nueva URL a los datos
                    console.log("✅ Nueva imagen subida:", imagenUrl);
                } else {
                    console.log("⚠️ Error al subir la nueva imagen, actualizando sin ella.");
                }
            }

            const { data, error } = await supabase
                .from("recetas")
                .update(updateData) // Usamos el objeto dinámico
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, receta: data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Eliminar receta
    async eliminarReceta(id: string) {
        // ... (sin cambios)
        try {
            const { error } = await supabase.from("recetas").delete().eq("id", id);

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Subir imagen a Supabase Storage
    private async subirImagen(uri: string): Promise<string | null> {
        // ... (sin cambios)
        try {
            // Obtener la extensión del archivo
            const extension = uri.split(".").pop();
            const nombreArchivo = `${Date.now()}.${extension}`;

            // Convertir la imagen a blob
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();

            // Subir a Supabase Storage
            const { data, error } = await supabase.storage
                .from("recetas-fotos")
                .upload(nombreArchivo, arrayBuffer, {
                    contentType: `image/${extension}`,
                });

            if (error) throw error;

            // Obtener la URL pública
            const { data: urlData } = supabase.storage
                .from("recetas-fotos")
                .getPublicUrl(nombreArchivo);

            return urlData.publicUrl;
        } catch (error) {
            console.log("Error al subir imagen:", error);
            return null;
        }
    }

    // Seleccionar imagen de la galería
    async seleccionarImagen(): Promise<string | null> {
        // ... (sin cambios)
        try {
            // Pedir permisos
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                alert("Necesitamos permisos para acceder a tus fotos");
                return null;
            }

            // Abrir selector de imágenes
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!resultado.canceled) {
                return resultado.assets[0].uri;
            }

            return null;
        } catch (error) {
            console.log("Error al seleccionar imagen:", error);
            return null;
        }
    }

    // --- ¡NUEVA FUNCIÓN! ---
    // Tomar foto con la cámara
    async tomarFoto(): Promise<string | null> {
        // ... (sin cambios)
        try {
            // Pedir permisos de cámara
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== "granted") {
                alert("Necesitamos permisos para usar la cámara");
                return null;
            }

            // Abrir la cámara
            const resultado = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!resultado.canceled) {
                return resultado.assets[0].uri;
            }

            return null;
        } catch (error) {
            console.log("Error al tomar foto:", error);
            return null;
        }
    }
}