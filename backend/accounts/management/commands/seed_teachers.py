from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from teachers.models import Teacher

SAMPLE_TEACHERS = [
    ("m.rizvi",   "Mehreen", "Rizvi",   "TCH001", "Computer Science"),
    ("a.hussain", "Adeel",   "Hussain", "TCH002", "Mathematics"),
    ("s.jamil",   "Sana",    "Jamil",   "TCH003", "Physics"),
    ("k.nawaz",   "Kamran",  "Nawaz",   "TCH004", "English"),
    ("r.farooqi", "Rabia",   "Farooqi", "TCH005", "Chemistry"),
    ("t.aslam",   "Tariq",   "Aslam",   "TCH006", "Computer Science"),
    ("n.yousuf",  "Nadia",   "Yousuf",  "TCH007", "Business Studies"),
    ("f.shah",    "Faisal",  "Shah",    "TCH008", "Mathematics"),
]

DEFAULT_PASSWORD = "Teacher@123"


class Command(BaseCommand):
    help = "Seeds the database with a sample directory of teachers (safe to re-run)."

    def add_arguments(self, parser):
        parser.add_argument("--password", default=DEFAULT_PASSWORD)

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]
        created, skipped = [], []

        for username, first, last, teacher_id, dept in SAMPLE_TEACHERS:
            if User.objects.filter(username=username).exists():
                skipped.append(username)
                continue

            user = User.objects.create_user(
                username=username,
                email=f"{username}@example.com",
                password=password,
                first_name=first,
                last_name=last,
                role="teacher",
            )
            Teacher.objects.create(user=user, teacher_id=teacher_id, department=dept)
            created.append(username)

        self.stdout.write(self.style.SUCCESS(f"\nCreated {len(created)} teacher(s)."))
        if skipped:
            self.stdout.write(self.style.WARNING(f"Skipped {len(skipped)} (already existed): {', '.join(skipped)}"))

        if created:
            self.stdout.write("\nLogin credentials for new teachers:")
            self.stdout.write(f"  password: {password}\n")
            for username in created:
                self.stdout.write(f"  {username}")