import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Linkedin,
  Github,
  Upload,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import { useCMSContent } from "../hooks/useCMSContent";

export function ContactPage() {
  const { settings } = useSettings();
  const contactEmail = settings?.support_email || "support@launchpad.com";
  const contactPhone = settings?.contact_phone || "+91 6353239217";

  const { SEO, loading } = useCMSContent("contact");

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-background-dark"></div>
    );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-background-dark font-sans text-[#1e293b] transition-colors duration-300 min-h-screen pt-20 pb-24">
      <SEO />

      {/* Header Section */}
      <Motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4 max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-[40px] md:text-[48px] font-bold tracking-tight text-[#0f172a] dark:text-white leading-tight">
          Contact and <span className="text-primary">Business Enquiries</span>
        </h1>
        <p className="mt-6 text-lg text-[#64748b] dark:text-gray-400 leading-relaxed font-medium">
          Whether you're looking for support, partnership, or funding, our team
          is here to help you scale your vision.
        </p>
      </Motion.section>

      {/* Main Content Grid */}
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (8 cols) */}
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 space-y-8"
          >
            <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#e2e8f0] dark:border-border-dark">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white">
                  Submit a Request
                </h2>
                <p className="text-sm text-[#64748b] mt-2">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>
              </div>

              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <Motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                      FULL NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full h-12 px-4 rounded-xl bg-[#f8fafc] dark:bg-background-dark border border-[#e2e8f0] dark:border-border-dark focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      required
                    />
                  </Motion.div>
                  <Motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                      WORK EMAIL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      className="w-full h-12 px-4 rounded-xl bg-[#f8fafc] dark:bg-background-dark border border-[#e2e8f0] dark:border-border-dark focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      required
                    />
                  </Motion.div>
                  <Motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                      COMPANY <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Corp"
                      className="w-full h-12 px-4 rounded-xl bg-[#f8fafc] dark:bg-background-dark border border-[#e2e8f0] dark:border-border-dark focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      required
                    />
                  </Motion.div>
                  <Motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                      COUNTRY <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="United States"
                      className="w-full h-12 px-4 rounded-xl bg-[#f8fafc] dark:bg-background-dark border border-[#e2e8f0] dark:border-border-dark focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      required
                    />
                  </Motion.div>
                  <Motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                      PHONE{" "}
                      <span className="text-gray-400 capitalize">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-12 px-4 rounded-xl bg-[#f8fafc] dark:bg-background-dark border border-[#e2e8f0] dark:border-border-dark focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                    />
                  </Motion.div>
                  <Motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                      LINKEDIN{" "}
                      <span className="text-gray-400 capitalize">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="url"
                      placeholder="linkedin.com/in/jane-doe"
                      className="w-full h-12 px-4 rounded-xl bg-[#f8fafc] dark:bg-background-dark border border-[#e2e8f0] dark:border-border-dark focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                    />
                  </Motion.div>
                </div>

                <Motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                    PURPOSE OF CONTACT <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-12 px-4 appearance-none rounded-xl bg-[#f8fafc] dark:bg-background-dark border border-[#e2e8f0] dark:border-border-dark focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm pr-10"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a purpose...
                      </option>
                      <option value="support">Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="funding">Funding</option>
                      <option value="business">Business Communication</option>
                      <option value="technical">Technical Issues</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] pointer-events-none" />
                  </div>
                </Motion.div>

                <Motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                    MESSAGE <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Please describe your request in detail..."
                    className="w-full min-h-[160px] p-4 rounded-xl bg-[#f8fafc] dark:bg-background-dark border border-[#e2e8f0] dark:border-border-dark focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm resize-none"
                    required
                  />
                </Motion.div>

                <Motion.div variants={itemVariants} className="space-y-4">
                  <label className="text-[11px] font-bold text-[#64748b] dark:text-gray-500 uppercase tracking-wider">
                    ATTACHMENTS
                  </label>
                  <div className="border-2 border-dashed border-[#e2e8f0] dark:border-border-dark rounded-2xl p-10 text-center bg-[#f8fafc]/50 dark:bg-background-dark/50 hover:bg-white dark:hover:bg-background-dark hover:border-primary transition-all cursor-pointer group">
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-surface-dark shadow-sm border border-[#f1f5f9] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-[#0f172a] dark:text-gray-200">
                      Click to upload files
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </Motion.div>

                <Motion.div
                  variants={itemVariants}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-[#f8fafc] dark:bg-background-dark/50 border border-[#f1f5f9] dark:border-border-dark"
                >
                  <input
                    type="checkbox"
                    id="consent"
                    className="mt-1 h-4 w-4 rounded border-[#cbd5e1] text-primary focus:ring-primary"
                    required
                  />
                  <label
                    htmlFor="consent"
                    className="text-xs text-[#64748b] dark:text-gray-400 leading-normal"
                  >
                    I agree my message and details are used only for direct
                    response. We respect your privacy.
                  </label>
                </Motion.div>

                <Motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full h-14 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                >
                  Submit Request
                </Motion.button>
              </form>
            </div>
          </Motion.div>

          {/* Right Column: Sidebar (4 cols) */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Office Card */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-[#e2e8f0] dark:border-border-dark shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MapPin className="h-24 w-24 text-primary" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-4">
                Our Office
              </h3>
              <p className="text-sm text-[#64748b] dark:text-gray-400 leading-relaxed font-medium">
                1076, the palladium mall, Yogi Chowk Ground, Chikuwadi, Yogi
                Chowk, Surat, Gujarat 395011
              </p>
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-border-dark">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3">
                  OPERATING HOURS
                </p>
                <div className="flex justify-between items-center text-sm font-bold text-[#475569] dark:text-gray-300">
                  <span>Mon - Sat</span>
                  <span className="text-primary">9:00 AM - 7:00 PM</span>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <a
              href={`mailto:${contactEmail}`}
              className="block bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-[#e2e8f0] dark:border-border-dark shadow-sm hover:border-primary transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <Mail className="h-6 w-6" />
                </div>
                <ExternalLink className="h-4 w-4 text-[#94a3b8] group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-2">
                Email Us
              </h3>
              <p className="text-sm font-bold text-primary truncate">
                {contactEmail}
              </p>
            </a>

            {/* Support Card */}
            <a
              href={`tel:${contactPhone}`}
              className="block bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-[#e2e8f0] dark:border-border-dark shadow-sm hover:border-primary transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                  <Phone className="h-6 w-6" />
                </div>
                <ExternalLink className="h-4 w-4 text-[#94a3b8] group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-2">
                Call Support
              </h3>
              <p className="text-sm font-bold text-primary">{contactPhone}</p>
            </a>

            {/* Social Links */}
            <div className="p-8 rounded-[32px] bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30 text-[#0f172a] dark:text-white relative overflow-hidden group">
              {/* Decorative elements */}
              <Motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 h-40 w-40 bg-primary/10 rounded-full blur-[60px]"
              />
              <Motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  translateX: [0, 20, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -left-10 h-32 w-32 bg-blue-400/10 rounded-full blur-[50px]"
              />

              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6 relative z-10">
                FOLLOW OUR JOURNEY
              </p>
              <div className="flex gap-4 relative z-10">
                {[
                  { icon: Linkedin, href: settings?.linkedin_url || "#" },
                  { icon: Twitter, href: settings?.twitter_url || "#" },
                  { icon: Facebook, href: settings?.facebook_url || "#" },
                  { icon: Github, href: settings?.github_url || "#" },
                ].map((social, idx) => (
                  <Motion.a
                    key={idx}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    href={social.href}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm shadow-sm border border-blue-100 dark:border-border-dark text-[#64748b] hover:text-primary hover:border-primary transition-all"
                  >
                    <social.icon className="h-4 w-4" />
                  </Motion.a>
                ))}
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
