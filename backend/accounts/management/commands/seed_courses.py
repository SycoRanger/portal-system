from django.core.management.base import BaseCommand
from django.db import transaction
from teachers.models import Teacher
from students.models import Student
from courses.models import Course, Enrollment

SAMPLE_COURSES = [
    ("CS101", "Introduction to Programming",  "TCH001", 3),
    ("CS201", "Data Structures & Algorithms", "TCH006", 4),
    ("MATH101", "Calculus I",                 "TCH002", 3),
    ("MATH201", "Linear Algebra",             "TCH008", 3),
    ("PHY101", "General Physics",             "TCH003", 4),
    ("ENG101", "English Composition",         "TCH004", 2),
    ("CHEM101", "General Chemistry",          "TCH005", 4),
    ("BUS101", "Principles of Business",      "TCH007", 3),
]


class Command(BaseCommand):
    help = "Seeds sample courses (assigned to seeded teachers) and enrolls all existing students. Safe to re-run."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-enroll",
            action="store_true",
            help="Skip enrolling existing students into the seeded courses.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        created, skipped = [], []

        for code, name, teacher_id, credits in SAMPLE_COURSES:
            if Course.objects.filter(code=code).exists():
                skipped.append(code)
                continue
            teacher = Teacher.objects.filter(teacher_id=teacher_id).first()
            Course.objects.create(code=code, name=name, teacher=teacher, credit_hours=credits)
            created.append(code)

        self.stdout.write(self.style.SUCCESS(f"\nCreated {len(created)} course(s)."))
        if skipped:
            self.stdout.write(self.style.WARNING(f"Skipped {len(skipped)} (already existed): {', '.join(skipped)}"))

        missing_teachers = [c for c, _, t, _ in SAMPLE_COURSES if not Teacher.objects.filter(teacher_id=t).exists()]
        if missing_teachers:
            self.stdout.write(self.style.WARNING(
                "\nNote: some courses have no matching teacher yet — run 'seed_teachers' first, "
                "then re-run this command to auto-assign them."
            ))

        if not options["no_enroll"]:
            students = Student.objects.all()
            courses = Course.objects.filter(code__in=[c for c, *_ in SAMPLE_COURSES])
            enrolled_count = 0
            for student in students:
                for course in courses:
                    _, was_created = Enrollment.objects.get_or_create(student=student, course=course)
                    if was_created:
                        enrolled_count += 1
            self.stdout.write(self.style.SUCCESS(f"Enrolled students into courses ({enrolled_count} new enrollment(s))."))
            if students.count() == 0:
                self.stdout.write(self.style.WARNING("No students found — run 'seed_students' first to enable enrollment."))