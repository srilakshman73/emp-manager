import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";

const DEPTS = [
  "Software", "Marketing", "Data Scientist", "Data Analyst",
  "System Analyst", "UX/UI Designer", "Cybersecurity Manager", "Others",
];

const deptColors = {
  "Software": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Marketing": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Data Scientist": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Data Analyst": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "System Analyst": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "UX/UI Designer": "bg-green-500/20 text-green-300 border-green-500/30",
  "Cybersecurity Manager": "bg-red-500/20 text-red-300 border-red-500/30",
  "Others": "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const Home = () => {
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dept, setDept] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchTerm);
  };

  const handleClear = (e) => {
    if (!e.target.value) {
      setSearchTerm("");
      setSearch("");
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", search, dept],
    queryFn: () =>
      axios
        .get(`/api/users`, {
          params: {
            search: search || undefined,
            dept: dept || undefined,
          },
        })
        .then((res) => res.data),
  });

  return (
    <main className="min-h-screen bg-slate-900 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Employee Directory</h1>
            <p className="text-slate-400 text-sm">
              {data ? `${data.total} employee${data.total !== 1 ? "s" : ""}` : "Loading..."}
              {dept ? ` in ${dept}` : ""}
              {search ? ` matching "${search}"` : ""}
            </p>
          </div>
          <Link
            to="/add"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            + Add Employee
          </Link>
        </div>

        {/* Search + Dept Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-3 flex-1 min-w-64">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Search by name..."
                value={searchTerm}
                onInput={handleClear}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Department Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setDept("")}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${dept === ""
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-800 text-slate-300 border-slate-600 hover:border-slate-400"
                }`}
            >
              All
            </button>
            {DEPTS.map((d) => (
              <button
                key={d}
                onClick={() => setDept(dept === d ? "" : d)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${dept === d
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-800 text-slate-300 border-slate-600 hover:border-slate-400"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-400">Loading employees...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              <p className="text-lg font-medium">Failed to load data</p>
              <p className="text-sm text-slate-500 mt-1">{error.message}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {data?.users?.length > 0 ? (
                  data.users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.photo ? (
                            <img
                              src={user.photo?.startsWith("http") ? user.photo : `/uploads/${user.photo}`}
                              alt={user.empname}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                            style={{ display: user.photo ? "none" : "flex" }}
                          >
                            {user.empname?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-white font-medium">{user.empname}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{user.empage}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${deptColors[user.empdept] || deptColors["Others"]}`}>
                          {user.empdept}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/user/${user.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="text-slate-500">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="font-medium text-slate-400">No employees found</p>
                        <p className="text-sm mt-1">Try a different search or filter</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;