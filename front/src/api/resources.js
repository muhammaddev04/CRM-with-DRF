import { api } from './client'

// Thin wrappers around the exact CRM endpoints defined in crm/urls.py.
// Every path below is copied verbatim from the backend router — nothing invented.
function makeResource({ list, detail, create, update, remove }) {
  return {
    list: (params) => api.get(list, { params }).then((res) => res.data),
    get: (id) => api.get(detail(id)).then((res) => res.data),
    create: (payload) => api.post(create, payload).then((res) => res.data),
    update: (id, payload) => api.patch(update(id), payload).then((res) => res.data),
    remove: (id) => api.delete(remove(id)).then((res) => res.data),
  }
}

export const studentsApi = makeResource({
  list: '/students/',
  detail: (id) => `/student/${id}/`,
  create: '/student-create/',
  update: (id) => `/student-update/${id}/`,
  remove: (id) => `/student-delete/${id}/`,
})

// GET /student-detail/<id>/ — StudentDetailSerializer: profile + enrollments,
// lesson/exam grades, activities and precomputed stats in one response.
export const studentDetailApi = {
  get: (id) => api.get(`/student-detail/${id}/`).then((res) => res.data),
}

export const mentorsApi = makeResource({
  list: '/mentors/',
  detail: (id) => `/mentor/${id}/`,
  create: '/mentor-create/',
  update: (id) => `/mentor-update/${id}/`,
  remove: (id) => `/mentor-delete/${id}/`,
})

export const coursesApi = makeResource({
  list: '/courses/',
  detail: (id) => `/course/${id}/`,
  create: '/course-create/',
  update: (id) => `/course-update/${id}/`,
  remove: (id) => `/course-delete/${id}/`,
})

export const groupsApi = makeResource({
  list: '/groups/',
  detail: (id) => `/group/${id}/`,
  create: '/group-create/',
  update: (id) => `/group-update/${id}/`,
  remove: (id) => `/group-delete/${id}/`,
})

export const studentEnrollmentsApi = makeResource({
  list: '/student-enrolls/',
  detail: (id) => `/student-enroll/${id}/`,
  create: '/student-enroll-create/',
  update: (id) => `/student-enroll-update/${id}/`,
  remove: (id) => `/student-enroll-delete/${id}/`,
})

export const mentorEnrollmentsApi = makeResource({
  list: '/mentor-enrolls/',
  detail: (id) => `/mentor-enroll/${id}/`,
  create: '/mentor-enroll-create/',
  update: (id) => `/mentor-enroll-update/${id}/`,
  remove: (id) => `/mentor-enroll-delete/${id}/`,
})

export const timetableApi = makeResource({
  list: '/timetables/',
  detail: (id) => `/timetable/${id}/`,
  create: '/timetable-create/',
  update: (id) => `/timetable-update/${id}/`,
  remove: (id) => `/timetable-delete/${id}/`,
})

export const activitiesApi = makeResource({
  list: '/activities/',
  detail: (id) => `/activity/${id}/`,
  create: '/activity-create/',
  update: (id) => `/activity-update/${id}/`,
  remove: (id) => `/activity-delete/${id}/`,
})

export const gradesApi = makeResource({
  list: '/grades/',
  detail: (id) => `/grade/${id}/`,
  create: '/grade-create/',
  update: (id) => `/grade-update/${id}/`,
  remove: (id) => `/grade-delete/${id}/`,
})

export const gradeExamsApi = makeResource({
  list: '/grade-exams/',
  detail: (id) => `/grade-exam/${id}/`,
  create: '/grade-exam-create/',
  update: (id) => `/grade-exam-update/${id}/`,
  remove: (id) => `/grade-exam-delete/${id}/`,
})
