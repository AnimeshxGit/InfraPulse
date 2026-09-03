"""Initial database schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-03 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="USER"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users"))
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # 2. staff table
    op.create_table(
        "staff",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="STAFF"),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_staff"))
    )
    op.create_index(op.f("ix_staff_username"), "staff", ["username"], unique=True)
    op.create_index(op.f("ix_staff_email"), "staff", ["email"], unique=True)
    op.create_index(op.f("ix_staff_category"), "staff", ["category"], unique=False)

    # 3. complaints table
    op.create_table(
        "complaints",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("name_snapshot", sa.String(length=255), nullable=False),
        sa.Column("address", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("image_uri", sa.String(length=500), nullable=False),
        
        sa.Column("ai_status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("detected_defect", sa.String(length=100), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        
        sa.Column("visible_extent_ratio", sa.Float(), nullable=True),
        sa.Column("visible_extent_percentage", sa.Float(), nullable=True),
        sa.Column("extent_label", sa.String(length=50), nullable=True),
        sa.Column("extent_score", sa.Integer(), nullable=True),
        
        sa.Column("severity_score", sa.Float(), nullable=True),
        sa.Column("severity", sa.String(length=50), nullable=True),
        
        sa.Column("priority_score", sa.Float(), nullable=True),
        sa.Column("priority_level", sa.String(length=50), nullable=True),
        
        sa.Column("classifier_inference_ms", sa.Float(), nullable=True),
        sa.Column("pipeline_time_ms", sa.Float(), nullable=True),
        
        sa.Column("status", sa.String(length=50), nullable=False, server_default="SUBMITTED"),
        sa.Column("assigned_staff_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        
        sa.Column("error_code", sa.String(length=100), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        
        sa.ForeignKeyConstraint(["assigned_staff_id"], ["staff.id"], name=op.f("fk_complaints_assigned_staff_id_staff"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_complaints_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_complaints"))
    )
    op.create_index(op.f("ix_complaints_user_id"), "complaints", ["user_id"], unique=False)
    op.create_index(op.f("ix_complaints_ai_status"), "complaints", ["ai_status"], unique=False)
    op.create_index(op.f("ix_complaints_category"), "complaints", ["category"], unique=False)
    op.create_index(op.f("ix_complaints_status"), "complaints", ["status"], unique=False)
    op.create_index(op.f("ix_complaints_priority_score"), "complaints", ["priority_score"], unique=False)
    op.create_index(op.f("ix_complaints_created_at"), "complaints", ["created_at"], unique=False)
    
    op.create_index(
        "ix_complaints_queue_ordering",
        "complaints",
        ["category", "ai_status", "status", "priority_score", "severity_score", "confidence", "created_at"],
        unique=False
    )

    # 4. status_history table
    op.create_table(
        "status_history",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("complaint_id", sa.String(length=36), nullable=False),
        sa.Column("from_status", sa.String(length=50), nullable=False),
        sa.Column("to_status", sa.String(length=50), nullable=False),
        sa.Column("changed_by_id", sa.String(length=36), nullable=False),
        sa.Column("changed_by_role", sa.String(length=50), nullable=False),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["complaint_id"], ["complaints.id"], name=op.f("fk_status_history_complaint_id_complaints"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_status_history"))
    )
    op.create_index(op.f("ix_status_history_complaint_id"), "status_history", ["complaint_id"], unique=False)

def downgrade() -> None:
    op.drop_table("status_history")
    op.drop_table("complaints")
    op.drop_table("staff")
    op.drop_table("users")
