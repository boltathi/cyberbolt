"""Thread-safe JSON file repository — base class for all data models."""
import json
import os
import uuid
from datetime import datetime, timezone
from filelock import FileLock


class JsonRepository:
    """Generic JSON-file based repository with thread-safe read/write.

    Each repository stores records as a list of dicts in a single JSON file.
    A companion .lock file is used for cross-process safety via filelock.

    Design: easy to swap for SQLAlchemy later — just implement the same methods.
    """

    def __init__(self, data_dir: str, collection: str):
        os.makedirs(data_dir, exist_ok=True)
        self._path = os.path.join(data_dir, f"{collection}.json")
        self._lock = FileLock(f"{self._path}.lock", timeout=10)
        if not os.path.exists(self._path):
            self._write([])

    # ── Low-level I/O ─────────────────────────────

    def _read(self) -> list[dict]:
        with self._lock:
            try:
                with open(self._path, "r") as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                return []

    def _write(self, data: list[dict]) -> None:
        with self._lock:
            with open(self._path, "w") as f:
                json.dump(data, f, indent=2, default=str)

    # ── CRUD ──────────────────────────────────────

    def find_all(
        self,
        filters: dict | None = None,
        sort_by: str = "created_at",
        sort_desc: bool = True,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[dict], int]:
        """Return paginated, filtered, sorted list + total count."""
        records = self._read()

        # Filter
        if filters:
            for key, value in filters.items():
                if value is not None:
                    records = [r for r in records if r.get(key) == value]

        total = len(records)

        # Sort
        records.sort(key=lambda r: r.get(sort_by, ""), reverse=sort_desc)

        # Paginate
        start = (page - 1) * per_page
        records = records[start : start + per_page]

        return records, total

    def find_by_id(self, record_id: str) -> dict | None:
        records = self._read()
        return next((r for r in records if r.get("id") == record_id), None)

    def find_one(self, **kwargs) -> dict | None:
        records = self._read()
        for r in records:
            if all(r.get(k) == v for k, v in kwargs.items()):
                return r
        return None

    def create(self, data: dict) -> dict:
        records = self._read()
        now = datetime.now(timezone.utc).isoformat()
        data["id"] = str(uuid.uuid4())
        data["created_at"] = now
        data["updated_at"] = now
        records.append(data)
        self._write(records)
        return data

    def update(self, record_id: str, data: dict) -> dict | None:
        records = self._read()
        for i, r in enumerate(records):
            if r.get("id") == record_id:
                data["updated_at"] = datetime.now(timezone.utc).isoformat()
                records[i] = {**r, **data}
                self._write(records)
                return records[i]
        return None

    def delete(self, record_id: str) -> bool:
        records = self._read()
        initial_len = len(records)
        records = [r for r in records if r.get("id") != record_id]
        if len(records) < initial_len:
            self._write(records)
            return True
        return False

    def count(self, filters: dict | None = None) -> int:
        records = self._read()
        if filters:
            for key, value in filters.items():
                if value is not None:
                    records = [r for r in records if r.get(key) == value]
        return len(records)

    def search(self, query: str, fields: list[str], page: int = 1, per_page: int = 20) -> tuple[list[dict], int]:
        """Full-text search across specified fields."""
        records = self._read()
        q = query.lower()
        matched = [
            r for r in records
            if any(q in str(r.get(f, "")).lower() for f in fields)
        ]
        total = len(matched)
        start = (page - 1) * per_page
        return matched[start : start + per_page], total
