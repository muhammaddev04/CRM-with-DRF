import {
  LayoutDashboard,
  GraduationCap,
  UserCog,
  BookOpen,
  Layers,
  ClipboardList,
  CalendarDays,
  NotebookPen,
  Award,
  FileBarChart2,
  Settings,
  UserCircle,
} from 'lucide-react'

export const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/students', label: 'Students', icon: GraduationCap },
  { to: '/app/mentors', label: 'Mentors', icon: UserCog },
  { to: '/app/courses', label: 'Courses', icon: BookOpen },
  { to: '/app/groups', label: 'Groups', icon: Layers },
  { to: '/app/enrollments', label: 'Enrollments', icon: ClipboardList },
  { to: '/app/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/app/activity', label: 'Activity', icon: NotebookPen },
  { to: '/app/grades', label: 'Grades', icon: Award },
  { to: '/app/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/profile', label: 'Profile', icon: UserCircle },
]
