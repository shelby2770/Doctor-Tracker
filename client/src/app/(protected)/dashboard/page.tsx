"use client";

import {
  Activity,
  CalendarPlus,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { DonutChart } from "@/components/charts/donut-chart";
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/ui/stat-card";
import { useDashboard } from "@/hooks/queries/use-dashboard";
import { STATUS_COLORS } from "@/lib/chart-colors";

function ChartLoader() {
  return (
    <div className="flex h-[260px] items-center justify-center text-surface-400">
      <Spinner className="h-6 w-6 text-primary-500" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="An overview of your doctors, patients and recent activity."
      />

      {isError ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="Couldn't load analytics"
            description="Please check that the API server is running and try again."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Doctors"
              value={data?.totals.doctors ?? 0}
              icon={Stethoscope}
              accent="primary"
              isLoading={isLoading}
            />
            <StatCard
              label="Total Patients"
              value={data?.totals.patients ?? 0}
              icon={Users}
              accent="sky"
              isLoading={isLoading}
            />
            <StatCard
              label="Avg. Patients / Doctor"
              value={data?.totals.avgPatientsPerDoctor ?? 0}
              icon={TrendingUp}
              accent="emerald"
              isLoading={isLoading}
            />
            <StatCard
              label="New Patients (This Month)"
              value={data?.totals.newPatientsThisMonth ?? 0}
              icon={CalendarPlus}
              accent="amber"
              isLoading={isLoading}
            />
          </div>

          {/* Trend + status */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Registrations over time"
                subtitle="New doctors and patients in the last 6 months"
              />
              <CardBody>
                {isLoading ? (
                  <ChartLoader />
                ) : data && data.timeseries.length > 0 ? (
                  <TrendChart data={data.timeseries} />
                ) : (
                  <EmptyState title="No data yet" />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Patients by status"
                subtitle="Current distribution"
              />
              <CardBody>
                {isLoading ? (
                  <ChartLoader />
                ) : data && data.patientsByStatus.length > 0 ? (
                  <DonutChart data={data.patientsByStatus} colorMap={STATUS_COLORS} />
                ) : (
                  <EmptyState title="No patients yet" />
                )}
              </CardBody>
            </Card>
          </div>

          {/* Top doctors + condition + specialization */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader
                title="Top doctors"
                subtitle="By number of patients"
              />
              <CardBody>
                {isLoading ? (
                  <ChartLoader />
                ) : data && data.topDoctorsByPatients.length > 0 ? (
                  <HorizontalBarChart
                    data={data.topDoctorsByPatients.map((d) => ({
                      name: d.name.replace(/^Dr\.\s*/, ""),
                      value: d.patients,
                    }))}
                    color="#0d9488"
                  />
                ) : (
                  <EmptyState title="No data yet" />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Patients by condition"
                subtitle="Most common conditions"
              />
              <CardBody>
                {isLoading ? (
                  <ChartLoader />
                ) : data && data.patientsByCondition.length > 0 ? (
                  <DonutChart data={data.patientsByCondition} />
                ) : (
                  <EmptyState title="No data yet" />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Patients by specialization"
                subtitle="Across all doctors"
              />
              <CardBody>
                {isLoading ? (
                  <ChartLoader />
                ) : data && data.patientsBySpecialization.length > 0 ? (
                  <HorizontalBarChart
                    data={data.patientsBySpecialization}
                    color="#6366f1"
                  />
                ) : (
                  <EmptyState title="No data yet" />
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
