import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image, // <-- Importar Image
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { useRecipes } from "../../src/presentation/hooks/useRecipes";
import { globalStyles } from "../../src/styles/globalStyles";
import {
    borderRadius, // <-- Importar borderRadius
    colors,
    fontSize,
    spacing,
} from "../../src/styles/theme";

export default function EditarRecetaScreen() {
    const { id } = useLocalSearchParams();
    const { usuario } = useAuth();
    // Destructuramos seleccionarImagen del hook
    const { recetas, actualizar, seleccionarImagen } = useRecipes();
    const router = useRouter();

    const receta = recetas.find((r) => r.id === id);

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [ingrediente, setIngrediente] = useState("");
    const [ingredientes, setIngredientes] = useState<string[]>([]);
    const [cargando, setCargando] = useState(false);

    // Nuevos estados para la imagen
    const [imagenUri, setImagenUri] = useState<string | null>(null); // Nueva imagen seleccionada
    const [imagenActualUrl, setImagenActualUrl] = useState<string | null>(null); // Imagen existente

    // Cargar datos de la receta al iniciar
    useEffect(() => {
        if (receta) {
            setTitulo(receta.titulo);
            setDescripcion(receta.descripcion);
            setIngredientes(receta.ingredientes);
            setImagenActualUrl(receta.imagen_url || null); // Guardamos la URL actual
        }
    }, [receta]);

    // ... (Validaciones de permiso - sin cambios)
    if (!receta) {
        return (
            <View style={globalStyles.containerCentered}>
                <Text style={globalStyles.textSecondary}>Receta no encontrada</Text>
            </View>
        );
    }

    if (receta.chef_id !== usuario?.id) {
        return (
            <View style={globalStyles.containerCentered}>
                <Text style={styles.textoError}>
                    No tienes permiso para editar esta receta
                </Text>
                <TouchableOpacity
                    style={[globalStyles.button, globalStyles.buttonPrimary]}
                    onPress={() => router.back()}
                >
                    <Text style={globalStyles.buttonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const agregarIngrediente = () => {
        if (ingrediente.trim()) {
            setIngredientes([...ingredientes, ingrediente.trim()]);
            setIngrediente("");
        }
    };

    const quitarIngrediente = (index: number) => {
        setIngredientes(ingredientes.filter((_, i) => i !== index));
    };

    // Función para manejar la selección de nueva imagen
    const handleSeleccionarImagen = async () => {
        const uri = await seleccionarImagen();
        if (uri) {
            setImagenUri(uri); // Guardamos la URI de la nueva imagen
        }
    };

    const handleGuardar = async () => {
        if (!titulo || !descripcion || ingredientes.length === 0) {
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        setCargando(true);
        const resultado = await actualizar(
            receta.id,
            titulo,
            descripcion,
            ingredientes,
            imagenUri || undefined // <-- Pasamos la nueva URI de imagen
        );
        setCargando(false);

        if (resultado.success) {
            Alert.alert("Éxito", "Receta actualizada correctamente", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } else {
            Alert.alert("Error", resultado.error || "No se pudo actualizar");
        }
    };

    return (
        <ScrollView style={globalStyles.container}>
            <View style={globalStyles.contentPadding}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.botonVolver}>← Cancelar</Text>
                    </TouchableOpacity>
                    <Text style={globalStyles.title}>Editar Receta</Text>
                </View>

                {/* ... (Inputs de Título y Descripción - sin cambios) ... */}
                <TextInput
                    style={globalStyles.input}
                    placeholder="Título de la receta"
                    value={titulo}
                    onChangeText={setTitulo}
                />

                <TextInput
                    style={[globalStyles.input, globalStyles.inputMultiline]}
                    placeholder="Descripción"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                    numberOfLines={4}
                />

                {/* ... (Lógica de Ingredientes - sin cambios) ... */}
                <Text style={globalStyles.subtitle}>Ingredientes:</Text>
                <View style={styles.contenedorIngrediente}>
                    <TextInput
                        style={[globalStyles.input, styles.inputIngrediente]}
                        placeholder="Ej: Tomate"
                        value={ingrediente}
                        onChangeText={setIngrediente}
                        onSubmitEditing={agregarIngrediente}
                    />
                    <TouchableOpacity
                        style={[
                            globalStyles.button,
                            globalStyles.buttonPrimary,
                            styles.botonAgregar,
                        ]}
                        onPress={agregarIngrediente}
                    >
                        <Text style={styles.textoAgregar}>+</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listaIngredientes}>
                    {ingredientes.map((ing, index) => (
                        <View key={index} style={globalStyles.chip}>
                            <Text style={globalStyles.chipText}>{ing}</Text>
                            <TouchableOpacity onPress={() => quitarIngrediente(index)}>
                                <Text style={styles.textoEliminar}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* --- Nueva sección de Imagen --- */}
                <Text style={globalStyles.subtitle}>Imagen:</Text>

                {/* Mostrar vista previa */}
                {imagenUri || imagenActualUrl ? (
                    <Image
                        source={{ uri: imagenUri || imagenActualUrl! }} // Prioriza la nueva imagen
                        style={styles.vistaPrevia}
                    />
                ) : (
                    <View style={styles.imagenPlaceholder}>
                        <Text style={globalStyles.textTertiary}>Sin imagen</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        globalStyles.button,
                        globalStyles.buttonSecondary,
                        styles.botonCambiarImagen,
                    ]}
                    onPress={handleSeleccionarImagen}
                >
                    <Text style={globalStyles.buttonText}>📷 Cambiar Imagen</Text>
                </TouchableOpacity>
                {/* --- Fin de sección de Imagen --- */}

                <TouchableOpacity
                    style={[
                        globalStyles.button,
                        globalStyles.buttonPrimary,
                        styles.botonGuardar,
                    ]}
                    onPress={handleGuardar}
                    disabled={cargando}
                >
                    {cargando ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={globalStyles.buttonText}>Guardar Cambios</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: spacing.lg,
    },
    botonVolver: {
        fontSize: fontSize.md,
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    textoError: {
        fontSize: fontSize.lg,
        color: colors.danger,
        textAlign: "center",
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    contenedorIngrediente: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    inputIngrediente: {
        flex: 1,
        marginBottom: 0,
    },
    botonAgregar: {
        width: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    textoAgregar: {
        color: colors.white,
        fontSize: fontSize.xl,
        fontWeight: "bold",
    },
    listaIngredientes: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    textoEliminar: {
        color: colors.primary,
        fontSize: fontSize.lg,
        fontWeight: "bold",
    },
    // Eliminamos la nota de imagen y añadimos estilos para la vista previa
    vistaPrevia: {
        width: "100%",
        height: 200,
        borderRadius: borderRadius.md,
        marginVertical: spacing.md,
        backgroundColor: colors.borderLight,
    },
    imagenPlaceholder: {
        width: "100%",
        height: 150,
        backgroundColor: colors.borderLight,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    botonCambiarImagen: {
        marginBottom: spacing.lg,
    },
    botonGuardar: {
        padding: spacing.lg,
    },
});