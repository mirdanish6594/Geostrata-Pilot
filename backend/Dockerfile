# Use Python 3.9
FROM python:3.9

# Set working directory
WORKDIR /code

# Copy requirements and install them
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the rest of the app code
COPY . /code

# Run the app (Hugging Face expects port 7860)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]