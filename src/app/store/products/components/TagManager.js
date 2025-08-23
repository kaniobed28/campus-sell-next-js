"use client";
import React, { useState, useRef, useEffect } from "react";

const TagManager = ({ 
  tags = [], 
  onTagsChange, 
  suggestions = [],
  placeholder = "Add tags...",
  maxTags = 10,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, tags]);

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      const newTags = [...tags, trimmedTag];
      onTagsChange(newTags);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !i