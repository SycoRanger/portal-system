FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD sh -c "\
    python manage.py migrate --noinput; \
    python manage.py ensure_superuser; \
    python manage.py seed_teachers || true; \
    python manage.py seed_students || true; \
    python manage.py seed_courses || true; \
    gunicorn core.wsgi --bind 0.0.0.0:8000 --workers 2 --log-level debug --access-logfile - --error-logfile -"