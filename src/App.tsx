import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router";
import type { Photo } from "./types";
import { samplePhotos } from "./samplePhotos";
import GalleryPage from "./GalleryPage";
import PhotoDetailPage from "./PhotoDetailPage";
import "./App.css";

function App() {
  const [photos, setPhotos] = useState<Photo[]>(samplePhotos);
  const [page, setPage] = useState(1);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    setFavoriteCount(photos.filter((photo) => photo.isFavorite).length);
  }, [photos]);

  const handleToggleFavorite = (id: string) => {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo,
      ),
    );
  };

  const handleSaveMemo = (id: string, memo: string) => {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) => (photo.id === id ? { ...photo, memo } : photo)),
    );
  };

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="header-title">
          Photo Gallery
        </Link>
      </header>

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <GalleryPage
                photos={photos}
                page={page}
                favoriteCount={favoriteCount}
                onPageChange={setPage}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <Route
            path="/photos/:id"
            element={
              <PhotoDetailPage
                photos={photos}
                onToggleFavorite={handleToggleFavorite}
                onSaveMemo={handleSaveMemo}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
