import { useSettings } from '../../context/SettingsContext';

export function CreateWorkspacePage() {
  const { settings } = useSettings();
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col md:flex-row font-sans text-text-primary transition-colors duration-300">
      
      {/* Left Column: Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12 bg-white dark:bg-surface-dark border-r border-border-light dark:border-border-dark">
        <div className="max-w-md mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-text-primary dark:text-white">{settings?.platform_name || 'Startup LaunchPad'}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary dark:text-white">Create Your Workspace</h1>
            <p className="text-text-secondary dark:text-gray-400">
              This workspace will hold your projects, team members, and financial tools.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            <Input 
              label="Workspace Name" 
              placeholder="e.g., Acme Corporation" 
              icon={Building2}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Organization Type</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  <Tag className="h-5 w-5" />
                </div>
                <select className="flex h-11 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none">
                  <option value="">Select an option</option>
                  <option value="startup">Startup</option>
                  <option value="agency">Agency</option>
                  <option value="sme">Small Business</option>
                  <option value="freelance">Freelancer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary dark:text-gray-300">Team Size</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  <Users className="h-5 w-5" />
                </div>
                <select className="flex h-11 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-background-dark dark:border-border-dark dark:text-white appearance-none">
                  <option value="">Select team size</option>
                  <option value="1-5">1–5</option>
                  <option value="6-10">6–10</option>
                  <option value="11-50">11–50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
            </div>

            <Link to="/dashboard">
                <Button className="w-full mt-4" size="lg">
                Create Workspace
                </Button>
            </Link>
          </form>

          <p className="text-xs text-center text-text-tertiary">
            By creating a workspace, you agree to our <Link to="/legal/terms" className="underline hover:text-primary">Terms</Link> and <Link to="/legal/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Right Column: Visual (Hidden on mobile) */}
      <div className="hidden md:flex w-1/2 bg-background-light dark:bg-background-dark items-center justify-center p-12 relative overflow-hidden">
        {/* Abstract shapes background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-md text-center space-y-8">
           <div className="relative">
             {/* Mockup of dashboard cards floating */}
             <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-xl border border-border-light dark:border-border-dark transform -rotate-3 hover:rotate-0 transition-transform duration-500">
               <div className="flex items-center gap-3 mb-4">
                 <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                   <Building2 className="h-6 w-6" />
                 </div>
                 <div className="text-left">
                   <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                   <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                 <div className="h-2 w-3/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
               </div>
             </div>
             
             <div className="absolute -bottom-6 -right-6 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-lg border border-border-light dark:border-border-dark transform rotate-3 hover:rotate-0 transition-transform duration-500 animate-pulse-slow">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-text-primary dark:text-white">Team Ready</div>
                </div>
             </div>
           </div>

           <div>
             <h3 className="text-2xl font-bold text-text-primary dark:text-white mb-2">Centralize Your Operations</h3>
             <p className="text-text-secondary dark:text-gray-400">
               Manage projects, finances, and hiring from a single, unified command center.
             </p>
           </div>
        </div>
      </div>

    </div>
  );
}