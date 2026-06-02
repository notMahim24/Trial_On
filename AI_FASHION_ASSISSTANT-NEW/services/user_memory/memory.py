# ==============================
# USER MEMORY SYSTEM (FastAPI-compatible)
# Session state is stored per-request in a simple dict.
# For multi-user production use, replace with Redis or DB.
# ==============================

# Module-level memory store (works for single-user/dev; upgrade for prod)
_user_memory: dict = {}

def load_memory() -> dict:
    return _user_memory


def save_memory(data: dict):
    global _user_memory
    _user_memory = data


def update_user_memory(new_data: dict) -> dict:
    memory = load_memory()
    # Filter out empty/null values so we don't overwrite good data with None
    valid_new_data = {k: v for k, v in new_data.items() if v is not None}
    memory.update(valid_new_data)
    save_memory(memory)
    return memory


def get_user_memory() -> dict:
    return load_memory()


def reset_user_memory():
    """Call this at the start of a new conversation if needed."""
    global _user_memory
    _user_memory = {}