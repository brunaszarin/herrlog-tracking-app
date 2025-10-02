# Herrlog Tracking App  

Fullstack application for **vehicle registration and tracking**.  
This project was developed as part of the Herrlog Solutions Front-End Focus Test.  

The system allows:  
- 🚗 Vehicle registration (CRUD operations)  
- 📂 Upload and processing of JSON tracking data  
- 🗺️ Display of vehicle routes on a map  



## 📌 Project Requirements  
According to the provided specification, the project must:  
- **Backend**: Python (FastAPI or Flask, RESTful API)  
- **Frontend**: React  
- **Database**: SQL Server  



## ⚙️ Tech Stack  
- **Frontend**: React (with routing, components, and map visualization)  
- **Backend**: Python (FastAPI recommended for RESTful APIs)  
- **Database**: SQL Server (via pyodbc or SQLAlchemy)  
- **Map library**: Leaflet / Google Maps API / Mapbox  



## 📂 Project Structure  

```
herrlog-tracking-app/
│── README.md
│── .gitignore
│── backend/             # RESTful API in Python
│   ├── src/
│   │   ├── controllers/ # Business logic (CRUD, JSON upload)
│   │   ├── models/      # ORM models (Vehicle, Location)
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # JSON processing, extra logic
│   │   └── database/    # SQL Server connection
│   ├── tests/           # Backend tests (pytest)
│   ├── requirements.txt # Python dependencies
│   └── main.py          # FastAPI/Flask entry point
│
│── frontend/            # React application
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Pages (Home, Vehicles, Map)
│   │   ├── services/    # API communication
│   │   ├── hooks/       # Custom hooks
│   │   └── styles/      # CSS / styled-components
│   ├── package.json
│
│── database/            # SQL Server scripts
│   ├── schema.sql       # Database schema
│   ├── seed.sql         # Sample data
│
│── docs/                # Extra documentation
│   └── requirements.md  # Project requirements (from Herrlog)
```



## 🚀 Getting Started  

### 1. Clone repository  
```bash
git clone https://github.com/<brunaszarin>/herrlog-tracking-app.git
cd herrlog-tracking-app
```

### 2. Backend setup (Python with FastAPI example)  
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows

pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend setup (React)  
```bash
cd frontend
npm install
npm start
```

### 4. Database (SQL Server)  
- Import `database/schema.sql`  
- Optionally seed with `database/seed.sql`  

---

## ✅ Delivery Instructions  
- The application must be uploaded to a **public GitHub repository**.  
- Notify Herrlog team by email at: **suporte@herrlog.com**.  

---

## 📝 License  
This project is licensed under the **MIT License**.  
