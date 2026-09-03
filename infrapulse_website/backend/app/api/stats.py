from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.models.complaint import Complaint
from app.schemas.stats import CategoryStats, SystemStatsResponse
from app.core.dependencies import get_current_principal, AuthenticatedPrincipal

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/summary", response_model=SystemStatsResponse)
async def get_system_summary(
    principal: AuthenticatedPrincipal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db)
):
    categories = ["Structural", "Functional", "Performance"]
    cat_stats: List[CategoryStats] = []
    
    total_complaints_res = await db.execute(select(func.count(Complaint.id)))
    total_complaints = total_complaints_res.scalar_one()

    for cat in categories:
        total_res = await db.execute(
            select(func.count(Complaint.id)).where(Complaint.category.ilike(cat))
        )
        total = total_res.scalar_one()

        sub_res = await db.execute(
            select(func.count(Complaint.id)).where(
                and_(Complaint.category.ilike(cat), Complaint.status == "SUBMITTED")
            )
        )
        submitted = sub_res.scalar_one()

        ass_res = await db.execute(
            select(func.count(Complaint.id)).where(
                and_(Complaint.category.ilike(cat), Complaint.status == "ASSIGNED")
            )
        )
        assigned = ass_res.scalar_one()

        prog_res = await db.execute(
            select(func.count(Complaint.id)).where(
                and_(Complaint.category.ilike(cat), Complaint.status == "IN_PROGRESS")
            )
        )
        in_progress = prog_res.scalar_one()

        res_res = await db.execute(
            select(func.count(Complaint.id)).where(
                and_(Complaint.category.ilike(cat), Complaint.status == "RESOLVED")
            )
        )
        resolved = res_res.scalar_one()

        avg_pri_res = await db.execute(
            select(func.avg(Complaint.priority_score)).where(
                and_(Complaint.category.ilike(cat), Complaint.ai_status == "COMPLETED")
            )
        )
        avg_pri = avg_pri_res.scalar_one_or_none()

        cat_stats.append(
            CategoryStats(
                category=cat,
                total=total,
                submitted=submitted,
                assigned=assigned,
                in_progress=in_progress,
                resolved=resolved,
                avg_priority_score=round(avg_pri, 2) if avg_pri is not None else None
            )
        )

    return SystemStatsResponse(
        total_complaints=total_complaints,
        categories=cat_stats
    )
