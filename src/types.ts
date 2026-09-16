export type ApiPhoto = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

export type Photo = {
  id: string;
  author: string;
  imageUrl: string;
  largeUrl: string;
  isFavorite: boolean;
  memo: string;
};
