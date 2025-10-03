from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plate = Column(String(10), unique=True, nullable=False)
    brand = Column(String(50), nullable=True)
    model = Column(String(50), nullable=False)
    year = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<Vehicle id={self.id} plate={self.plate} brand={self.brand} model={self.model} year={self.year}>"
        