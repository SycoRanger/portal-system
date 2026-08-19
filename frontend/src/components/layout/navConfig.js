import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck, Award, KeyRound,
} from 'lucide-react';

export const NAV_BY_ROLE = {
  admin: [
    { section: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
    {
      section: 'Administration',
      items: [
        { to: '/admin/students', label: 'Students', icon: Users },
        { to: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
        { to: '/admin/courses', label: 'Courses', icon: BookOpen },
      ],
    },
    { section: 'Account', items: [{ to: '/change-password', label: 'Change Password', icon: KeyRound }] },
  ],
  teacher: [
    { section: 'Overview', items: [{ to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
    {
      section: 'Classroom',
      items: [
        { to: '/teacher/attendance', label: 'Attendance', icon: ClipboardCheck },
        { to: '/teacher/grades', label: 'Grades', icon: Award },
      ],
    },
    { section: 'Account', items: [{ to: '/change-password', label: 'Change Password', icon: KeyRound }] },
  ],
  student: [
    { section: 'Overview', items: [{ to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
    { section: 'Account', items: [{ to: '/change-password', label: 'Change Password', icon: KeyRound }] },
  ],
};

export const ROLE_LABEL = { admin: 'Administrator', teacher: 'Teacher', student: 'Student' };
