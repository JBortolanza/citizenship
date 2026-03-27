# 1. Use a lightweight Python base
FROM python:3.11-slim

# 2. Define the working directory inside the container
WORKDIR /code

# 3. Optimization: prevent .pyc files and enable real-time logs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 4. Install Postgres dependencies (necessary for psycopg2)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Python libraries
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy your code into the container
COPY . .

# 7. Start the server
# Because WORKDIR is /code, uvicorn finds the 'app' folder easily
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]