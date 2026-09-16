import { useEffect, useState } from "react";
import type { Photo } from "./types";
import PhotoCard from "./PhotoCard";

type GalleryPageProps = {
  photos: Photo[];
  page: number;
  favoriteCount: number;
  onPageChange: (page: number) => void;
  onToggleFavorite: (id: string) => void;
};

function GalleryPage({
  photos,
  page,
  favoriteCount,
  onPageChange,
  onToggleFavorite,
}: GalleryPageProps) {
  const [keyword, setKeyword] = useState("");
  const [showsFavoriteOnly, setShowsFavoriteOnly] = useState(false);
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>([]);

  useEffect(() => {
    setVisiblePhotos(
      photos
        .filter((photo) =>
          photo.author.toLowerCase().includes(keyword.toLowerCase()),
        )
        .filter((photo) => (showsFavoriteOnly ? photo.isFavorite : true)),
    );
  }, [photos, keyword, showsFavoriteOnly]);

  useEffect(() => {
    setKeyword("");
    setShowsFavoriteOnly(false);
  }, [page]);

  return (
    <>
      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="作者名でしぼりこむ"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <button
          type="button"
          className={showsFavoriteOnly ? "filter-button is-on" : "filter-button"}
          onClick={() => setShowsFavoriteOnly(!showsFavoriteOnly)}
        >
          お気に入りのみ（{favoriteCount}）
        </button>
      </div>

      {visiblePhotos.length === 0 ? (
        <p className="message">あてはまる写真がありません。</p>
      ) : (
        <div className="grid">
          {visiblePhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              author={photo.author}
              imageUrl={photo.imageUrl}
              isFavorite={photo.isFavorite}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      <div className="pager">
        <button
          type="button"
          className="filter-button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          前のページ
        </button>
        <span>ページ {page}</span>
        <button
          type="button"
          className="filter-button"
          onClick={() => onPageChange(page + 1)}
        >
          次のページ
        </button>
      </div>
    </>
  );
}

export default GalleryPage;
