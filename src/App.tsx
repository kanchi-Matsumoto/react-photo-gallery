import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useSearchParams } from "react-router";
import type { LoadStatus, Photo } from "./types";
import { buildPhotosUrl, toPhoto } from "./photosApi";
import GalleryPage from "./GalleryPage";
import PhotoDetailPage from "./PhotoDetailPage";
import "./App.css";

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [loadError, setLoadError] = useState("");
  const { search } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  const handlePageChange = (nextPage: number) => {
    setSearchParams({ page: String(nextPage) });
  };

  useEffect(() => {
    let ignore = false;

    const loadPhotos = async () => {
      setStatus("loading");

      try {
        const response = await fetch(buildPhotosUrl(page));

        if (!response.ok) {
          throw new Error(`写真の取得に失敗しました（${response.status}）`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("写真データの形式が正しくありません");
        }

        if (!ignore) {
          setPhotos(data.map(toPhoto));
          setStatus("success");
        }
      } catch (error) {
        if (ignore) return;

        setLoadError(
          error instanceof Error ? error.message : "写真の取得に失敗しました",
        );
        setStatus("error");
      }
    };

    loadPhotos();

    return () => {
      ignore = true;
    };
  }, [page]);

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
        <Link to={{ pathname: "/", search }} className="header-title">
          Photo Gallery
        </Link>
      </header>

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <GalleryPage
                key={page}
                photos={photos}
                page={page}
                status={status}
                loadError={loadError}
                onPageChange={handlePageChange}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <Route
            path="/photos/:id"
            element={
              <PhotoDetailPage
                photos={photos}
                status={status}
                loadError={loadError}
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
