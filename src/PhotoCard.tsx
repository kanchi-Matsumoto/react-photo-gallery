import { Link } from "react-router";

type PhotoCardProps = {
  id: string;
  author: string;
  imageUrl: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

function PhotoCard({
  id,
  author,
  imageUrl,
  isFavorite,
  onToggleFavorite,
}: PhotoCardProps) {
  return (
    <article className="card">
      <Link to={`/photos/${id}`}>
        <img className="card-image" src={imageUrl} alt={`${author}の写真`} />
      </Link>
      <div className="card-body">
        <p className="card-author">{author}</p>
        <button
          type="button"
          className={isFavorite ? "favorite-button is-on" : "favorite-button"}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(id)}
        >
          {isFavorite ? "★ お気に入り" : "☆ お気に入り"}
        </button>
      </div>
    </article>
  );
}

export default PhotoCard;
