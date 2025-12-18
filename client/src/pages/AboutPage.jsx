import React from 'react';
import { Lightbulb, Target, Users, Rocket, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Card } from '../components/ui/Card';

const TEAM = [
  { name: "Raj Savsaiya", role: "Cross Platfrom Developer (TL)", img: "https://placehold.co/150" },
  { name: "Sahil Ahuja", role: "Frontend Architect", img: "https://placehold.co/150" },
  { name: "Amaankhan Pathan", role: "App Developer", img: "https://placehold.co/150" },
  { name: "Vrushti Chopda", role: "Backend Developer", img: "https://placehold.co/150" },
  { name: "Radhika Parmar", role: "QA Specialist", img: "https://placehold.co/150" },
];

const VALUES = [
  { icon: Lightbulb, title: "Innovation", desc: "Pushing boundaries to solve real founder problems." },
  { icon: Target, title: "Clarity", desc: "Simplicity drives better decisions and faster execution." },
  { icon: Users, title: "Collaboration", desc: "Great products come from strong teams working closely together." },
  { icon: ShieldCheck, title: "Transparency", desc: "Openness builds trust internally and with customers." },
  { icon: Rocket, title: "Efficiency", desc: "Every feature is designed to save founders time and effort." },
  { icon: HeartHandshake, title: "Reliability", desc: "A platform you can trust with your startup's lifeline." },
];

export function AboutPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-text-primary transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent -z-10"></div>
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Our Mission</p>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary dark:text-white mb-8 leading-tight">
            Empowering the next generation of <span className="text-primary">Indian Unicorns.</span>
          </h1>
          <p className="text-xl text-text-secondary dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Startup LaunchPad was born from a simple observation: 90% of startups fail not because of bad ideas, but because of operational chaos. We exist to close the gap between vision and execution.
          </p>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2340&auto=format&fit=crop" 
              alt="Team working on whiteboard" 
              className="relative rounded-2xl shadow-2xl border border-border-light dark:border-border-dark"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-text-primary dark:text-white mb-6">Bridging the "Context Gap"</h2>
            <div className="space-y-6 text-lg text-text-secondary dark:text-gray-400">
              <p>
                Early-stage founders are often overwhelmed. They juggle project management in one tool, finances in a spreadsheet, and hiring on a third platform.
              </p>
              <p>
                This fragmentation drains cognitive resources. Startup LaunchPad unifies these three critical pillars—<strong>Operations, Finance, and Talent</strong>—into a single operating system.
              </p>
              <p>
                Built under the guidance of <strong>Prof. Jay Parmar</strong>, our platform is designed for the "product-rich but process-poor" founder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary dark:text-white">Our Core Values</h2>
            <p className="mt-4 text-text-secondary">The principles that guide how we build and support founders.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VALUES.map((val, idx) => (
              <Card key={idx} className="p-8 hover:-translate-y-1 transition-transform duration-300 border-border-light dark:border-border-dark">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <val.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">{val.title}</h3>
                <p className="text-text-secondary dark:text-gray-400">{val.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary dark:text-white mb-6">Meet the Builders</h2>
          <p className="text-lg text-text-secondary mb-16 max-w-2xl mx-auto">
            A passionate team of engineers and designers from Parul University, dedicated to solving the startup failure paradox.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {TEAM.map((member, idx) => (
              <div key={idx} className="group flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-surface-dark shadow-lg relative z-10"
                  />
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}