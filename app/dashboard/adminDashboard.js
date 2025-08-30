import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";
import BookCard from "../components/BookCard";
import Navbar from "../components/navbar";

export default function AdminDashboard({ user }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [token, setToken] = useState("");

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    coverImage: "",
  });
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tokenFromStorage = (await AsyncStorage.getItem("token")) || token;
      if (tokenFromStorage && !token) setToken(tokenFromStorage);
      const headers = tokenFromStorage
        ? { Authorization: `Bearer ${tokenFromStorage}` }
        : {};
      const res = await API.get("/books", { headers });
      const list =
        res.data &&
        (Array.isArray(res.data) ? res.data : res.data.books || res.data.data)
          ? Array.isArray(res.data)
            ? res.data
            : res.data.books || res.data.data
          : [];
      setBooks(list);
    } catch (err) {
      console.warn(
        "Admin fetch books error",
        err.message || err,
        err.response?.status,
        err.response?.data
      );
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Responsive grid logic
  const { width: screenWidth } = useWindowDimensions();
  const containerHorizontalPadding = 32;
  const availableWidth = Math.max(
    320,
    screenWidth - containerHorizontalPadding
  );
  const gap = 16;
  const minCardWidth = 150;
  let numColumns = Math.floor((availableWidth + gap) / (minCardWidth + gap));
  if (numColumns < 1) numColumns = 1;
  if (numColumns > 4) numColumns = 4;
  const itemWidth = Math.floor(
    (availableWidth - gap * (numColumns - 1)) / numColumns
  );

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
    setSaving(true);
    try {
      const tokenFromStorage = (await AsyncStorage.getItem("token")) || token;
      await API.post("/books", newBook, {
        headers: tokenFromStorage
          ? { Authorization: `Bearer ${tokenFromStorage}` }
          : {},
      });
      setNewBook({ title: "", author: "", isbn: "", coverImage: "" });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.warn("Add book failed", err.message || err, err.response?.data);
      Alert.alert("Error", err.response?.data?.message || "Failed to add book");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book) => {
    Alert.alert(
      "Delete book",
      `Are you sure you want to delete '${book.title}'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const tokenFromStorage =
                (await AsyncStorage.getItem("token")) || token;
              await API.delete(
                `/books/${encodeURIComponent(book._id || book.isbn)}`,
                {
                  headers: tokenFromStorage
                    ? { Authorization: `Bearer ${tokenFromStorage}` }
                    : {},
                }
              );
              fetchData();
            } catch (err) {
              console.warn(
                "Delete failed",
                err.message || err,
                err.response?.data
              );
              Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to delete book"
              );
            }
          },
        },
      ]
    );
  };

  const startEdit = (book) => {
    setEditingBook({ ...book });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBook) return;
    setSaving(true);
    try {
      const tokenFromStorage = (await AsyncStorage.getItem("token")) || token;
      await API.put(
        `/books/${encodeURIComponent(editingBook._id || editingBook.isbn)}`,
        editingBook,
        {
          headers: tokenFromStorage
            ? { Authorization: `Bearer ${tokenFromStorage}` }
            : {},
        }
      );
      setShowEditModal(false);
      setEditingBook(null);
      fetchData();
    } catch (err) {
      console.warn("Edit failed", err.message || err, err.response?.data);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update book"
      );
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ width: itemWidth, marginVertical: 8 }}>
      <BookCard
        isbn={item.isbn || item._id}
        title={item.title}
        coverImage={item.coverImage || item.cover || null}
        author={item.author}
        availableBooks={item.availableBooks ?? item.quantity ?? 0}
        width={itemWidth}
      />
      <View style={styles.adminBtns}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => startEdit(item)}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: 72 }]}>
      <Navbar />
      <Text style={styles.header}>Books (Admin)</Text>
      <TextInput
        style={styles.search}
        placeholder="Search books..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22c55e" />
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
          numColumns={numColumns}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 12,
          }}
          contentContainerStyle={[
            styles.list,
            { paddingTop: 8, paddingBottom: 24 },
          ]}
        />
      )}

      {user?.role && user.role.toString().toLowerCase() === "librarian" && (
        <>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addBtnText}>＋</Text>
          </TouchableOpacity>

          <Modal visible={showAddModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
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
                <TextInput
                  style={styles.input}
                  placeholder="Cover image URL"
                  value={newBook.coverImage}
                  onChangeText={(t) =>
                    setNewBook((s) => ({ ...s, coverImage: t }))
                  }
                />
                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={handleAddBook}
                    disabled={saving}
                  >
                    <Text style={styles.modalBtnText}>
                      {saving ? "Saving..." : "Add"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setShowAddModal(false)}
                  >
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={showEditModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Book</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={editingBook?.title || ""}
                  onChangeText={(t) =>
                    setEditingBook((s) => ({ ...s, title: t }))
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Author"
                  value={editingBook?.author || ""}
                  onChangeText={(t) =>
                    setEditingBook((s) => ({ ...s, author: t }))
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="ISBN"
                  value={editingBook?.isbn || ""}
                  onChangeText={(t) =>
                    setEditingBook((s) => ({ ...s, isbn: t }))
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Cover image URL"
                  value={editingBook?.coverImage || ""}
                  onChangeText={(t) =>
                    setEditingBook((s) => ({ ...s, coverImage: t }))
                  }
                />
                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={handleSaveEdit}
                    disabled={saving}
                  >
                    <Text style={styles.modalBtnText}>
                      {saving ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => {
                      setShowEditModal(false);
                      setEditingBook(null);
                    }}
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
  cancelBtn: { backgroundColor: "#9ca3af", marginRight: 0, marginLeft: 8 },
  modalBtnText: { color: "#fff", fontWeight: "600" },
  adminBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#16a31a",
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#f87171",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
