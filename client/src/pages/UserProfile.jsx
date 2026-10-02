import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Globe,
  Linkedin,
  Github,
  Twitter,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Award,
  MessageSquare,
  User,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserProfile = () => {
  const { id } = useParams();
  const { currentUser, userProfile: myProfile } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, reviewsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`).catch(() => ({ data: { data: [] } })),
        ]);

        if (userRes.data.success) {
          setProfileUser(userRes.data.data);
        }
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'User profile not found');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading user profile & portfolio..." />;
  if (error || !profileUser) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <Alert type="error" message={error || 'User profile not found'} />
      </div>
    );
  }

  const isOwnProfile = myProfile && myProfile._id === profileUser._id;
  const hasSocialLinks =
    profileUser.portfolioUrl ||
    profileUser.linkedinUrl ||
    profileUser.githubUrl ||
    profileUser.twitterUrl;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {isOwnProfile && (
          <Link
            to="/dashboard"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3.5 py-2 rounded-xl transition"
          >
            Edit Profile in Dashboard →
          </Link>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-indigo-600/20 flex-shrink-0">
              {profileUser.displayName?.charAt(0) || 'U'}
            </div>

            {/* Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {profileUser.displayName}
                </h1>
                <Badge variant={profileUser.role} className="uppercase font-bold tracking-wider text-[10px]">
                  {profileUser.role}
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Member
                </span>
              </div>

              {profileUser.location && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profileUser.location}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 pt-1">
                <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {profileUser.ratingAverage > 0 ? profileUser.ratingAverage.toFixed(1) : '5.0'}
                  <span className="text-slate-500 font-normal">({profileUser.ratingCount || 0} reviews)</span>
                </span>

                {profileUser.hourlyRate > 0 && (
                  <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <strong>₹{profileUser.hourlyRate}</strong>/hr
                  </span>
                )}

                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Joined{' '}
                  {new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio & Social Link Badges */}
        {hasSocialLinks && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Portfolio & External Links
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              {profileUser.portfolioUrl && (
                <a
                  href={
                    profileUser.portfolioUrl.startsWith('http')
                      ? profileUser.portfolioUrl
                      : `https://${profileUser.portfolioUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition shadow-2xs group"
                >
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Portfolio Website</span>
                  <ExternalLink className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {profileUser.linkedinUrl && (
                <a
                  href={
                    profileUser.linkedinUrl.startsWith('http')
                      ? profileUser.linkedinUrl
                      : `https://${profileUser.linkedinUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition shadow-2xs group"
                >
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {profileUser.githubUrl && (
                <a
                  href={
                    profileUser.githubUrl.startsWith('http')
                      ? profileUser.githubUrl
                      : `https://${profileUser.githubUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition shadow-2xs group"
                >
                  <Github className="w-4 h-4 text-slate-700" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {profileUser.twitterUrl && (
                <a
                  href={
                    profileUser.twitterUrl.startsWith('http')
                      ? profileUser.twitterUrl
                      : `https://${profileUser.twitterUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 rounded-xl transition shadow-2xs group"
                >
                  <Twitter className="w-4 h-4 text-sky-500" />
                  <span>Twitter / X</span>
                  <ExternalLink className="w-3 h-3 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Bio & Skills Left, Reviews Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About / Bio Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              About & Experience
            </h3>
            {profileUser.bio ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {profileUser.bio}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No bio provided yet.</p>
            )}
          </div>

          {/* Skills & Expertise Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Skills & Expertise
            </h3>
            {profileUser.skills && profileUser.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileUser.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific skills listed.</p>
            )}
          </div>

          {/* Verified Client Reviews */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-950">
                Verified Reviews ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                {profileUser.ratingAverage > 0 ? profileUser.ratingAverage.toFixed(1) : '5.0'} / 5.0
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Award className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No reviews submitted yet for this user.</p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {rev.reviewerId?.displayName?.charAt(0) || 'R'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {rev.reviewerId?.displayName || 'Client'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.taskId?.title && (
                      <div className="text-[11px] font-semibold text-slate-500">
                        Task: <span className="text-slate-700">{rev.taskId.title}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar Summary Card) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Candidate Overview
            </h4>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Role</span>
                <span className="font-bold text-slate-800 capitalize">{profileUser.role}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Rating</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {profileUser.ratingAverage > 0 ? profileUser.ratingAverage.toFixed(1) : '5.0'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Completed Reviews</span>
                <span className="font-bold text-slate-800">{profileUser.ratingCount || 0}</span>
              </div>
              {profileUser.hourlyRate > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-400">Rate</span>
                  <span className="font-bold text-emerald-600">₹{profileUser.hourlyRate}/hr</span>
                </div>
              )}
              {profileUser.location && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location</span>
                  <span className="font-bold text-slate-800">{profileUser.location}</span>
                </div>
              )}
            </div>

            {hasSocialLinks ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 font-medium leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Verified links provided. You can review their portfolio before accepting their proposal.</span>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                This user has not added external portfolio links yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
