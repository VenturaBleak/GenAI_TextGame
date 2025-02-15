# ./backend/Dockerfile
# Use an official Python runtime as a parent image.
FROM python:3.11-slim

# Prevent Python from writing .pyc files to disk and enable unbuffered stdout/stderr.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory to /app.
WORKDIR /app

# Copy and install dependencies.
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the backend code into the container.
COPY . /app/

# Expose the port FastAPI will run on.
EXPOSE 8000

# Run the FastAPI app using uvicorn.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]