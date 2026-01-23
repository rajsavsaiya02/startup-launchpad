import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, MapPin, Calendar, Briefcase, Github, Linkedin, Shield } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/axios';
import { SessionCard } from '../../components/security/SessionCard';
import { useToast } from '../../components/ui/Toast';

export function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser, login: updateAuthUser } = useAuth();
  const { addToast } = useToast();
  
  // If no ID is present, we are viewing our own profile
  const isOwnProfile = !id || (currentUser && currentUser.id === id);

  const [loading, setLoading] = useState(false); // Initial load logic could be expanded
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Use current user data if own profile, otherwise we would need to fetch (not implemented for others yet)
  // For now, if typical user visits /profile, we use currentUser.
  const user = isOwnProfile ? currentUser : {
    name: "Alex Johnson (Mock)",
    role: "Product Manager",
    department: 'Product', // mapping to org/dept
    location: "San Francisco, CA",
    created_at: "2023-03-01",
    email: "alex@launchpad.inc",
    bio: "Building tools for the next generation of founders.",
    skills: ["Product Strategy", "Agile", "React"],
    projects: ["Website Redesign"],
    avatar_url: "https://i.pravatar.cc/150?u=alex"
  };

  // Safe fallbacks
  const displayName = user?.name || user?.full_name || user?.username || 'User';
  const displayRole = user?.role || 'Member';
  const displayBio = user?.bio || 'No bio provided.';
  const displayLocation = user?.office_location || user?.location || 'Remote';
  const displayJoined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';

  useEffect(() => {
    if (isOwnProfile) {
        fetchSessions();
    }
  }, [isOwnProfile]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
        const res = await apiClient.get('/sessions');
        setSessions(res.data.sessions);
    } catch (err) {
        console.error('Failed to fetch sessions', err);
    } finally {
        setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to revoke this session?")) return;
    try {
        await apiClient.delete(`/sessions/${sessionId}`);
        addToast('Session revoked successfully', 'success');
        fetchSessions();
    } catch (err) {
        addToast('Failed to revoke session', 'error');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!window.confirm("Are you sure you want to log out from all other devices?")) return;
    try {
        await apiClient.delete('/sessions');
        addToast('All other sessions signed out', 'success');
        fetchSessions();
    } catch (err) {
        addToast('Failed to sign out other sessions', 'error');
    }
  };
  
  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-500 pb-20">
      
      <Card className="overflow-hidden bg-white dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm">
        
        {/* Banner */}
        <div className="h-40 bg-linear-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-6 gap-4">
            <div className="flex items-end gap-6">
              <Avatar 
                src={user.avatar_url || user.img} 
                fallback={displayName.substring(0,2).toUpperCase()}
                size="xl" 
                className="h-32 w-32 ring-4 ring-white dark:ring-surface-dark shadow-lg bg-white text-3xl font-bold" 
              />
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                    {displayName}
                    {isOwnProfile && <Badge variant="primary" className="text-xs">You</Badge>}
                </h1>
                <p className="text-lg text-text-secondary dark:text-gray-300">{displayRole}</p>
              </div>
            </div>
            {/* Actions could go here */}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
            
            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="space-y-3 text-sm text-text-secondary dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-text-tertiary" /> {user.department || user.org || 'LaunchPad Inc.'}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-text-tertiary" /> {displayLocation}
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-text-tertiary" /> Joined {displayJoined}
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-text-tertiary" /> {user.email}
                </div>
              </div>
              
              <div className="flex gap-2">
                {user.social_github && (
                    <a href={user.social_github} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary hover:text-primary transition-colors">
                        <Github className="h-5 w-5" />
                    </a>
                )}
                {user.social_linkedin && (
                    <a href={user.social_linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary hover:text-primary transition-colors">
                        <Linkedin className="h-5 w-5" />
                    </a>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-3">About</h3>
                <p className="text-text-secondary dark:text-gray-400 leading-relaxed">
                  {displayBio}
                </p>
              </section>

              {user.skills && user.skills.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-text-primary dark:text-white mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map(skill => (
                        <Badge key={skill} variant="neutral" className="bg-gray-100 dark:bg-gray-800 text-text-secondary border-transparent">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </section>
              )}

              {/* Security Section (Only for Own Profile) */}
              {isOwnProfile && (
                  <section className="pt-6 border-t border-border-light dark:border-border-dark">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" /> Security & Active Sessions
                        </h3>
                        {sessions.length > 1 && (
                            <Button variant="outline" size="sm" onClick={handleRevokeAllOther} className="text-error hover:text-white hover:bg-error border-error/30 h-8 text-xs">
                                Sign Out All Other Devices
                            </Button>
                        )}
                    </div>

                   <div className="space-y-4">
                      {loadingSessions ? (
                         <div className="space-y-3">
                            {[1, 2].map(i => (
                               <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                            ))}
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 gap-4">
                            {sessions.map(session => (
                               <SessionCard 
                                  key={session.id} 
                                  session={session} 
                                  isCurrent={session.isCurrent}
                                  onRevoke={handleRevokeSession}
                                  loading={loadingSessions}
                               />
                            ))}
                            {sessions.length === 0 && !loadingSessions && (
                               <div className="text-center p-6 text-text-tertiary bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm">
                                  No active sessions found.
                               </div>
                            )}
                         </div>
                      )}
                   </div>
                  </section>
              )}

            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}