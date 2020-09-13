FROM python:3.8.5

EXPOSE 5000

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ./app /app

WORKDIR /app
CMD ["python", "main.py"]
