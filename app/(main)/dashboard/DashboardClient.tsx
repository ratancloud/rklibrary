"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CalendarDays,
  Clock,
  Layers,
  ArrowRight,
  Receipt,
  UserPlus,
  Home,
  Eye,
  EyeOff,
  Phone,
} from "lucide-react";
import MonthPicker from "@/components/MonthPicker";
import type { MonthlyDashboardResponse } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";

const fetchDashboardData = async (
  year: number,
  month: number,
): Promise<MonthlyDashboardResponse> => {
  const response = await fetch(`/api/dashboard?&year=${year}&month=${month}`);
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  return response.json();
};

export default function CompactDashboard() {
  const [hide, setHide] = useState(true);
  const router = useRouter();
  const now = new Date();
  const [monthValue, setMonthValue] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );

  const { year, month } = useMemo(() => {
    const [y, m] = monthValue.split("-").map(Number);
    return { year: y, month: m };
  }, [monthValue]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", year, month],
    queryFn: () => fetchDashboardData(year, month),
    staleTime: 1000 * 60, //
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-50 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load dashboard data.
      </div>
    );

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">
                  <Home className="w-4 h-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary">
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Month Picker */}
        <div className="flex items-center justify-between gap-2">
          <MonthPicker value={monthValue} onChange={setMonthValue} />
          <Button variant="outline" size="icon" onClick={() => setHide(!hide)}>
            {hide ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* --- Top KPIs Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={data.kpis.totalStudents}
            subtitle={
              <span className="text-emerald-600 flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> +
                {data.kpis.newStudentsThisMonth} new
              </span>
            }
            icon={<Users className="text-indigo-600" />}
            bgColor="bg-indigo-50 dark:bg-indigo-500/10"
          />
          <StatCard
            title="Active Subs"
            value={data.kpis.activeSubscriptions}
            subtitle={`${data.kpis.totalStudents - data.kpis.activeSubscriptions} inactive`}
            icon={<TrendingUp className="text-emerald-600" />}
            bgColor="bg-emerald-50 dark:bg-emerald-500/10"
          />
          <StatCard
            title="Revenue Collected"
            value={`₹${data.revenue.collectedRevenue.toLocaleString()}`}
            subtitle={
              <span
                className={
                  data.revenue.pendingRevenue > 0
                    ? "text-amber-600"
                    : "text-zinc-500"
                }
              >
                ₹{data.revenue.pendingRevenue.toLocaleString()} pending
              </span>
            }
            icon={<IndianRupee className="text-blue-600" />}
            bgColor="bg-blue-50 dark:bg-blue-500/10"
            hide={hide}
          />
          <StatCard
            title="Expiring Soon"
            value={data.kpis.expiringThisMonth}
            subtitle="Needs renewal this month"
            icon={
              <AlertCircle
                className={
                  data.kpis.expiringThisMonth > 0
                    ? "text-rose-600"
                    : "text-zinc-400"
                }
              />
            }
            bgColor={
              data.kpis.expiringThisMonth > 0
                ? "bg-rose-50 dark:bg-rose-500/10"
                : "bg-zinc-100 dark:bg-zinc-800"
            }
          />
        </div>

        {/* --- Bento Grid Main Content --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Financials & Floors (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Revenue Details */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Financial Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">
                      Expected Revenue
                    </p>
                    <p className="text-2xl font-black">
                      {hide
                        ? "••••••"
                        : `₹${data.revenue.expectedMonthlyRevenue.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 mb-1">Collected</p>
                    <p className="text-sm font-bold text-emerald-600">
                      {Math.round(
                        (data.revenue.collectedRevenue /
                          Math.max(data.revenue.expectedMonthlyRevenue, 1)) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                </div>
                {/* Revenue Progress Bar */}
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${(data.revenue.collectedRevenue / Math.max(data.revenue.expectedMonthlyRevenue, 1)) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-amber-400"
                    style={{
                      width: `${(data.revenue.pendingRevenue / Math.max(data.revenue.expectedMonthlyRevenue, 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <p className="text-[10px] uppercase text-zinc-500 font-semibold">
                      Pending Due
                    </p>
                    <p className="text-sm font-bold text-amber-600">
                      {hide
                        ? "••••••"
                        : `₹${data.revenue.pendingRevenue.toLocaleString()}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-zinc-500 font-semibold">
                      Discounts Given
                    </p>
                    <p className="text-sm font-bold text-rose-500">
                      {hide
                        ? "••••••"
                        : `₹${data.revenue.totalDiscountsGiven.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floor Occupancy */}
            {/* <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4" /> Physical Floor Usage
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold">
                    Overall Capacity
                  </span>
                  <span className="text-xs font-bold">
                    {data.occupancyOverview.overallOccupancyRate}%
                  </span>
                </div>
                {data.floorOccupancy.map((floor) => (
                  <div key={floor.floorId} className="group">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {floor.floorName}
                      </span>
                      <span className="text-zinc-500">
                        {floor.uniqueOccupiedSeats} / {floor.totalSeats}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          floor.uniqueOccupiedSeats / floor.totalSeats > 0.85
                            ? "bg-rose-500"
                            : "bg-indigo-500"
                        }`}
                        style={{
                          width: `${(floor.uniqueOccupiedSeats / floor.totalSeats) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Middle Column: Shift Analytics (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Shift Performance
              </div>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-600">
                SLOTS: {data.occupancyOverview.occupiedSlots}/
                {data.occupancyOverview.totalCapacitySlots}
              </span>
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
              {data.shiftAnalytics.map((shift) => (
                <div
                  key={shift.shiftId}
                  className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {shift.shiftName}
                      </h4>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                        ₹{shift.shiftPrice} / Seat
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black">
                        {shift.occupancyRate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${shift.occupancyRate > 90 ? "bg-emerald-500" : "bg-blue-500"}`}
                      style={{ width: `${shift.occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-zinc-500 font-medium">
                      {shift.occupiedSeats} / {shift.totalSeats} Booked
                    </span>
                    {/* <span className="text-xs font-bold text-emerald-600">
                      {hide
                        ? "••••••"
                        : `+₹${shift.revenueGenerated.toLocaleString()}`}
                    </span> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Actionable Lists (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Expiring Soon */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-orange-200 dark:border-orange-900/30 shadow-sm flex-1 flex flex-col">
              <div className="p-4 border-b border-orange-100 dark:border-orange-900/20 bg-orange-50/50 dark:bg-orange-500/5 rounded-t-2xl flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Renewals Sub
                </h3>
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {data.actionableLists.expiringSoon.length}
                </span>
              </div>
              <div className="p-2 flex-1 overflow-y-auto">
                {data.actionableLists.expiringSoon.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-8">
                    No immediate renewals needed.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {data.actionableLists.expiringSoon.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg group"
                      >
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {sub.studentName}
                          </p>
                          {/* Changed to anchor tag with tel: protocol */}
                          <a
                            href={`tel:${sub.studentPhone}`}
                            className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 w-fit hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <Phone className="h-3 w-3" /> {sub.studentPhone}
                          </a>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                              sub.daysRemaining <= 2
                                ? "bg-rose-100 text-rose-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {sub.daysRemaining} days left
                          </span>
                          <Button
                            size={"icon"}
                            variant={"outline"}
                            onClick={() =>
                              router.push(`/student/${sub.studentId}`)
                            }
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Full Width Bottom: Recent Subscriptions --- */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Recent Admissions
            </h3>
            <Link href="/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Seat & Floor</th>
                  <th className="px-5 py-3 font-semibold">Shift Details</th>
                  <th className="px-5 py-3 font-semibold">Duration</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {data.actionableLists.recentSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Button  variant="link" onClick={() => router.push(`/student/${sub.studentId}`)} className="font-bold text-zinc-900 dark:text-zinc-100 hover:no-underline">
                        {sub.studentName}
                      </Button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded text-xs font-semibold">
                          S-{sub.seatNo}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {sub.floorName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {sub.shiftName && sub.shiftName.length > 0 ? (
                          sub.shiftName.map((shift, idx) => (
                            <span
                              key={idx}
                              className="border border-zinc-200 dark:border-zinc-700 text-[10px] px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400"
                            >
                              {shift}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500 font-medium">
                      {new Date(sub.startDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      →{" "}
                      {new Date(sub.endDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={sub.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    PARTIAL:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    UNPAID:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${styles[status]}`}
    >
      {status}
    </span>
  );
}
