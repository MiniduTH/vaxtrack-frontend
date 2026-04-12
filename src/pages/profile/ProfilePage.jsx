import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, 
  FiShield, FiEdit2, FiSave, FiX, FiCheckCircle, FiActivity, FiCamera
} from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import { getProfile, updateProfile } from '../../api/authApi';
import { Spinner } from '../../components/common';

const ProfilePage = () => {
  const { user, login } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const fetchProfile = async () => {
    try {
      setIsFetching(true);
      const res = await getProfile();
      // res.data might be the user object depending on axios config
      const data = res.data;
      setProfileData(data);
      reset({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        nic: data.nic || '',
      });
      
      // Sync local store
      const currentToken = useAuthStore.getState().token;
      login(data, currentToken);
    } catch (error) {
      toast.error('Failed to load profile data');
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user?._id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('nic', data.nic);
      formData.append('address', data.address);
      
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      const res = await updateProfile(formData);
      const updatedUser = res.data;
      
      setProfileData(updatedUser);
      const currentToken = useAuthStore.getState().token;
      login(updatedUser, currentToken);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Spinner size="xl" />
        <p className="mt-4 text-secondary-500 font-medium animate-pulse">Retrieving your secure profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-20">
        <FiShield className="mx-auto w-12 h-12 text-danger-500 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Profile not found</h2>
        <p className="text-secondary-500 mt-2">There was an error loading your information.</p>
        <button onClick={fetchProfile} className="btn-primary mt-6">Try Again</button>
      </div>
    );
  }

  const roleLabel = profileData.role === 'Public' ? 'Patient' : profileData.role;
  const roleColor = profileData.role === 'Admin' ? 'from-danger-500 to-danger-600' : 
                   profileData.role === 'HospitalStaff' ? 'from-success-500 to-success-600' : 
                   'from-primary-500 to-primary-600';

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Dynamic Breadcrumb/Path UI */}
      <div className="flex items-center gap-2 text-sm text-secondary-500 mb-6 font-medium">
        <span>Dashboard</span>
        <span className="text-slate-300">/</span>
        <span className="text-primary-600 dark:text-primary-400">My Profile</span>
      </div>

      <div className="relative group">
        {/* Background Glow Effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${roleColor} rounded-[2rem] blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200`}></div>
        
        <div className="relative bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden ring-1 ring-black/5">
          
          {/* Header Banner */}
          <div className={`bg-gradient-to-br ${roleColor} p-8 md:p-12 text-white relative overflow-hidden`}>
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
                <div className="relative group/avatar">
                  <div className="h-32 w-32 rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl flex items-center justify-center text-5xl font-black text-primary-700 uppercase tracking-tighter transform hover:scale-105 transition-transform duration-300 overflow-hidden border-4 border-white">
                    {imagePreview || profileData.profilePicture ? (
                      <img 
                        src={imagePreview || profileData.profilePicture} 
                        alt={profileData.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{profileData.name ? profileData.name.charAt(0) : 'U'}</span>
                    )}
                    
                    {isEditing && (
                      <label 
                        htmlFor="profile-upload"
                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300"
                      >
                        <FiCamera className="w-8 h-8 text-white mb-1" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Change</span>
                        <input 
                          id="profile-upload"
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-success-500 p-2 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg z-20">
                    <FiCheckCircle className="text-white w-4 h-4" />
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-widest mb-3">
                    {roleLabel} Account
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-sm">
                    {profileData.name}
                  </h1>
                  <p className="text-white/80 font-medium flex items-center justify-center md:justify-start gap-2">
                    <FiMail className="w-4 h-4" />
                    {profileData.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (isEditing) {
                      reset();
                      setIsEditing(false);
                      setImagePreview(null);
                      setSelectedFile(null);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                    isEditing 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-white text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiX className="w-5 h-5" /> Cancel
                    </>
                  ) : (
                    <>
                      <FiEdit2 className="w-5 h-5" /> Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-8 md:p-12">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary-600 dark:text-slate-400 uppercase tracking-wider ml-1">Full Identity Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                        <FiUser className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        {...register('name', { required: 'Full name is required' })}
                        className={`w-full pl-12 pr-4 py-4 bg-secondary-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all duration-300 ${
                          errors.name ? 'border-danger-500 ring-danger-500/10' : 'border-transparent focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.name && <p className="text-xs font-bold text-danger-500 ml-1">{errors.name.message}</p>}
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary-600 dark:text-slate-400 uppercase tracking-wider ml-1">Contact Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                        <FiPhone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        {...register('phone', { required: 'Phone number is required' })}
                        className={`w-full pl-12 pr-4 py-4 bg-secondary-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all duration-300 ${
                          errors.phone ? 'border-danger-500 ring-danger-500/10' : 'border-transparent focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                        }`}
                        placeholder="+94 XX XXX XXXX"
                      />
                    </div>
                    {errors.phone && <p className="text-xs font-bold text-danger-500 ml-1">{errors.phone.message}</p>}
                  </div>

                  {/* NIC Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary-600 dark:text-slate-400 uppercase tracking-wider ml-1">NIC Identification</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                        <FiCreditCard className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        {...register('nic', { required: 'NIC is required' })}
                        className={`w-full pl-12 pr-4 py-4 bg-secondary-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all duration-300 ${
                          errors.nic ? 'border-danger-500 ring-danger-500/10' : 'border-transparent focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                        }`}
                        placeholder="19XXXXXXXXXX"
                      />
                    </div>
                    {errors.nic && <p className="text-xs font-bold text-danger-500 ml-1">{errors.nic.message}</p>}
                  </div>

                  {/* Email (Read Only Visual) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary-600 dark:text-slate-400 uppercase tracking-wider ml-1">System Email (Read Only)</label>
                    <div className="relative opacity-60">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-secondary-400">
                        <FiMail className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={profileData.email}
                        readOnly
                        className="w-full pl-12 pr-4 py-4 bg-secondary-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Address Input */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-secondary-600 dark:text-slate-400 uppercase tracking-wider ml-1">Physical Address</label>
                    <div className="relative group">
                      <div className="absolute top-4 left-4 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                        <FiMapPin className="w-5 h-5" />
                      </div>
                      <textarea
                        {...register('address', { required: 'Address is required' })}
                        rows={4}
                        className={`w-full pl-12 pr-4 py-4 bg-secondary-50 dark:bg-slate-800/50 border-2 rounded-2xl outline-none transition-all duration-300 resize-none ${
                          errors.address ? 'border-danger-500 ring-danger-500/10' : 'border-transparent focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
                        }`}
                        placeholder="Address information..."
                      />
                    </div>
                    {errors.address && <p className="text-xs font-bold text-danger-500 ml-1">{errors.address.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex items-center gap-3 px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <FiSave className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    )}
                    {isLoading ? 'Updating System...' : 'Synchronize Profile'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Info Cards */}
                {[
                  { icon: FiMail, label: 'Email Address', value: profileData.email, color: 'primary' },
                  { icon: FiPhone, label: 'Contact Number', value: profileData.phone || 'Not Set', color: 'success' },
                  { icon: FiCreditCard, label: 'Identity Card (NIC)', value: profileData.nic || 'Not Set', color: 'warning' },
                  { icon: FiShield, label: 'Account Authority', value: `${roleLabel} Privileges`, color: 'danger' },
                ].map((item, idx) => (
                  <div key={idx} className="group flex items-center p-6 rounded-3xl bg-secondary-50 dark:bg-slate-800/30 border border-transparent hover:border-primary-500/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl">
                    <div className={`p-4 rounded-2xl bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400 mr-5 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-secondary-500 dark:text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-foreground truncate max-w-[200px] lg:max-w-none">{item.value}</p>
                    </div>
                  </div>
                ))}

                {/* Full Width Address Card */}
                <div className="md:col-span-2 group flex items-start p-8 rounded-3xl bg-secondary-50 dark:bg-slate-800/30 border border-transparent hover:border-primary-500/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-xl">
                  <div className="p-4 rounded-2xl bg-secondary-500/10 text-secondary-600 dark:text-slate-400 mr-5 group-hover:scale-110 transition-transform">
                    <FiMapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-secondary-500 dark:text-slate-400 uppercase tracking-widest mb-2">Registered Resident Address</p>
                    <p className="text-lg font-medium text-foreground leading-relaxed">
                      {profileData.address || <span className="text-slate-400 italic font-normal">Complete your profile by adding your primary residence address.</span>}
                    </p>
                  </div>
                </div>

                {/* Additional Stats Section (Mock) */}
                <div className="md:col-span-2 mt-8 p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative shadow-2xl">
                  <FiActivity className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-black mb-1">Activity Highlights</h3>
                      <p className="text-slate-400 text-sm font-medium italic">Your contribution to VaxTrack ecosystem safety.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 min-w-[100px]">
                        <p className="text-primary-400 text-2xl font-black italic">Active</p>
                        <p className="text-[10px] uppercase font-black tracking-tighter text-slate-300">Status</p>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 min-w-[100px]">
                        <p className="text-success-400 text-2xl font-black italic">Verified</p>
                        <p className="text-[10px] uppercase font-black tracking-tighter text-slate-300">Trust Score</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

