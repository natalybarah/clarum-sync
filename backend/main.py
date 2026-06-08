
from routes.cases import router as cases_router
from routes.notices import router as notices_router
from routes.auth import router as auth_router
from routes.emails import router as emails_router
from routes.calendar import router as calendar_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# /---------------------------------------------------- Instances ------------------------------------------------------------/

app= FastAPI()
app.include_router(cases_router)
app.include_router(notices_router)
app.include_router(auth_router)
app.include_router(emails_router)
app.include_router(calendar_router)


# /--------------------------------------------------- CORS Middleware -------------------------------------------------------/

# Middleware that allows the backend to connect with a different port - local host for fronted

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://clarum-sync.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# /--------------------------------------------------- Home Endpoint ---------------------------------------------------------/

# Home path for tests

@app.get("/")
def home():
    return {"message": "CORS ENABLED"}

