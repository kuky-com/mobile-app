import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Text from "./Text";

// Function to fetch and parse VTT file
const fetchVTT = async (url) => {
  const response = await fetch(url, { cache: 'no-cache' });
  const text = await response.text();
  const subtitles = parseVTT(text);
  return subtitles;
};

// Function to parse VTT subtitles
const parseVTT = (vttText) => {
  const subtitleEntries = [];
  const regex = /(\d{2}:\d{2}:\d{2}.\d{3}) --> (\d{2}:\d{2}:\d{2}.\d{3})\n([\s\S]+?)(?=\n\n|\n*$)/g;
  let match;
  while ((match = regex.exec(vttText)) !== null) {
    subtitleEntries.push({
      startTime: timeToSeconds(match[1]),
      endTime: timeToSeconds(match[2]),
      text: match[3].trim(),
    });
  }
  return subtitleEntries;
};

// Convert timestamp to seconds
const timeToSeconds = (time) => {
  const [hh, mm, ss] = time.split(":");
  const [sec, ms] = ss.split(".");
  return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseInt(sec) + parseInt(ms) / 1000;
};

// Subtitle Component
const VideoSubtitle = ({ videoRef, vttUrl }) => {
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  useEffect(() => {
    fetchVTT(vttUrl).then(setSubtitles);
  }, [vttUrl]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current) {
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded && status.positionMillis) {
          const currentTime = status.positionMillis / 1000;
          const subtitle = subtitles.find((s) => currentTime >= s.startTime && currentTime <= s.endTime);
          setCurrentSubtitle(subtitle ? subtitle.text : "");
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [subtitles]);

  // Function to highlight words inside <highlight> tags
  const renderHighlightedText = (text) => {
    const regex = /<b>(.*?)<\/b>/g;
    const parts = text.split(regex);
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <Text key={index} style={styles.highlightText}>
          {part}
        </Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };

  return (
    <View style={[styles.subtitleContainer, { opacity: currentSubtitle && currentSubtitle.length > 0 ? 1 : 0 }]}>
      <Text style={styles.subtitleText}>{renderHighlightedText(currentSubtitle)}</Text>
    </View>
  );
};

export default VideoSubtitle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CDB8E250",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: 300,
  },
  subtitleContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(205, 184, 226, 0.75)",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 3
  },
  subtitleText: {
    color: "black",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 24,
  },
  highlightText: {
    color: "#E8FF58",
    fontWeight: "bold",
  },
});
