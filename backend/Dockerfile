# backend/Dockerfile
#
# Purpose:
#   Builds the Python backend using a slim Python image.
#
# Inputs:
#   - requirements.txt: lists all Python dependencies.
#   - All source files in the backend directory.
#
# Outputs:
#   - A Docker image that runs the FastAPI app using Uvicorn.
#
# Guardrails:
#   - Exposes port 8000 for the application.
FROM python:3.9-slim

# Set working directory in the container
WORKDIR /app

# Copy the dependency list and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend source code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run the application using uvicorn. Adjust "app:app" if your main module is named differently.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]