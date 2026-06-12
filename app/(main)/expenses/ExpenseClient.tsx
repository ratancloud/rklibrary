"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Eye,
  EyeOff,
  Plus,
  Receipt,
  PieChart,
  Trash2,
  Pencil,
  Wallet,
  TrendingDown,
  CalendarDays,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import MonthPicker from "@/components/MonthPicker";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

export interface Expense {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  category: string;
  date: string | Date;
}

const CATEGORIES = [
  "RENT",
  "ELECTRICITY",
  "WATER",
  "INTERNET",
  "MAINTENANCE",
  "SALARY",
  "MARKETING",
  "SUPPLIES",
  "OTHER",
];

const fetchExpensesData = async (year: number, month: number) => {
  const res = await fetch(`/api/expenses?month=${month}&year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch expenses data");
  return res.json();
};

export default function ExpenseClientView() {
  const [hide, setHide] = useState(true);
  const now = new Date();
  const [monthValue, setMonthValue] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );

  const { year, month } = useMemo(() => {
    const [y, m] = monthValue.split("-").map(Number);
    return { year: y, month: m };
  }, [monthValue]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["expenses", year, month],
    queryFn: () => fetchExpensesData(year, month),
    staleTime: 1000 * 60,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "OTHER",
    date: new Date().toISOString().split("T")[0],
  });

  const expenses: Expense[] = useMemo(
    () => data?.expenses || [],
    [data?.expenses],
  );
  const total: number = data?.total || 0;

  const topCategory = useMemo(() => {
    if (!expenses.length) return ["N/A", 0] as [string, number];

    const totals = expenses.reduce(
      (acc: Record<string, number>, curr: Expense) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      },
      {},
    );

    return Object.entries(totals).reduce<[string, number]>(
      (a, b) => (a[1] > b[1] ? a : b),
      ["N/A", 0],
    );
  }, [expenses]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = editingId ? `/api/expenses/${editingId}` : "/api/expenses";
    const method = editingId ? "PATCH" : "POST";
    const payload = { ...formData, amount: parseInt(formData.amount) };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        resetForm();
        refetch();
      }
    } catch (error) {
      console.error("Failed to save expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${expenseToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) refetch();
    } catch (error) {
      console.error("Failed to delete expense:", error);
    } finally {
      setIsDeleting(false);
      setExpenseToDelete(null);
    }
  };

  const openEditModal = (expense: Expense) => {
    setFormData({
      title: expense.title,
      description: expense.description || "",
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split("T")[0],
    });
    setEditingId(expense.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      category: "OTHER",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Skeleton className="h-6 w-64 rounded-lg" />
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-8 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900">
        <p className="font-semibold">Failed to load expense data.</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
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
              <BreadcrumbPage className="text-primary">Expenses</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
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

      <div className="flex items-center justify-end mb-6">
        <Button
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
      >
        <Plus className="h-4 w-4" /> Add Expense
      </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Monthly Expenditure"
            value={`₹${total.toLocaleString()}`}
            subtitle={`${expenses.length} transactions this month`}
            icon={<Wallet className="text-rose-600" />}
            bgColor="bg-rose-50 dark:bg-rose-500/10"
            hide={hide}
          />
          <StatCard
            title="Highest Category"
            value={topCategory[0] as string}
            subtitle={
              hide
                ? "••••••"
                : `₹${(topCategory[1] as number).toLocaleString()} spent`
            }
            icon={<PieChart className="text-indigo-600" />}
            bgColor="bg-indigo-50 dark:bg-indigo-500/10"
          />
          <StatCard
            title="Average Expense"
            value={`₹${expenses.length > 0 ? Math.round(total / expenses.length).toLocaleString() : 0}`}
            subtitle="Per transaction average"
            icon={<TrendingDown className="text-emerald-600" />}
            bgColor="bg-emerald-50 dark:bg-emerald-500/10"
            hide={hide}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Expense Breakdown
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
              {expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <PieChart className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-sm text-zinc-500">
                    No expenses recorded yet.
                  </p>
                </div>
              ) : (
                Array.from(
                  new Set(expenses.map((e: Expense) => e.category)),
                ).map((category) => {
                  const catTotal = expenses
                    .filter((e: Expense) => e.category === category)
                    .reduce((sum: number, e: Expense) => sum + e.amount, 0);
                  const percentage = Math.round((catTotal / total) * 100);

                  return (
                    <div
                      key={category}
                      className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {category}
                        </h4>
                        <span className="text-sm font-black">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-xs font-bold text-rose-600">
                          {hide ? "••••••" : `₹${catTotal.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Transaction History
              </h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold text-right">
                      Amount
                    </th>
                    <th className="px-5 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Receipt className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
                          <p className="text-zinc-500 font-medium">
                            No transactions found for this month.
                          </p>
                          <Button
                            variant="link"
                            onClick={() => setIsModalOpen(true)}
                            className="text-indigo-600 mt-1"
                          >
                            Add your first expense
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense: Expense) => (
                      <tr
                        key={expense.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400 font-medium">
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            {expense.title}
                          </p>
                          {expense.description && (
                            // 4. Fix Tailwind classes
                            <p className="text-xs text-zinc-500 truncate max-w-50 sm:max-w-64">
                              {expense.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-zinc-200 dark:border-zinc-700">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-rose-600">
                          {hide
                            ? "••••••"
                            : `₹${expense.amount.toLocaleString()}`}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(expense)}
                            className="h-8 w-8 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setExpenseToDelete(expense.id)}
                            className="h-8 w-8 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100">
              Delete Expense Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              This action cannot be undone. This will permanently delete the
              expense record and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 border-none"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingId ? "Edit Expense" : "Add New Expense"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 text-zinc-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., June Electricity Bill"
                  className="w-full h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Amount (₹)
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional details..."
                  className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-20"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Create Expense"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
