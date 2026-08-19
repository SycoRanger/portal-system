FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD sh -c "\
    python manage.py migrate && \
    (python manage.py createsuperuser --noinput || true) && \
    python manage.py seed_teachers && \
    python manage.py seed_students && \
    python manage.py seed_courses && \
    gunicorn core.wsgi --bind 0.0.0.0:${PORT:-8000}"
