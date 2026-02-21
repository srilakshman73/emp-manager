import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

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

const UserDetail = () => {
  const { Id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", Id],
    queryFn: () => axios.get(`/api/users/${Id}`).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`/api/users/${Id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      navigate("/");
    },
    onError: (error) => {
      alert("Error deleting user: " + error.message);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">
        Error: {error.message}
      </div>
    );

  const deptClass = deptColors[user.empdept] || deptColors["Others"];

  return (
    <main className="min-h-screen bg-slate-900 pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Directory
        </Link>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">

          {/* Header banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>

          {/* Avatar + name */}
          <div className="px-8 pb-6">
            <div className="flex items-end gap-5 -mt-12 mb-6">
              {user.photo ? (
                <img
                  src={user.photo?.startsWith("http") ? user.photo : `/uploads/${user.photo}`}
                  alt={user.empname}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-800 shadow-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-24 h-24 rounded-2xl bg-indigo-600 border-4 border-slate-800 shadow-xl flex items-center justify-center text-white text-3xl font-bold"
                style={{ display: user.photo ? "none" : "flex" }}
              >
                {user.empname?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-white">{user.empname}</h1>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${deptClass}`}>
                  {user.empdept}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Employee ID</p>
                <p className="text-white font-semibold">#{user.id}</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Age</p>
                <p className="text-white font-semibold">{user.empage} years</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 col-span-2">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Department</p>
                <p className="text-white font-semibold">{user.empdept}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                to={`/edit/${user.id}`}
                className="flex-1 text-center py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
              >
                Edit Employee
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 font-medium rounded-xl transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Employee"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserDetail;