import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:8000/api/books";

export default function UserDashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Add book modal state
  const [showModal, setShowModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
  });
  const [adding, setAdding] = useState(false);

  const fetchUserAndToken = async () => {
    try {
      const t = await AsyncStorage.getItem("token");
      const u = await AsyncStorage.getItem("user");
      setToken(t);
      setUser(u ? JSON.parse(u) : null);
    } catch (err) {
      console.warn("Failed to load auth:", err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // always read token fresh from storage to avoid stale/missing token on web
      const tokenFromStorage = (await AsyncStorage.getItem("token")) || token;
      if (tokenFromStorage && !token) setToken(tokenFromStorage);
      const headers = tokenFromStorage
        ? { Authorization: `Bearer ${tokenFromStorage}` }
        : {};
      const res = await axios.get(API_URL, { headers });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.books || [];
      setBooks(list);
    } catch (err) {
      console.warn("Failed to fetch books", err.message || err);
      setBooks([]);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        Alert.alert("Access denied", "You are not authorized to fetch books.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchUserAndToken();
    })();
  }, []);

  // refetch books when token is available (after login)
  useEffect(() => {
    // fetch fresh each time token changes
    fetchBooks();
  }, [token]);

  const filteredBooks = books.filter((book) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (book.title || "").toLowerCase().includes(q) ||
      (book.author || "").toLowerCase().includes(q)
    );
  });

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.isbn) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setAdding(true);
    try {
      const tokenFromStorage = (await AsyncStorage.getItem("token")) || token;
      await axios.post(API_URL, newBook, {
        headers: tokenFromStorage
          ? { Authorization: `Bearer ${tokenFromStorage}` }
          : {},
      });
      setNewBook({ title: "", author: "", isbn: "" });
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      console.warn("Add book failed", err.message || err);
      Alert.alert("Error", err.response?.data?.message || "Failed to add book");
    } finally {
      setAdding(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.bookCard, webShadow]}>
      <Text style={styles.bookTitle}>{item.title || "Untitled"}</Text>
      <Text style={styles.bookAuthor}>{item.author || "Unknown"}</Text>
      <Text style={styles.bookIsbn}>ISBN: {item.isbn || item._id || "-"}</Text>
    </View>
  );

  // web-friendly shadow (boxShadow) vs native elevation
  const webShadow =
    Platform.OS === "web"
      ? { boxShadow: "0 6px 14px rgba(0,0,0,0.12)" }
      : { elevation: 2 };
  const addBtnShadow =
    Platform.OS === "web"
      ? { boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }
      : { elevation: 4 };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Books</Text>
      <TextInput
        style={styles.search}
        placeholder="Search books..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item, idx) =>
            item.isbn
              ? item.isbn.toString()
              : item._id
                ? item._id.toString()
                : String(idx)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {user?.role && user.role.toString().toLowerCase() === "librarian" && (
        <>
          <TouchableOpacity
            style={[styles.addBtn, addBtnShadow]}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.addBtnText}>＋</Text>
          </TouchableOpacity>

          <Modal visible={showModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, webShadow]}>
                <Text style={styles.modalTitle}>Add Book</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={newBook.title}
                  onChangeText={(t) => setNewBook((s) => ({ ...s, title: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Author"
                  value={newBook.author}
                  onChangeText={(t) => setNewBook((s) => ({ ...s, author: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="ISBN"
                  value={newBook.isbn}
                  onChangeText={(t) => setNewBook((s) => ({ ...s, isbn: t }))}
                />
                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={handleAddBook}
                    disabled={adding}
                  >
                    <Text style={styles.modalBtnText}>
                      {adding ? "Adding..." : "Add"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6", padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  search: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  center: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#6b7280" },
  list: { paddingBottom: 24 },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bookTitle: { fontSize: 16, fontWeight: "600" },
  bookAuthor: { color: "#6b7280", marginTop: 4 },
  bookIsbn: { color: "#9ca3af", marginTop: 6, fontSize: 12 },
  addBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#22c55e",
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 32, lineHeight: 34 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "90%",
    maxWidth: 420,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  cancelBtn: {
    backgroundColor: "#9ca3af",
    marginRight: 0,
    marginLeft: 8,
  },
  modalBtnText: { color: "#fff", fontWeight: "600" },
});
