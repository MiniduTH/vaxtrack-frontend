import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiShield, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import { getProfile } from '../../api/authApi';

const ProfilePage = () => {
  const { user, login } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(user);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    }
  });

  // Optional: Fetch fresh profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        // Assume data contains the user object
        setProfileData(data.user || data);
        reset(data.user || data);
        
        // Update store with fresh user data while keeping the token intact
        const currentToken = useAuthStore.getState().token;
        login(data.user || data, currentToken);
      } catch (error) {
        console.error('Failed to fetch latest profile info', error);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user?.id, reset, login]);

  const onSubmit = async (data) => {
    // Handling update logic if you add an updateProfile endpoint later
    try {
      setIsLoading(true);
      // Mocking update API call for now (you'd add authApi.updateProfile(data) here)
      // const updatedUser = await authApi.updateProfile(data);
      
      const updatedUser = { ...profileData, ...data };
      setProfileData(updatedUser);
      
      const currentToken = useAuthStore.getState().token;
      login(updatedUser, currentToken);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 px-8 py-10 text-white flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="h-24 w-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold uppercase shadow-md">
              {profileData.name ? profileData.name.charAt(0) : 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profileData.name}</h1>
              <p className="text-blue-100 mt-1 flex items-center">
                <FiShield className="mr-2" />
                {profileData.role === 'Public' ? 'Patient Account' : profileData.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              reset(profileData);
            }}
            className="mt-6 sm:mt-0 flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            {isEditing ? (
              <>
                <FiX className="mr-2" /> Cancel
              </>
            ) : (
              <>
                <FiEdit2 className="mr-2" /> Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    {...register('address', { required: 'Address is required' })}
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FiSave className="mr-2" /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Info Cards */}
              <div className="flex items-start p-4 rounded-xl bg-gray-50">
                <FiMail className="text-gray-400 text-xl mt-1 mr-4" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="text-gray-900 font-medium mt-1">{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-start p-4 rounded-xl bg-gray-50">
                <FiPhone className="text-gray-400 text-xl mt-1 mr-4" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                  <p className="text-gray-900 font-medium mt-1">{profileData.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start p-4 rounded-xl bg-gray-50">
                <FiCreditCard className="text-gray-400 text-xl mt-1 mr-4" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">National Identity Card (NIC)</p>
                  <p className="text-gray-900 font-medium mt-1">{profileData.nic || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start p-4 rounded-xl bg-gray-50">
                <FiMapPin className="text-gray-400 text-xl mt-1 mr-4" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Physical Address</p>
                  <p className="text-gray-900 mt-1 leading-relaxed">{profileData.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
