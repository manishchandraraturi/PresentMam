"""initial_empty

Revision ID: ce49cbdc091f
Revises: None
Create Date: 2026-10-15 14:16:56.347677

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "ce49cbdc091f"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema - empty initial migration."""


def downgrade() -> None:
    """Downgrade schema - empty initial migration."""
