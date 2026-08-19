from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from students.models import Student

SAMPLE_STUDENTS = [
    ("aisha.khan",     "Aisha",   "Khan",     "STU001", "2005-03-14"),
    ("bilal.ahmed",    "Bilal",   "Ahmed",    "STU002", "2004-11-02"),
    ("sara.malik",     "Sara",    "Malik",    "STU003", "2005-07-21"),
    ("hamza.raza",     "Hamza",   "Raza",     "STU004", "2004-09-30"),
    ("zainab.iqbal",   "Zainab",  "Iqbal",    "STU005", "2005-01-17"),
    ("omar.farooq",    "Omar",    "Farooq",   "STU006", "2004-05-09"),
    ("fatima.sheikh",  "Fatima",  "Sheikh",   "STU007", "2005-12-03"),
    ("ali.hassan",     "Ali",     "Hassan",   "STU008", "2004-08-25"),
    ("mariam.qureshi", "Mariam",  "Qureshi",  "STU009", "2005-02-11"),
    ("usman.tariq",    "Usman",   "Tariq",    "STU010", "2004-06-19"),
    ("hira.abbasi",    "Hira",    "Abbasi",   "STU011", "2005-10-08"),
    ("saad.mirza",     "Saad",    "Mirza",    "STU012", "2004-04-27"),
    ("noor.chaudhry",  "Noor",    "Chaudhry", "STU013", "2005-09-15"),
    ("hassan.baig",    "Hassan",  "Baig",     "STU014", "2004-12-22"),
    ("ayesha.siddiqui","Ayesha",  "Siddiqui", "STU015", "2005-05-06"),
]

DEFAULT_PASSWORD = "Student@123"


class Command(BaseCommand):
    help = "Seeds the database with a sample directory of students (safe to re-run)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default=DEFAULT_PASSWORD,
            help="Password to set for every seeded student (default: Student@123)",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]
        created, skipped = [], []

        for username, first, last, student_id, dob in SAMPLE_STUDENTS:
            if User.objects.filter(username=username).exists():
                skipped.append(username)
                continue

            user = User.objects.create_user(
                username=username,
                email=f"{username}@example.com",
                password=password,
                first_name=first,
                last_name=last,
                role="student",
            )
            Student.objects.create(user=user, student_id=student_id, date_of_birth=dob)
            created.append(username)

        self.stdout.write(self.style.SUCCESS(f"\nCreated {len(created)} student(s)."))
        if skipped:
            self.stdout.write(self.style.WARNING(f"Skipped {len(skipped)} (already existed): {', '.join(skipped)}"))

        if created:
            self.stdout.write("\nLogin credentials for new students:")
            self.stdout.write(f"  password: {password}\n")
            for username in created:
                self.stdout.write(f"  {username}")
                