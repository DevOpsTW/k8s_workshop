FROM python:3.8.5

EXPOSE 5000

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ./app /app

RUN echo VERSION=\'`date +%Y%m%d_%H%M%S`\' > /app/build-date.txt

WORKDIR /app

CMD ["python", "main.py"]
