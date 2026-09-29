import { Link, useLocation, useParams } from "react-router";
import type { LoadStatus, Photo } from "./types";
import MemoForm from "./MemoForm";

type PhotoDetailPageProps = {
  photos: Photo[];
  status: LoadStatus;
  loadError: string;
  onToggleFavorite: (id: string) => void;
  onSaveMemo: (id: string, memo: string) => void;
};

function PhotoDetailPage({
  photos,
  status,
  loadError,
  onToggleFavorite,
  onSaveMemo,
}: PhotoDetailPageProps) {
  const { id } = useParams();
  const { search } = useLocation();

  const photo = photos.find((item) => item.id === id);

  if (status === "loading") {
    return <p className="message">読み込み中です...</p>;
  }

  if (status === "error") {
    return <p className="message error">{loadError}</p>;
  }

  if (photo === undefined) {
    return (
      <div className="detail">
        <p className="message">今の一覧に、この写真はありません。</p>
        <Link to={{ pathname: "/", search }} className="back-link">
          一覧へ戻る
        </Link>
      </div>
    );
  }

  const index = photos.indexOf(photo);
  const previousPhoto: Photo | undefined = photos[index - 1];
  const nextPhoto: Photo | undefined = photos[index + 1];

  return (
    <div className="detail">
      <Link to={{ pathname: "/", search }} className="back-link">
        一覧へ戻る
      </Link>

      <img
        className="detail-image"
        src={photo.largeUrl}
        alt={`${photo.author}の写真`}
      />
      <h1 className="detail-author">{photo.author}</h1>

      <button
        type="button"
        className={photo.isFavorite ? "favorite-button is-on" : "favorite-button"}
        aria-pressed={photo.isFavorite}
        onClick={() => onToggleFavorite(photo.id)}
      >
        {photo.isFavorite ? "★ お気に入り" : "☆ お気に入り"}
      </button>

      <section className="memo">
        <h2 className="memo-title">メモ</h2>

        {photo.memo === "" ? (
          <p className="memo-empty">まだメモがありません。</p>
        ) : (
          <p className="memo-body">{photo.memo}</p>
        )}

        <MemoForm key={photo.id} onSave={(memo) => onSaveMemo(photo.id, memo)} />
      </section>

      <nav className="detail-nav">
        {previousPhoto !== undefined && (
          <Link to={{ pathname: `/photos/${previousPhoto.id}`, search }}>← 前の写真</Link>
        )}
        {nextPhoto !== undefined && (
          <Link to={{ pathname: `/photos/${nextPhoto.id}`, search }}>次の写真 →</Link>
        )}
      </nav>
    </div>
  );
}

export default PhotoDetailPage;
