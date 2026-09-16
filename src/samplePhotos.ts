import type { Photo } from "./types";

// APIを書く前に画面を確認するための仮データ。14-5でAPIの結果に置き換わる
export const samplePhotos: Photo[] = [
  {
    id: "10",
    author: "Paul Jarvis",
    imageUrl: "https://picsum.photos/id/10/400/300",
    largeUrl: "https://picsum.photos/id/10/800/600",
    isFavorite: false,
    memo: "",
  },
  {
    id: "100",
    author: "Tina Rataj",
    imageUrl: "https://picsum.photos/id/100/400/300",
    largeUrl: "https://picsum.photos/id/100/800/600",
    isFavorite: false,
    memo: "",
  },
  {
    id: "1000",
    author: "Lukas Budimaier",
    imageUrl: "https://picsum.photos/id/1000/400/300",
    largeUrl: "https://picsum.photos/id/1000/800/600",
    isFavorite: false,
    memo: "",
  },
];
