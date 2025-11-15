import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  ScrollView,
} from "react-native";
import { Avatar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  primary: "#FF6905",
  secondary: "#4A4A4A",
  background: '#0F0F1E',
  card: "#F9F9F9",
  border: "#E8E8E8",
  blue: "#2196F3",
  red: "#F44336",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  accent: "#FF9F43",
  dark: '#1A1A2E',
  darkCard: '#16213E',
  green: "#4CD964",
  yellow: "#FFD700",
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL = "http://10.71.20.190:8082/backend";

type UserProfile = {
  id: number;
  usuario: string;
  nombre: string;
  email: string;
  biografia?: string;
  foto_perfil?: string;
  sitio_web?: string;
  publicaciones_count: number;
  seguidores_count: number;
  seguidos_count: number;
  es_seguido: boolean;
  es_privado: boolean;
};

type Coleccion = {
  id: number;
  libro_id: number;
  titulo: string;
  autor: string;
  caratula_url: string;
  tipo: 'quiero_leer' | 'leyendo' | 'leidos' | 'favoritos';
  progreso: number;
  pagina_actual: number;
  calificacion?: number;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  notas?: string;
};

type Post = {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_username: string;
  fecha_creacion: string;
  texto: string;
  imagen_url?: string | null;
  video_url?: string | null;
  tipo_contenido?: 'texto' | 'imagen' | 'video';
  likes_count: number;
  comentarios_count: number;
  compartidos_count: number;
  liked?: boolean;
  guardado?: boolean;
};

type TabType = 'publicaciones' | 'biblioteca' | 'guardados';
type BibliotecaTab = 'todos' | 'quiero_leer' | 'leyendo' | 'leidos' | 'favoritos';

export default function ProfileScreen({ route, navigation }: any) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [colecciones, setColecciones] = useState<Coleccion[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('biblioteca');
  const [bibliotecaTab, setBibliotecaTab] = useState<BibliotecaTab>('todos');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [bookDetailModalVisible, setBookDetailModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [postDetailModalVisible, setPostDetailModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Coleccion | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // Datos de edición
  const [editNombre, setEditNombre] = useState("");
  const [editBiografia, setEditBiografia] = useState("");
  const [editSitioWeb, setEditSitioWeb] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Actualizar progreso
  const [newProgress, setNewProgress] = useState("0");
  const [newPageNumber, setNewPageNumber] = useState("0");
  const [newNotes, setNewNotes] = useState("");
  const [newRating, setNewRating] = useState(0);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const viewingUserId = route?.params?.viewingUserId || null;
  const isOwnProfile = !viewingUserId || currentUserId === viewingUserId;

  useEffect(() => {
    cargarUsuarioLogueado();
  }, []);

  useEffect(() => {
    if (currentUserId !== null) {
      const userId = viewingUserId || currentUserId;
      cargarPerfil(userId);
      cargarPublicaciones(userId);
      if (activeTab === 'biblioteca') {
        cargarColecciones(userId);
      }
    }
  }, [currentUserId, viewingUserId, activeTab]);

  const cargarUsuarioLogueado = async () => {
    try {
      const userId = await AsyncStorage.getItem('logged_user_id');
      console.log("Usuario ID desde AsyncStorage:", userId);
      
      if (userId) {
        setCurrentUserId(parseInt(userId, 10));
      } else {
        Alert.alert("Error", "No hay sesión activa. Por favor inicia sesión.");
        navigation.replace('Login');
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      Alert.alert("Error", "Error al cargar la sesión del usuario");
    }
  };

  const cargarPerfil = async (userId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/perfil/${userId}?usuario_actual_id=${currentUserId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        setEditNombre(data.data.nombre);
        setEditBiografia(data.data.biografia || "");
        setEditSitioWeb(data.data.sitio_web || "");
      } else {
        Alert.alert("Error", data.message || "No se pudo cargar el perfil");
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const cargarColecciones = async (userId: number) => {
    try {
      const tipo = bibliotecaTab !== 'todos' ? bibliotecaTab : '';
      const url = tipo 
        ? `${API_URL}/colecciones/usuario/${userId}?tipo=${tipo}`
        : `${API_URL}/colecciones/usuario/${userId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setColecciones(data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar colecciones:", error);
      setColecciones([]);
    }
  };

  const cargarPublicaciones = async (userId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/perfil/${userId}/publicaciones?usuario_actual_id=${currentUserId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
      setPosts([]);
    }
  };

  const cargarGuardados = async () => {
    if (!isOwnProfile || !currentUserId) return;
    
    try {
      const response = await fetch(
        `${API_URL}/perfil/${currentUserId}/guardados`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setSavedPosts(data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar guardados:", error);
      setSavedPosts([]);
    }
  };

  useEffect(() => {
    const userId = viewingUserId || currentUserId;
    if (userId && activeTab === 'biblioteca') {
      cargarColecciones(userId);
    }
  }, [bibliotecaTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const userId = viewingUserId || currentUserId;
    if (userId) {
      await Promise.all([
        cargarPerfil(userId),
        cargarPublicaciones(userId),
        activeTab === 'biblioteca' ? cargarColecciones(userId) : Promise.resolve(),
        activeTab === 'guardados' ? cargarGuardados() : Promise.resolve(),
      ]);
    }
    setRefreshing(false);
  }, [activeTab, currentUserId, viewingUserId, bibliotecaTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const userId = viewingUserId || currentUserId;
    if (tab === 'guardados' && savedPosts.length === 0) {
      cargarGuardados();
    } else if (tab === 'biblioteca' && userId) {
      cargarColecciones(userId);
    }
  };

  const handleSeguir = async () => {
    if (!currentUserId || !viewingUserId) return;

    try {
      const response = await fetch(`${API_URL}/perfil/${viewingUserId}/seguir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seguidor_id: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProfile(prev => prev ? {
          ...prev,
          es_seguido: data.data.siguiendo,
          seguidores_count: data.data.seguidores_count
        } : null);
      } else {
        Alert.alert("Error", data.message || "No se pudo realizar la acción");
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  const pickProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permiso denegado", "Se necesita permiso para acceder a la galería");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    if (!currentUserId) return;

    try {
      setUploadingPhoto(true);
      
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();

      if (uploadData.success && uploadData.url) {
        const updateResponse = await fetch(`${API_URL}/perfil/${currentUserId}/actualizar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            foto_perfil: uploadData.url,
          }),
        });

        const updateData = await updateResponse.json();

        if (updateData.success) {
          setProfile(prev => prev ? { ...prev, foto_perfil: uploadData.url } : null);
          Alert.alert("Éxito", "Foto de perfil actualizada");
        } else {
          Alert.alert("Error", updateData.message || "No se pudo actualizar la foto");
        }
      } else {
        Alert.alert("Error", "No se pudo subir la imagen");
      }
    } catch (error) {
      console.error("Error al subir foto:", error);
      Alert.alert("Error", "No se pudo actualizar la foto de perfil");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUserId) return;

    if (!editNombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/perfil/${currentUserId}/actualizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          biografia: editBiografia.trim(),
          sitio_web: editSitioWeb.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProfile(prev => prev ? {
          ...prev,
          nombre: editNombre.trim(),
          biografia: editBiografia.trim(),
          sitio_web: editSitioWeb.trim(),
        } : null);
        setEditModalVisible(false);
        Alert.alert("Éxito", "Perfil actualizado correctamente");
      } else {
        Alert.alert("Error", data.message || "No se pudo actualizar el perfil");
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (book: Coleccion) => {
    setSelectedBook(book);
    setNewProgress(book.progreso.toString());
    setNewPageNumber(book.pagina_actual.toString());
    setNewNotes(book.notas || "");
    setNewRating(book.calificacion || 0);
    setBookDetailModalVisible(true);
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setPostDetailModalVisible(true);
  };

  const handleUpdateProgress = async () => {
    if (!selectedBook) return;

    const progreso = parseInt(newProgress);
    const paginaActual = parseInt(newPageNumber);

    if (isNaN(progreso) || progreso < 0 || progreso > 100) {
      Alert.alert("Error", "El progreso debe estar entre 0 y 100");
      return;
    }

    if (isNaN(paginaActual) || paginaActual < 0) {
      Alert.alert("Error", "La página actual debe ser un número válido");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/colecciones/${selectedBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progreso,
          pagina_actual: paginaActual,
          notas: newNotes.trim(),
          calificacion: newRating > 0 ? newRating : null,
          tipo: progreso === 100 ? 'leidos' : selectedBook.tipo,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        Alert.alert("Éxito", "Progreso actualizado");
        setProgressModalVisible(false);
        setBookDetailModalVisible(false);
        const userId = viewingUserId || currentUserId;
        if (userId) await cargarColecciones(userId);
      } else {
        Alert.alert("Error", data.message || "No se pudo actualizar");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  const handleDeleteFromCollection = async () => {
    if (!selectedBook) return;

    Alert.alert(
      "Confirmar eliminación",
      `¿Seguro que quieres eliminar "${selectedBook.titulo}" de tu biblioteca?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/colecciones/${selectedBook.id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();

              if (data.success) {
                Alert.alert("Éxito", "Libro eliminado de tu biblioteca");
                setBookDetailModalVisible(false);
                const userId = viewingUserId || currentUserId;
                if (userId) await cargarColecciones(userId);
              } else {
                Alert.alert("Error", data.message || "No se pudo eliminar");
              }
            } catch (error) {
              console.error("Error:", error);
              Alert.alert("Error", "No se pudo conectar con el servidor");
            }
          },
        },
      ]
    );
  };

  const handleCerrarSesion = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('logged_user_id');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert("Error", "No se pudo cerrar la sesión");
            }
          },
        },
      ]
    );
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'leyendo': return COLORS.blue;
      case 'leidos': return COLORS.green;
      case 'quiero_leer': return COLORS.yellow;
      case 'favoritos': return COLORS.red;
      default: return COLORS.secondary;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'leyendo': return 'Leyendo';
      case 'leidos': return 'Leídos';
      case 'quiero_leer': return 'Quiero Leer';
      case 'favoritos': return 'Favoritos';
      default: return tipo;
    }
  };

  const renderHeader = () => {
    if (!profile) return null;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.profileInfoContainer}>
          <TouchableOpacity 
            onPress={isOwnProfile ? pickProfileImage : undefined}
            disabled={uploadingPhoto || !isOwnProfile}
            activeOpacity={isOwnProfile ? 0.7 : 1}
          >
            {profile.foto_perfil ? (
              <Image source={{ uri: profile.foto_perfil }} style={styles.profileImage} />
            ) : (
              <Avatar.Image 
                size={90} 
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nombre)}&background=random&size=200` }} 
              />
            )}
            {isOwnProfile && uploadingPhoto && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {activeTab === 'biblioteca' ? colecciones.length : profile.publicaciones_count}
              </Text>
              <Text style={styles.statLabel}>
                {activeTab === 'biblioteca' ? 'Libros' : 'Publicaciones'}
              </Text>
            </View>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.seguidores_count}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.seguidos_count}</Text>
              <Text style={styles.statLabel}>Seguidos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.profileName}>{profile.nombre}</Text>
          {profile.biografia && (
            <Text style={styles.profileBio}>{profile.biografia}</Text>
          )}
          {profile.sitio_web && (
            <Text style={styles.profileWebsite}>{profile.sitio_web}</Text>
          )}
        </View>

        <View style={styles.actionsContainer}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setEditModalVisible(true)}
              >
                <Text style={styles.editButtonText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => setSettingsModalVisible(true)}
              >
                <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[
                  styles.followButton,
                  profile.es_seguido && styles.followingButton
                ]}
                onPress={handleSeguir}
              >
                <Text style={[
                  styles.followButtonText,
                  profile.es_seguido && styles.followingButtonText
                ]}>
                  {profile.es_seguido ? "Siguiendo" : "Seguir"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton}>
                <Text style={styles.messageButtonText}>Mensaje</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'publicaciones' && styles.activeTab]}
            onPress={() => handleTabChange('publicaciones')}
          >
            <Ionicons 
              name="grid-outline" 
              size={24} 
              color={activeTab === 'publicaciones' ? COLORS.primary : COLORS.secondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'biblioteca' && styles.activeTab]}
            onPress={() => handleTabChange('biblioteca')}
          >
            <Ionicons 
              name="book-outline" 
              size={24} 
              color={activeTab === 'biblioteca' ? COLORS.primary : COLORS.secondary} 
            />
          </TouchableOpacity>
          {isOwnProfile && (
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'guardados' && styles.activeTab]}
              onPress={() => handleTabChange('guardados')}
            >
              <Ionicons 
                name="bookmark-outline" 
                size={24} 
                color={activeTab === 'guardados' ? COLORS.primary : COLORS.secondary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {activeTab === 'biblioteca' && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.bibliotecaTabsScroll}
            contentContainerStyle={styles.bibliotecaTabsContent}
          >
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'leyendo', label: 'Leyendo' },
              { key: 'leidos', label: 'Leídos' },
              { key: 'quiero_leer', label: 'Quiero Leer' },
              { key: 'favoritos', label: 'Favoritos' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.bibliotecaTab,
                  bibliotecaTab === tab.key && styles.bibliotecaTabActive,
                ]}
                onPress={() => setBibliotecaTab(tab.key as BibliotecaTab)}
              >
                <Text
                  style={[
                    styles.bibliotecaTabText,
                    bibliotecaTab === tab.key && styles.bibliotecaTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderBook = ({ item }: { item: Coleccion }) => (
    <TouchableOpacity 
      style={styles.bookCard}
      onPress={() => handleBookPress(item)}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.caratula_url || 'https://via.placeholder.com/120x180?text=Sin+Imagen' }} 
        style={styles.bookCover}
        resizeMode="cover"
      />
      
      <View style={[styles.statusBadge, { backgroundColor: getTipoColor(item.tipo) }]}>
        <Text style={styles.statusBadgeText}>{getTipoLabel(item.tipo)}</Text>
      </View>

      {item.tipo === 'leyendo' && item.progreso > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progreso}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progreso}%</Text>
        </View>
      )}

      {item.calificacion && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={COLORS.yellow} />
          <Text style={styles.ratingText}>{item.calificacion}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={styles.gridItem}
      onPress={() => handlePostPress(item)}
      activeOpacity={0.9}
    >
      {item.tipo_contenido === 'imagen' && item.imagen_url ? (
        <Image 
          source={{ uri: item.imagen_url }} 
          style={styles.gridImage}
          resizeMode="cover"
        />
      ) : item.tipo_contenido === 'video' && item.video_url ? (
        <View style={styles.gridVideoContainer}>
          <Image 
            source={{ uri: item.video_url }} 
            style={styles.gridImage}
            resizeMode="cover"
          />
          <View style={styles.videoIndicator}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        </View>
      ) : (
        <View style={[styles.gridImage, styles.textPostContainer]}>
          <Text style={styles.textPostPreview} numberOfLines={4}>
            {item.texto}
          </Text>
        </View>
      )}
      
      {(item.likes_count > 0 || item.comentarios_count > 0) && (
        <View style={styles.postOverlay}>
          <View style={styles.overlayStats}>
            {item.likes_count > 0 && (
              <View style={styles.overlayStat}>
                <Ionicons name="heart" size={16} color="#fff" />
                <Text style={styles.overlayStatText}>{item.likes_count}</Text>
              </View>
            )}
            {item.comentarios_count > 0 && (
              <View style={styles.overlayStat}>
                <Ionicons name="chatbubble" size={16} color="#fff" />
                <Text style={styles.overlayStatText}>{item.comentarios_count}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    let iconName: any = 'camera-outline';
    let title = 'Comparte fotos';
    let subtitle = 'Cuando compartas contenido, aparecerá aquí.';

    if (activeTab === 'biblioteca') {
      iconName = 'book-outline';
      title = 'Tu biblioteca está vacía';
      subtitle = 'Comienza a agregar libros desde la pantalla de explorar';
    } else if (activeTab === 'guardados') {
      iconName = 'bookmark-outline';
      title = 'Guarda publicaciones';
      subtitle = 'Guarda las publicaciones que te gusten. Solo tú podrás ver lo que has guardado.';
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name={iconName} size={64} color={COLORS.secondary} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
      </View>
    );
  };

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getData = () => {
    if (activeTab === 'biblioteca') return colecciones;
    if (activeTab === 'guardados') return savedPosts;
    return posts;
  };

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'biblioteca') {
      return renderBook({ item });
    }
    return renderPost({ item });
  };

  const keyExtractor = (item: any) => {
    if (activeTab === 'biblioteca') {
      return `book-${item.id}`;
    }
    return `post-${item.id}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <FlatList
        data={getData()}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={activeTab === 'biblioteca' ? 3 : 3}
        key={activeTab} // Forzar re-render al cambiar tab
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          getData().length === 0 && styles.emptyListContent
        ]}
        columnWrapperStyle={getData().length > 0 ? styles.columnWrapper : undefined}
      />

      {/* Modal de Edición de Perfil */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={handleUpdateProfile} disabled={loading}>
                <Text style={[styles.modalSaveText, loading && styles.modalSaveTextDisabled]}>
                  {loading ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={editNombre}
                  onChangeText={setEditNombre}
                  placeholder="Tu nombre"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Biografía</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editBiografia}
                  onChangeText={setEditBiografia}
                  placeholder="Cuéntanos sobre ti"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sitio web</Text>
                <TextInput
                  style={styles.input}
                  value={editSitioWeb}
                  onChangeText={setEditSitioWeb}
                  placeholder="https://tusitio.com"
                  placeholderTextColor={COLORS.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Configuración */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Configuración</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              <TouchableOpacity style={styles.settingItem} onPress={handleCerrarSesion}>
                <Ionicons name="log-out-outline" size={24} color={COLORS.red} />
                <Text style={[styles.settingText, { color: COLORS.red }]}>
                  Cerrar sesión
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalle de Libro */}
      <Modal
        visible={bookDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBook && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setBookDetailModalVisible(false)}>
                    <Ionicons name="close" size={28} color={COLORS.text} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Detalles del libro</Text>
                  <View style={{ width: 28 }} />
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.bookDetailContainer}>
                    <Image
                      source={{ uri: selectedBook.caratula_url }}
                      style={styles.bookDetailCover}
                      resizeMode="cover"
                    />
                    <Text style={styles.bookDetailTitle}>{selectedBook.titulo}</Text>
                    <Text style={styles.bookDetailAuthor}>{selectedBook.autor}</Text>

                    <View style={styles.bookDetailStats}>
                      <View style={styles.bookDetailStat}>
                        <Text style={styles.bookDetailStatLabel}>Estado</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getTipoColor(selectedBook.tipo) }]}>
                          <Text style={styles.statusBadgeText}>{getTipoLabel(selectedBook.tipo)}</Text>
                        </View>
                      </View>

                      <View style={styles.bookDetailStat}>
                        <Text style={styles.bookDetailStatLabel}>Progreso</Text>
                        <Text style={styles.bookDetailStatValue}>{selectedBook.progreso}%</Text>
                      </View>

                      <View style={styles.bookDetailStat}>
                        <Text style={styles.bookDetailStatLabel}>Página</Text>
                        <Text style={styles.bookDetailStatValue}>{selectedBook.pagina_actual}</Text>
                      </View>
                    </View>

                    {selectedBook.notas && (
                      <View style={styles.notesSection}>
                        <Text style={styles.notesSectionTitle}>Notas</Text>
                        <Text style={styles.notesText}>{selectedBook.notas}</Text>
                      </View>
                    )}

                    {isOwnProfile && (
                      <View style={styles.bookDetailActions}>
                        <TouchableOpacity
                          style={styles.updateProgressButton}
                          onPress={() => setProgressModalVisible(true)}
                        >
                          <Ionicons name="create-outline" size={20} color="#fff" />
                          <Text style={styles.updateProgressButtonText}>Actualizar progreso</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={handleDeleteFromCollection}
                        >
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                          <Text style={styles.deleteButtonText}>Eliminar de biblioteca</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Actualizar Progreso */}
      <Modal
        visible={progressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setProgressModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Actualizar progreso</Text>
              <TouchableOpacity onPress={handleUpdateProgress}>
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Progreso (%)</Text>
                <TextInput
                  style={styles.input}
                  value={newProgress}
                  onChangeText={setNewProgress}
                  placeholder="0-100"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Página actual</Text>
                <TextInput
                  style={styles.input}
                  value={newPageNumber}
                  onChangeText={setNewPageNumber}
                  placeholder="Número de página"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calificación</Text>
                <View style={styles.ratingInput}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setNewRating(star)}
                    >
                      <Ionicons
                        name={star <= newRating ? "star" : "star-outline"}
                        size={32}
                        color={COLORS.yellow}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notas</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newNotes}
                  onChangeText={setNewNotes}
                  placeholder="Tus notas sobre el libro"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalle de Publicación */}
      <Modal
        visible={postDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPostDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPost && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setPostDetailModalVisible(false)}>
                    <Ionicons name="close" size={28} color={COLORS.text} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Publicación</Text>
                  <View style={{ width: 28 }} />
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.postDetailContainer}>
                    {selectedPost.imagen_url && (
                      <Image
                        source={{ uri: selectedPost.imagen_url }}
                        style={styles.postDetailImage}
                        resizeMode="cover"
                      />
                    )}
                    
                    <View style={styles.postDetailInfo}>
                      <Text style={styles.postDetailUsername}>
                        @{selectedPost.usuario_username}
                      </Text>
                      <Text style={styles.postDetailText}>{selectedPost.texto}</Text>
                      
                      <View style={styles.postDetailStats}>
                        <View style={styles.postDetailStat}>
                          <Ionicons name="heart" size={20} color={COLORS.red} />
                          <Text style={styles.postDetailStatText}>{selectedPost.likes_count}</Text>
                        </View>
                        <View style={styles.postDetailStat}>
                          <Ionicons name="chatbubble" size={20} color={COLORS.blue} />
                          <Text style={styles.postDetailStatText}>{selectedPost.comentarios_count}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  columnWrapper: {
    paddingHorizontal: 1,
  },
  headerContainer: {
    backgroundColor: COLORS.dark,
    paddingBottom: 12,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bioContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  profileWebsite: {
    fontSize: 14,
    color: COLORS.blue,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.darkCard,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: COLORS.darkCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  followButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  followingButtonText: {
    color: COLORS.text,
  },
  messageButton: {
    flex: 1,
    backgroundColor: COLORS.darkCard,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  bibliotecaTabsScroll: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bibliotecaTabsContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  bibliotecaTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.darkCard,
  },
  bibliotecaTabActive: {
    backgroundColor: COLORS.primary,
  },
  bibliotecaTabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  bibliotecaTabTextActive: {
    color: '#fff',
  },
  bookCard: {
    flex: 1,
    margin: 1,
    aspectRatio: 0.67,
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  gridItem: {
    flex: 1,
    margin: 1,
    aspectRatio: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridVideoContainer: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  textPostContainer: {
    backgroundColor: COLORS.darkCard,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  textPostPreview: {
    color: COLORS.text,
    fontSize: 12,
    textAlign: 'center',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  overlayStats: {
    flexDirection: 'row',
    gap: 12,
  },
  overlayStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overlayStatText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.darkCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  modalSaveText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveTextDisabled: {
    color: COLORS.textSecondary,
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  ratingInput: {
    flexDirection: 'row',
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
  },
  bookDetailContainer: {
    alignItems: 'center',
  },
  bookDetailCover: {
    width: 150,
    height: 225,
    borderRadius: 8,
    marginBottom: 16,
  },
  bookDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  bookDetailAuthor: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  bookDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  bookDetailStat: {
    alignItems: 'center',
  },
  bookDetailStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  bookDetailStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notesSection: {
    width: '100%',
    backgroundColor: COLORS.darkCard,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bookDetailActions: {
    width: '100%',
    gap: 12,
  },
  updateProgressButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  updateProgressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.red,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postDetailContainer: {
    alignItems: 'center',
  },
  postDetailImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 16,
  },
  postDetailInfo: {
    width: '100%',
  },
  postDetailUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  postDetailText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  postDetailStats: {
    flexDirection: 'row',
    gap: 20,
  },
  postDetailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postDetailStatText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
});