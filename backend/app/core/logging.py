import logging
from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import engine
from app.models.SQLmodels import AuditLog

logger = logging.getLogger(__name__)


def log_activity(user_id, action, method, path, ip, status):
    try:
        with Session(engine) as session:
            log = AuditLog(
                user_id=user_id,
                action=action,
                method=method,
                path=path,
                ip_address=ip,
                status_code=status,
            )
            session.add(log)
            session.commit()
    except SQLAlchemyError as e:
        logger.error(f"Audit log failed to save: {e}")
