FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model (optional - will download at runtime if missing)
RUN python -m spacy download en_core_web_sm || echo "SpaCy model will be downloaded at runtime"

# Copy application
COPY app/ ./app/

# Create non-root user
RUN useradd -m -u 1000 aiengine && chown -R aiengine:aiengine /app
USER aiengine

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
