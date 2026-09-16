import type { ApiPhoto, Photo } from "./types";

export const buildPhotosUrl = (page: number) =>
  `https://picsum.photos/v2/list?page=${page}&limit=12`;

export const toPhoto = (apiPhoto: ApiPhoto): Photo => ({
  id: apiPhoto.id,
  author: apiPhoto.author,
  imageUrl: `https://picsum.photos/id/${apiPhoto.id}/400/300`,
  largeUrl: `https://picsum.photos/id/${apiPhoto.id}/800/600`,
  isFavorite: false,
  memo: "",
});
