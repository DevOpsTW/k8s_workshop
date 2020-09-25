FROM locustio/locust

COPY locustfile.py /mnt/locust/locustfile.py

ENTRYPOINT ["locust", "-f", "/mnt/locust/locustfile.py"]