import { useMemo } from 'react'
import { Download, FileBarChart2 } from 'lucide-react'
import { studentsApi, coursesApi, groupsApi, studentEnrollmentsApi, gradesApi, gradeExamsApi } from '../api/resources'
import { useResource } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import { exportToCsv } from '../lib/csv'
import { formatCurrency } from '../lib/format'

export default function Reports() {
  const { items: courses, loading: lCourses } = useResource(coursesApi)
  const { items: groups, loading: lGroups } = useResource(groupsApi)
  const { items: enrollments, loading: lEnrollments } = useResource(studentEnrollmentsApi)
  const { items: grades } = useResource(gradesApi)
  const { items: examGrades } = useResource(gradeExamsApi)

  const groupReport = useMemo(
    () =>
      groups.map((g) => {
        const roster = enrollments.filter((e) => e.group?.id === g.id)
        return {
          id: g.id,
          name: g.name,
          course: g.course?.name,
          branch: g.branch,
          enrolled: roster.length,
          active: roster.filter((e) => e.status === 'ACTIVE').length,
          status: g.status,
        }
      }),
    [groups, enrollments]
  )

  const courseReport = useMemo(
    () =>
      courses.map((c) => {
        const courseGroups = groups.filter((g) => g.course?.id === c.id)
        const enrolled = enrollments.filter((e) => courseGroups.some((g) => g.id === e.group?.id)).length
        return {
          id: c.id,
          name: c.name,
          price: Number(c.price) || 0,
          groups: courseGroups.length,
          enrolled,
          potential: (Number(c.price) || 0) * enrolled,
        }
      }),
    [courses, groups, enrollments]
  )

  const gradeReport = useMemo(() => {
    const byGroup = new Map()
    ;[...grades, ...examGrades].forEach((g) => {
      if (!g.group) return
      const key = g.group.id
      const entry = byGroup.get(key) ?? { group: g.group, scores: [] }
      entry.scores.push(Number(g.grade) || 0)
      byGroup.set(key, entry)
    })
    return Array.from(byGroup.values()).map((e) => ({
      id: e.group.id,
      name: e.group.name,
      count: e.scores.length,
      avg: e.scores.reduce((a, b) => a + b, 0) / e.scores.length,
      min: Math.min(...e.scores),
      max: Math.max(...e.scores),
    }))
  }, [grades, examGrades])

  const loading = lCourses || lGroups || lEnrollments

  return (
    <div>
      <PageHeader title="Reports" subtitle="Derived summaries across groups, courses and grades — export any table as CSV." />

      <div className="space-y-6">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Students per group</h3>
              <p className="text-xs text-slate-400">Enrollment headcount for every group</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToCsv('students-per-group', groupReport.map(({ id, ...rest }) => rest))}
              disabled={groupReport.length === 0}
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
          <Table
            loading={loading}
            data={groupReport}
            emptyTitle="No groups yet"
            columns={[
              { key: 'name', header: 'Group' },
              { key: 'course', header: 'Course' },
              { key: 'branch', header: 'Branch' },
              { key: 'enrolled', header: 'Enrolled' },
              { key: 'active', header: 'Active' },
              { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status ? 'success' : 'neutral'}>{r.status ? 'Active' : 'Inactive'}</Badge> },
            ]}
          />
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Course catalog</h3>
              <p className="text-xs text-slate-400">Price, group count and potential revenue (price × enrollments)</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToCsv('course-catalog', courseReport.map(({ id, ...rest }) => rest))}
              disabled={courseReport.length === 0}
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
          <Table
            loading={loading}
            data={courseReport}
            emptyTitle="No courses yet"
            columns={[
              { key: 'name', header: 'Course' },
              { key: 'price', header: 'Price', render: (r) => formatCurrency(r.price) },
              { key: 'groups', header: 'Groups' },
              { key: 'enrolled', header: 'Enrolled' },
              { key: 'potential', header: 'Potential revenue', render: (r) => formatCurrency(r.potential) },
            ]}
          />
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Grade summary by group</h3>
              <p className="text-xs text-slate-400">Combines coursework and exam grades</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToCsv('grade-summary', gradeReport.map(({ id, ...rest }) => rest))}
              disabled={gradeReport.length === 0}
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
          <Table
            data={gradeReport}
            emptyTitle="No grades recorded"
            emptyDescription="Grade summaries will appear once scores are entered."
            columns={[
              { key: 'name', header: 'Group', render: (r) => <span className="flex items-center gap-2"><FileBarChart2 className="h-4 w-4 text-slate-300" />{r.name}</span> },
              { key: 'count', header: 'Graded entries' },
              { key: 'avg', header: 'Average', render: (r) => r.avg.toFixed(1) },
              { key: 'min', header: 'Lowest' },
              { key: 'max', header: 'Highest' },
            ]}
          />
        </Card>
      </div>
    </div>
  )
}
