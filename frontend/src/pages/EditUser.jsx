import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import cloudinaryConfig from "../cloudinary";

const DEPTS = [
  "Software", "Marketing", "Data Scientist", "Data Analyst",
  "System Analyst", "UX/UI Designer", "Cybersecurity Manager", "Others",
];

const EditUser = () => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(null);

  const { data: user, error, isLoading } = useQuery({
    queryKey: ["user", Id],
    queryFn: () => axios.get(`/api/users/${Id}`).then((res) => res.data),
  });

  const [uploading, setUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) =>
      axios.put(`/api/users/${Id}`, data, {
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["user", Id] });
      navigate(`/user/${Id}`);
    },
    onError: (error) => {
      alert("Error updating employee: " + error.message);
      setUploading(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.target);
    const photoFile = formData.get("photo");
    let photoUrl = null;

    if (photoFile && photoFile.size > 0) {
      if (photoFile.size > 10 * 1024 * 1024) {
        alert("File size too large. Please upload an image smaller than 10MB.");
        setUploading(false);
        return;
      }

      const data = new FormData();
      data.append("file", photoFile);
      data.append("upload_preset", cloudinaryConfig.uploadPreset);

      try {
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
          data
        );
        photoUrl = res.data.secure_url;
      } catch (err) {
        console.error("Cloudinary Error:", err);
        alert("Photo upload failed: " + (err.response?.data?.error?.message || err.message));
        setUploading(false);
        return;
      }
    }

    mutation.mutate({
      EmpName: formData.get("EmpName"),
      EmpAge: formData.get("EmpAge"),
      EmpDept: formData.get("EmpDept"),
      photo: photoUrl, // Pass new URL or null (backend handles null by keeping existing)
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
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

  return (
    <main className="min-h-screen bg-slate-900 pt-20 pb-12 px-4 relative">
      {(uploading || mutation.isPending) && (
        <div className="absolute inset-0 bg-slate-900/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium text-lg">Saving Changes...</p>
        </div>
      )}
      <div className="max-w-lg mx-auto">

        <Link to={`/user/${Id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Profile
        </Link>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-700 bg-slate-900/50">
            <h1 className="text-xl font-bold text-white">Edit Employee</h1>
            <p className="text-slate-400 text-sm mt-1">Update the details for <span className="text-indigo-400 font-medium">{user.empname}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="EmpName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="EmpName"
                name="EmpName"
                required
                defaultValue={user.empname}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="EmpAge" className="block text-sm font-medium text-slate-300 mb-2">
                Age <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                id="EmpAge"
                name="EmpAge"
                required
                min="18"
                max="100"
                defaultValue={user.empage}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="EmpDept" className="block text-sm font-medium text-slate-300 mb-2">
                Department <span className="text-red-400">*</span>
              </label>
              <select
                name="EmpDept"
                id="EmpDept"
                required
                defaultValue={user.empdept}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select a department</option>
                {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Photo</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label
                    htmlFor="photo"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-slate-900/50 transition-all"
                  >
                    <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-400 text-xs">Upload new photo</span>
                    <input name="photo" id="photo" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {/* Preview: new upload takes priority, then existing */}
                {(preview || user.photo) && (
                  <img
                    src={preview || (user.photo?.startsWith("http") ? user.photo : `/uploads/${user.photo}`)}
                    className="w-24 h-24 rounded-xl object-cover border border-slate-600"
                    alt="Preview"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {uploading || mutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditUser;