import { useState } from "react";
import type { FormEvent } from "react";

type MemoFormProps = {
  onSave: (memo: string) => void;
};

function MemoForm({ onSave }: MemoFormProps) {
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const memo = draft.trim();

    if (memo === "") {
      setInputError("メモを入力してください");
      return;
    }

    onSave(memo);
    setDraft("");
    setInputError("");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="memo-input"
          placeholder="この写真のメモ"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="memo-button">
          保存
        </button>
      </form>

      {inputError !== "" && <p className="input-error">{inputError}</p>}
    </>
  );
}

export default MemoForm;
