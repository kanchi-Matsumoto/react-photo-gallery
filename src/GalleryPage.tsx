import { useState } from "react";
import type { LoadStatus, Photo } from "./types";
import PhotoCard from "./PhotoCard";

type GalleryPageProps = {
  photos: Photo[];
  page: number;
  status: LoadStatus;
  loadError: string;
  onPageChange: (page: number) => void;
  onToggleFavorite: (id: string) => void;
};

function GalleryPage({
  photos,
  page,
  status,
  loadError,
  onPageChange,
  onToggleFavorite,
}: GalleryPageProps) {
  const [keyword, setKeyword] = useState("");
  const [showsFavoriteOnly, setShowsFavoriteOnly] = useState(false);
  const visiblePhotos = photos
    .filter((photo) => photo.author.toLowerCase().includes(keyword.toLowerCase()))
    .filter((photo) => (showsFavoriteOnly ? photo.isFavorite : true));
  const favoriteCount = photos.filter((photo) => photo.isFavorite).length;

  if (status === "loading") {
    return <p className="message">読み込み中です...</p>;
  }

  if (status === "error") {
    return <p className="message error">{loadError}</p>;
  }

  return (
    <>
      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="作者名でしぼりこむ"
          aria-label="作者名でしぼりこむ"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <button
          type="button"
          className={showsFavoriteOnly ? "filter-button is-on" : "filter-button"}
          aria-pressed={showsFavoriteOnly}
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
