from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db
from app.schemas.user import UserCreate, UserOut
from app.crud.user import create_user, authenticate_user, get_user_by_email
from app.utils.security import create_access_token
from datetime import timedelta
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = create_user(db, user.email, user.password, user.full_name, user.phone)
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # TEMP: Allow login for test@example.com with any password
    if form_data.username == "test@example.com":
        fake_user = {
            "id": 1,
            "email": "test@example.com",
            "full_name": "Test User",
            "phone": "0000000000"
        }
        access_token = create_access_token(
            data={"sub": fake_user["email"]},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer", "user": fake_user}
    # Normal logic for all other users
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "phone": user.phone}}
