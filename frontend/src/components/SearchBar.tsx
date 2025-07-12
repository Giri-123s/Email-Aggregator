import React, { useState, useEffect } from "react";

interface Props {
  onSearch: (term: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<Props> = ({ onSearch, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search to avoid too many API calls
  useEffect(() => {
    // Don't search if term is too short (less than 2 characters)
    if (searchTerm.length < 2 && searchTerm.length > 0) {
      return;
    }

    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 1200); // Increased to 1.2 seconds delay

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search emails (min 2 characters)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={isLoading}
        style={{ 
          padding: "10px 15px", 
          margin: "10px 0",
          width: "300px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          fontSize: "14px",
          outline: "none",
          opacity: isLoading ? 0.7 : 1
        }}
        onFocus={(e) => e.target.style.borderColor = "#007bff"}
        onBlur={(e) => e.target.style.borderColor = "#ddd"}
      />
      {isLoading && (
        <div style={{
          position: "absolute",
          right: "15px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "12px",
          color: "#007bff"
        }}>
          🔄
        </div>
      )}
      {searchTerm && !isLoading && (
        <button
          onClick={() => setSearchTerm("")}
          style={{
            position: "absolute",
            right: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            color: "#666"
          }}
        >
          ×
        </button>
      )}
      {searchTerm.length === 1 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: "0",
          fontSize: "12px",
          color: "#666",
          marginTop: "2px"
        }}>
          Type at least 2 characters to search
        </div>
      )}
    </div>
  );
};
