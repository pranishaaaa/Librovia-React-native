import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

const API_URL = "http://localhost:8000/api/books";

export default function AdminDashboard({ user }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState(""); // Set this from login

  async function fetchData() {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data.books || []);
    } catch (err) {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [token]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search books..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.booksGrid}>
          {filteredBooks.map((book) => (
            <View key={book.isbn} style={styles.bookCard}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.author}</Text>
              <Text style={styles.bookIsbn}>ISBN: {book.isbn}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      {user?.role === "librarian" && (
        <>
          <TouchableOpacity
            style={styles.addBookBtn}
            onPress={() => setShowModal(true)}
            accessibilityLabel="Add Book"
          >
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>
          <Modal visible={showModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Book</Text>
                {/* AddBookModal content here */}
                {/* You can add TextInputs for title, author, isbn and a submit button */}
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={styles.closeModalBtn}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f6f6" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  booksGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: 180,
  },
  bookTitle: { fontSize: 15, fontWeight: "bold" },
  bookAuthor: { fontSize: 13, color: "#6b7280" },
  bookIsbn: { fontSize: 12, color: "#6b7280" },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 120,
  },
  loadingText: { fontSize: 16, color: "#6b7280", marginTop: 8 },
  addBookBtn: {
    position: "absolute",
    bottom: 40,
    right: 24,
    backgroundColor: "#22c55e",
    borderRadius: 32,
    padding: 16,
    zIndex: 40,
    elevation: 4,
  },
  plus: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  closeModalBtn: { marginTop: 16, alignSelf: "center" },
  closeModalText: { color: "#22c55e", fontSize: 16 },
});
