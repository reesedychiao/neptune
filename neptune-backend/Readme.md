## Backend Installation and Startup

### PostgreSQL Installation and Setup

1. Install PostgreSQL using Homebrew:
    ```bash
    brew install postgresql@14
    brew services start postgresql@14
    ```

2. Create database and user:
    ```bash
    psql postgres
    # Inside PostgreSQL shell
    CREATE USER adi WITH PASSWORD 'yourpassword';
    CREATE DATABASE neptune;
    GRANT ALL PRIVILEGES ON DATABASE neptune TO adi;
    \q
    ```

3. Create .env file:
    ```bash
    # Create the file
    touch .env

    # Add database connection string
    echo "DATABASE_URL=postgresql://adi:yourpassword@localhost:5432/neptune" > .env
    ```

4. Install Python dependencies:
    ```bash
    pip install fastapi uvicorn sqlalchemy psycopg2-binary asyncpg pydantic alembic python-dotenv
    ```

5. Initialize Alembic:
    ```bash
    alembic init alembic
    ```

6. Generate migration files:
    ```bash
    alembic revision --autogenerate -m "Initial migration"
    ```

7. Apply migration:
    ```bash
    alembic upgrade head
    ```

8. Starting the server:
    ```bash
    uvicorn app.main:app --reload
    ```

9. Access API documentation:
    ```
    http://localhost:8000/docs
    ```