import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

export function BookCard({
  isbn,
  title,
  coverImage,
  author,
  availableBooks,
  width,
}) {
  const router = useRouter();

  const handlePress = () => {
    if (!isbn) return;
    router.push(`/books/${encodeURIComponent(isbn)}`);
  };

  const webShadow =
    Platform.OS === "web"
      ? { boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }
      : { elevation: 3 };

  const dynamicSizeStyle = width
    ? { width, height: Math.round(width * 1.6) }
    : {};

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.card, dynamicSizeStyle, webShadow]}
    >
      <View style={styles.imageWrap}>
        {coverImage ? (
          <Image
            source={{ uri: coverImage }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title} title={title}>
          {title || "Untitled"}
        </Text>
        <Text numberOfLines={1} style={styles.author} title={author}>
          By <Text style={styles.authorName}>{author || "Unknown"}</Text>
        </Text>
        <Text style={styles.avail}>{availableBooks ?? 0} available</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 256,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
    marginVertical: 8,
    marginHorizontal: 4,
  },
  imageWrap: {
    flex: 2,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: "90%",
  },
  placeholder: {
    width: "80%",
    height: "80%",
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  placeholderText: { color: "#6b7280" },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "700", color: "#111827" },
  author: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  authorName: { fontWeight: "600", color: "#374151" },
  avail: { marginTop: 6, fontSize: 12, color: "#16a34a" },
});

export default BookCard;
