export type LoadStatus = "loading" | "error" | "success";

export type Photo = {
  id: string;
  author: string;
  imageUrl: string;
  largeUrl: string;
  isFavorite: boolean;
  memo: string;
};
