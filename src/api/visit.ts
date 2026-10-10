import request from './request'

export interface VisitSummary {
  totalPv: number
  todayPv: number
  todayUv: number
}

export interface VisitReport {
  eventId: string
  visitorId: string
  path: string
}

export const getVisitSummary = (): Promise<VisitSummary> =>
  request.get<VisitSummary, VisitSummary>('/web/visit/summary')

export const reportVisit = (data: VisitReport): Promise<VisitSummary> =>
  request.post<VisitSummary, VisitSummary>('/web/visit/report', data)
