import type { Photo } from "./types";

export const buildPhotosUrl = (page: number) =>
  `https://picsum.photos/v2/list?page=${page}&limit=12`;

export const toPhoto = (apiPhoto: unknown): Photo => {
  if (
    typeof apiPhoto !== "object" || apiPhoto === null ||
    !("id" in apiPhoto) || typeof apiPhoto.id !== "string" ||
    !/^\d+$/.test(apiPhoto.id) ||
    !("author" in apiPhoto) || typeof apiPhoto.author !== "string"
  ) {
    throw new Error("写真データの形式が正しくありません");
  }

  return {
    id: apiPhoto.id,
    author: apiPhoto.author,
    imageUrl: `https://picsum.photos/id/${apiPhoto.id}/400/300`,
    largeUrl: `https://picsum.photos/id/${apiPhoto.id}/800/600`,
    isFavorite: false,
    memo: "",
  };
};
