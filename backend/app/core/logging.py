from app.core.database import engine
from app.models.SQLmodels import AuditLog
from sqlmodel import Session

def log_activity(user_id, action, method, path, ip, status):
    with Session(engine) as session:
        log = AuditLog(
            user_id=user_id, action=action, method=method, 
            path=path, ip_address=ip, status_code=status
        )
        session.add(log)
        session.commit()